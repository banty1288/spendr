import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";

admin.initializeApp();

// Initialize Gemini with the API key from Firebase config
// using v2 param configuration for secrets
const geminiApiKey = functions.params.defineString("GEMINI_API_KEY");

export const generateInsight = functions.https.onCall(
  {
    cors: true,
    region: "us-central1",
    secrets: [], // We'll just use param for now, could use Secret Manager
  },
  async (request) => {
    // 1. Validate Authentication
    if (!request.auth || !request.auth.uid) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "You must be signed in to generate AI insights."
      );
    }

    const { uid } = request.auth;
    const { prompt, temperature = 0.7, jsonResponse = false, analysisType } = request.data;

    if (!prompt || typeof prompt !== "string") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "A valid prompt string must be provided."
      );
    }

    // 2. Simple Rate Limiting (using Firestore)
    const db = admin.firestore();
    const rateLimitRef = db.collection("ai_rate_limits").doc(uid);
    
    try {
      await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(rateLimitRef);
        const now = Date.now();
        const ONE_MINUTE = 60 * 1000;
        const MAX_REQUESTS = 10; // Max 10 requests per minute

        if (!doc.exists) {
          transaction.set(rateLimitRef, {
            count: 1,
            windowStart: now,
          });
        } else {
          const data = doc.data()!;
          if (now - data.windowStart > ONE_MINUTE) {
            // Reset window
            transaction.set(rateLimitRef, {
              count: 1,
              windowStart: now,
            });
          } else {
            if (data.count >= MAX_REQUESTS) {
              throw new functions.https.HttpsError(
                "resource-exhausted",
                "Rate limit exceeded. Please try again later."
              );
            }
            transaction.update(rateLimitRef, {
              count: data.count + 1,
            });
          }
        }
      });
    } catch (error) {
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      console.error("Rate limiting error:", error);
      throw new functions.https.HttpsError("internal", "Rate limiting failed.");
    }

    // 3. Call Gemini
    try {
      const apiKey = geminiApiKey.value();
      if (!apiKey) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "Gemini API key is not configured."
        );
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Use the stable model
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          temperature,
          ...(jsonResponse ? { responseMimeType: "application/json" } : {}),
        },
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      if (!text?.trim()) {
        throw new functions.https.HttpsError(
          "internal",
          "Gemini returned an empty response."
        );
      }

      // Log success (without exposing PII)
      console.log(`[AI Success] Generated ${analysisType || 'insight'} for UID: ${uid}`);

      return { text };
    } catch (error) {
      console.error("[AI Error]", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to generate AI insights."
      );
    }
  }
);
