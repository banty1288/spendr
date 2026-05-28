import admin from 'firebase-admin';
import { Redis } from '@upstash/redis';
import { z } from 'zod';

// Zod Schema for Request Validation
const rewardSchema = z.object({
  type: z.string().min(1).max(50),
  title: z.string().min(1).max(100),
  subtitle: z.string().max(200).optional().default(''),
  xp: z.number().int().min(0).max(1000),
  icon: z.string().max(10).optional().default('✨'),
});

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'spendr-app-85a7b'
  });
}

// Initialize Upstash Redis
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

// Throttling configuration
const REWARD_COOLDOWN_MS = 60000; // 1 minute per reward type per user

export default async function handler(req: any, res: any) {
  // CORS Configuration
  const allowedOrigins = ['https://spendr-main.vercel.app', 'https://spendr-app-85a7b.web.app', 'http://localhost:5173'];
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
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    const uid = decodedToken.uid;

    // 2. Validate Payload
    const parseResult = rewardSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Bad Request', details: parseResult.error.format() });
    }

    const rewardData = parseResult.data;

    // 3. Distributed Rate Limiting to Prevent Farming
    if (redis) {
      const cooldownKey = `reward_cooldown:${uid}:${rewardData.type}`;
      const isCoolingDown = await redis.get(cooldownKey);
      
      if (isCoolingDown) {
        return res.status(429).json({ error: 'Too many requests. Please wait before earning this reward again.' });
      }
      
      // Set cooldown lock
      await redis.set(cooldownKey, 'locked', { ex: REWARD_COOLDOWN_MS / 1000 });
    } else {
      console.warn('WARNING: Redis not configured. Reward throttling is bypassed (INSECURE FOR PRODUCTION).');
    }

    // 4. Securely Write to Firestore bypassing Client Rules
    const db = admin.firestore();
    const docRef = await db.collection('users').doc(uid).collection('rewards').add({
      ...rewardData,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({ 
      success: true, 
      id: docRef.id,
      ...rewardData,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[Reward API Error]', error);
    return res.status(500).json({ error: 'Failed to log reward safely' });
  }
}
