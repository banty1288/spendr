import admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Redis } from '@upstash/redis';
import { z } from 'zod';

const requestSchema = z.object({
  month: z.string(),
  transactions: z.array(z.any()),
  income: z.number(),
  currency: z.string(),
});

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'spendr-app-85a7b'
  });
}

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;
const memoryRateLimit = new Map<string, { count: number, timestamp: number }>();
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS = 5;

export default async function handler(req: any, res: any) {
  const isDev = process.env.NODE_ENV !== 'production';
  const allowedOrigins = [
    'https://spendr-main.vercel.app', 
    'https://spendr-app-85a7b.web.app', 
    'capacitor://localhost'
  ];
  if (isDev) {
    allowedOrigins.push('http://localhost:5173', 'https://localhost');
  }

  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (tokenError) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    const uid = decodedToken.uid;
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const rateLimitKey = `rate_limit_budget:${uid}:${ip}`;
    
    if (redis) {
      const current = await redis.incr(rateLimitKey);
      if (current === 1) await redis.expire(rateLimitKey, 60);
      if (current > MAX_REQUESTS) return res.status(429).json({ error: 'Rate limit exceeded.' });
    } else {
      const now = Date.now();
      const userRateData = memoryRateLimit.get(rateLimitKey) || { count: 0, timestamp: now };
      if (now - userRateData.timestamp > RATE_LIMIT_WINDOW_MS) {
        userRateData.count = 1;
        userRateData.timestamp = now;
      } else {
        userRateData.count += 1;
        if (userRateData.count > MAX_REQUESTS) return res.status(429).json({ error: 'Rate limit exceeded.' });
      }
      memoryRateLimit.set(rateLimitKey, userRateData);
    }

    const parseResult = requestSchema.safeParse(req.body);
    if (!parseResult.success) return res.status(400).json({ error: 'Bad Request', details: parseResult.error.format() });

    const { month, transactions, income, currency } = parseResult.data;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Server configuration error' });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: "You are a financial AI. Output strictly valid JSON without markdown wrapping. The JSON must have: `totalBudgetLimit` (number), `healthScore` (0-100), `savingGoalSuggestion` (number), `aiExplanation` (string explaining insights, actionable tips like 'Your food spending increased 18%... Reducing it could increase savings...'), and `categories` (array of objects with `categoryId`, `recommendedLimit`, and `currentSpending`).",
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    });

    const prompt = `Analyze this data and create a budget for ${month}. Currency is ${currency}. Income: ${income}. Transactions: ${JSON.stringify(transactions.map((t: any) => ({
      amount: t.amount, categoryId: t.categoryId, date: t.date, type: t.type
    })))}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    if (!text?.trim()) throw new Error('Empty response');
    const budget = JSON.parse(text);

    return res.status(200).json({ budget });

  } catch (error: any) {
    console.error('[AI Budget Error]', error);
    return res.status(500).json({ error: 'Failed to generate budget' });
  }
}
