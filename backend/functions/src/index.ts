import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { GoogleAuth } from "google-auth-library";
import { VertexAI } from "@google-cloud/vertexai";

admin.initializeApp();

// 1. Generate Voice Token (OAuth Access Token for Vertex AI)
export const getVoiceToken = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
  }

  try {
    const auth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    if (!accessToken.token) {
      throw new Error("Failed to get access token");
    }

    return { token: accessToken.token };
  } catch (error: any) {
    console.error("Error generating token:", error);
    throw new functions.https.HttpsError("internal", error.message || "Failed to generate token");
  }
});

// 2. Generate Insight (using Vertex AI)
export const generateInsight = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
  }

  try {
    const { prompt, temperature = 0.7, jsonResponse = false } = data;
    
    // Hardcode project and location for simplicity
    const vertex_ai = new VertexAI({ project: "spendr-app-85a7b", location: "us-central1" });
    const generativeModel = vertex_ai.preview.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature,
        ...(jsonResponse ? { responseMimeType: "application/json" } : {})
      },
    });

    const resp = await generativeModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const text = resp.response?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error("Empty response");
    }

    return { text };
  } catch (error: any) {
    console.error("Error generating insight:", error);
    throw new functions.https.HttpsError("internal", error.message || "Failed to generate insight");
  }
});

// 3. Get Personalized Feed
export const getPersonalizedFeed = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
  }

  try {
    // 1. Fetch News
    const newsApiKey = "news-9487fe88f6ed4babae2d446724e44c5c";
    let articles = [];
    try {
      const response = await fetch(`https://newsapi.org/v2/top-headlines?category=business&language=en&pageSize=10&apiKey=${newsApiKey}`);
      if (response.ok) {
        const data = await response.json();
        articles = data.articles || [];
      }
    } catch (e) {
      console.error("News fetch error", e);
    }

    // 2. Add AI Tip
    let aiTip = null;
    try {
      const vertex_ai = new VertexAI({ project: "spendr-app-85a7b", location: "us-central1" });
      const generativeModel = vertex_ai.preview.getGenerativeModel({ model: "gemini-2.5-flash" });
      const resp = await generativeModel.generateContent({
        contents: [{ role: "user", parts: [{ text: "Give me one very short, snappy, extremely actionable financial tip (max 1 sentence) about saving money or investing. Format as a string, no markdown." }] }],
      });
      const text = resp.response?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        aiTip = {
          id: "ai-tip-daily",
          title: "🤖 AI Financial Tip",
          description: text.trim(),
          url: "#",
          urlToImage: "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?q=80&w=2071&auto=format&fit=crop",
          publishedAt: new Date().toISOString(),
          source: { id: "spendr-ai", name: "Spendr AI" },
          isAITip: true
        };
      }
    } catch (e) {
      console.error("AI Tip error", e);
      aiTip = {
        id: "ai-tip-fallback",
        title: "💡 Daily Money Rule",
        description: "Remember the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings.",
        url: "#",
        urlToImage: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2071&auto=format&fit=crop",
        publishedAt: new Date().toISOString(),
        source: { id: "spendr", name: "Spendr Tip" },
        isAITip: true
      };
    }

    if (aiTip) articles.unshift(aiTip);
    return { articles };
  } catch (error: any) {
    throw new functions.https.HttpsError("internal", error.message);
  }
});
