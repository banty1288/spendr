import { GoogleGenerativeAI } from "@google/generative-ai";
import { FeedItem } from "../src/types/news.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const NEWS_API_KEY = process.env.NEWS_API_KEY || "news-9487fe88f6ed4babae2d446724e44c5c";

export default async function handler(req: any, res: any) {
  // CORS setup
  const origin = req.headers.origin;
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  try {
    const { 
      spendingHistory = [], 
      wellnessScore = 50 
    } = req.body || {};

    let newsItems: FeedItem[] = [];
    let tipItems: FeedItem[] = [];

    // 1. Fetch News
    try {
      const cleanKey = NEWS_API_KEY.startsWith("news-") ? NEWS_API_KEY.replace("news-", "") : NEWS_API_KEY;
      const response = await fetch(`https://newsapi.org/v2/top-headlines?category=business&language=en&apiKey=${cleanKey}`);
      if (response.ok) {
        const data = await response.json();
        newsItems = data.articles
          .filter((a: any) => a.title && a.title !== "[Removed]")
          .map((article: any, index: number) => ({
            id: `news-${index}-${Date.now()}`,
            type: "news" as const,
            title: article.title,
            description: article.description || "Click to read full article.",
            url: article.url,
            imageUrl: article.urlToImage,
            source: article.source?.name || "News",
            publishedAt: article.publishedAt,
            likesCount: Math.floor(Math.random() * 500)
          }))
          .slice(0, 5); // Limit to top 5 news
      }
    } catch (e) {
      console.error("News fetch error:", e);
    }

    // 2. Generate Tips via Gemini based on context
    try {
      if (process.env.GEMINI_API_KEY) {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `
        You are an expert AI financial coach for Spendr.
        The user has a Financial Wellness Score of ${wellnessScore}/100.
        Recent transactions: ${JSON.stringify(spendingHistory.slice(0, 5))}.
        
        Generate exactly 3 personalized, highly actionable, concise daily financial tips/challenges for this user.
        Return ONLY a JSON array of objects.
        Format:
        [
          {
            "title": "Short catchy title",
            "description": "2-3 sentences explaining the tip or challenge based on their data."
          }
        ]
        Do not use markdown blocks. Return purely the JSON array.
        `;

        const result = await model.generateContent(prompt);
        let text = result.response.text();
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        
        const parsedTips = JSON.parse(text);
        
        tipItems = parsedTips.map((tip: any, index: number) => ({
          id: `tip-${index}-${Date.now()}`,
          type: "tip" as const,
          title: tip.title,
          description: tip.description,
          source: "Spendr AI",
          publishedAt: new Date().toISOString(),
          likesCount: Math.floor(Math.random() * 100) + 10
        }));
      }
    } catch (e) {
      console.error("Gemini generation error:", e);
      // Fallback tip
      tipItems = [{
        id: "tip-fallback",
        type: "tip",
        title: "50/30/20 Rule",
        description: "Allocate 50% to Needs, 30% to Wants, and 20% to Savings to build a solid financial foundation.",
        source: "Spendr AI",
        publishedAt: new Date().toISOString(),
        likesCount: 142
      }];
    }

    // Interleave news and tips for the reels feed
    const combined: FeedItem[] = [];
    const maxLen = Math.max(newsItems.length, tipItems.length);
    for (let i = 0; i < maxLen; i++) {
      if (tipItems[i]) combined.push(tipItems[i]);
      if (newsItems[i]) combined.push(newsItems[i]);
    }

    // Default fallbacks if both failed
    if (combined.length === 0) {
      combined.push({
        id: "tip-fallback",
        type: "tip",
        title: "Track Everything",
        description: "The first step to financial freedom is knowing exactly where your money goes.",
        source: "Spendr AI",
        publishedAt: new Date().toISOString(),
        likesCount: 12
      });
    }

    return res.status(200).json(combined);
  } catch (error) {
    console.error(error);
    return res.status(500).json([]);
  }
}
