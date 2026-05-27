import * as admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';


// Initialize Firebase Admin (only once per lambda invocation)
if (!admin.apps.length) {
  // For verifyIdToken, just the projectId is typically sufficient
  // We grab it from Vite's env vars since they are already available in Vercel
  admin.initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'spendr-app-85a7b'
  });
}

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 1. Verify Authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (tokenError) {
      console.error('Token verification failed:', tokenError);
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    const uid = decodedToken.uid;
    
    // 2. Validate Payload
    const { prompt, temperature = 0.7, jsonResponse = false, analysisType } = req.body || {};
    
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Bad Request: prompt string is required' });
    }

    // 3. Call Gemini
    // Note: User can configure GEMINI_API_KEY in Vercel project settings
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Missing Gemini API Key');
      return res.status(500).json({ error: 'Server Error: Gemini API Key not configured' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
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
      return res.status(500).json({ error: 'Server Error: Gemini returned an empty response' });
    }

    console.log(`[AI Success] Generated ${analysisType || 'insight'} for UID: ${uid}`);
    
    // 4. Return success
    return res.status(200).json({ text });

  } catch (error: any) {
    console.error('[AI Error]', error);
    return res.status(500).json({ error: 'Failed to generate AI insights', details: error.message });
  }
}
