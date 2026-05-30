import { getAuth } from 'firebase-admin/auth';
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'spendr-app-85a7b'
  });
}

export default async function handler(req: any, res: any) {
  // CORS setup
  const origin = req.headers.origin;
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];
    await getAuth().verifyIdToken(token);

    // In a real production system, you'd vend a Google OAuth access token 
    // bound to a service account with Gemini access, or a securely scoped API key.
    // For this implementation, we return the Gemini API key to the authenticated client.
    const apiKey = process.env.GEMINI_API_KEY || (process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY);

    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured on server' });
    }

    return res.status(200).json({ token: apiKey });
  } catch (error) {
    console.error('Error vending voice token:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
