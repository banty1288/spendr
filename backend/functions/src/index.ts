import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { GoogleAuth } from "google-auth-library";
import { VertexAI } from "@google-cloud/vertexai";
import { z } from "zod";
import { Redis } from "@upstash/redis";

admin.initializeApp();

// Hardcoded for simplicity as per existing pattern
const PROJECT_ID = "spendr-app-85a7b";
const LOCATION = "us-central1";

// Optional Upstash Redis for rate limiting
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

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
    
    const vertex_ai = new VertexAI({ project: PROJECT_ID, location: LOCATION });
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
    const newsApiKey = process.env.NEWS_API_KEY || "news-9487fe88f6ed4babae2d446724e44c5c";
    let articles = [];
    try {
      const response = await fetch(`https://newsapi.org/v2/top-headlines?category=business&language=en&pageSize=10&apiKey=${newsApiKey}`);
      if (response.ok) {
        const json = await response.json();
        articles = json.articles || [];
      }
    } catch (e) {
      console.error("News fetch error", e);
    }

    // 2. Add AI Tip
    let aiTip = null;
    try {
      const vertex_ai = new VertexAI({ project: PROJECT_ID, location: LOCATION });
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
    }

    if (aiTip) articles.unshift(aiTip);
    return { articles };
  } catch (error: any) {
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// 4. Generate AI Budget (Migrated from Vercel)
export const generateBudget = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
  }

  const requestSchema = z.object({
    month: z.string(),
    transactions: z.array(z.any()),
    income: z.number(),
    currency: z.string(),
  });

  const parseResult = requestSchema.safeParse(data);
  if (!parseResult.success) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid payload", parseResult.error.format());
  }

  try {
    const { month, transactions, income, currency } = parseResult.data;
    
    const vertex_ai = new VertexAI({ project: PROJECT_ID, location: LOCATION });
    const generativeModel = vertex_ai.preview.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: "You are a financial AI. Output strictly valid JSON without markdown wrapping. The JSON must have: `totalBudgetLimit` (number), `healthScore` (0-100), `savingGoalSuggestion` (number), `aiExplanation` (string explaining insights, actionable tips), and `categories` (array of objects with `categoryId`, `recommendedLimit`, and `currentSpending`).",
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    });

    const prompt = `Analyze this data and create a budget for ${month}. Currency is ${currency}. Income: ${income}. Transactions: ${JSON.stringify(transactions.map((t: any) => ({
      amount: t.amount, categoryId: t.categoryId, date: t.date, type: t.type
    })))}`;

    const result = await generativeModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const text = result.response?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text?.trim()) throw new Error('Empty response');
    
    const budget = JSON.parse(text);
    return { budget };

  } catch (error: any) {
    console.error('[AI Budget Error]', error);
    throw new functions.https.HttpsError("internal", error.message || "Failed to generate budget");
  }
});

// 5. Log Reward Securely (Migrated from Vercel)
export const logReward = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
  }

  const rewardSchema = z.object({
    type: z.string().min(1).max(50),
    title: z.string().min(1).max(100),
    subtitle: z.string().max(200).optional().default(''),
    xp: z.number().int().min(0).max(1000),
    icon: z.string().max(10).optional().default('✨'),
  });

  const parseResult = rewardSchema.safeParse(data);
  if (!parseResult.success) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid payload", parseResult.error.format());
  }

  const uid = context.auth.uid;
  const rewardData = parseResult.data;

  try {
    // Distributed Rate Limiting to Prevent Farming
    if (redis) {
      const cooldownKey = `reward_cooldown:${uid}:${rewardData.type}`;
      const isCoolingDown = await redis.get(cooldownKey);
      
      if (isCoolingDown) {
        throw new functions.https.HttpsError("resource-exhausted", "Too many requests. Please wait before earning this reward again.");
      }
      
      // Set cooldown lock (1 minute)
      await redis.set(cooldownKey, 'locked', { ex: 60 });
    } else {
      console.warn('WARNING: Redis not configured. Reward throttling is bypassed.');
    }

    // Securely Write to Firestore bypassing Client Rules
    const db = admin.firestore();
    const docRef = await db.collection('users').doc(uid).collection('rewards').add({
      ...rewardData,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { 
      success: true, 
      id: docRef.id,
      ...rewardData,
      timestamp: new Date().toISOString()
    };

  } catch (error: any) {
    console.error('[Reward API Error]', error);
    if (error.code === 'resource-exhausted') throw error;
    throw new functions.https.HttpsError("internal", "Failed to log reward safely");
  }
});
