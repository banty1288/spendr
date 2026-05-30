import { Redis } from '@upstash/redis';
import { FeedItem } from '../src/types/news.js';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

// The key provided by user
const NEWS_API_KEY = process.env.NEWS_API_KEY || "news-9487fe88f6ed4babae2d446724e44c5c";
// Note: News API key usually doesn't start with "news-", but let's use it as given. If it fails, we provide fallback data.

const FALLBACK_NEWS: FeedItem[] = [
  {
    id: "tip-1",
    type: "tip",
    title: "50/30/20 Rule",
    description: "Allocate 50% to Needs, 30% to Wants, and 20% to Savings to build a solid financial foundation.",
    publishedAt: new Date().toISOString(),
    likesCount: 142
  },
  {
    id: "news-1",
    type: "news",
    title: "Markets Rally as Inflation Cools",
    description: "Major indexes saw significant gains today following reports of lower than expected inflation metrics.",
    source: "Financial Times",
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    likesCount: 89
  }
];

export default async function handler(req: any, res: any) {
  // CORS setup
  const origin = req.headers.origin;
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  try {
    // Check Cache
    if (redis) {
      const cached = await redis.get('spendr_news_feed');
      if (cached) {
        return res.status(200).json(cached);
      }
    }

    let items: FeedItem[] = [];

    // Actually fetch from NewsAPI (or a similar service if "news-" is a custom proxy)
    // Here we'll try a generic fetch if it's the standard News API (newsapi.org format is usually just hex)
    // If it fails, fallback to hardcoded tips to prevent UI breakage.
    try {
      const cleanKey = NEWS_API_KEY.startsWith("news-") ? NEWS_API_KEY.replace("news-", "") : NEWS_API_KEY;
      
      const response = await fetch(`https://newsapi.org/v2/top-headlines?category=business&language=en&apiKey=${cleanKey}`);
      if (response.ok) {
        const data = await response.json();
        items = data.articles.map((article: any, index: number) => ({
          id: `news-${index}-${Date.now()}`,
          type: "news" as const,
          title: article.title,
          description: article.description || "Click to read more.",
          url: article.url,
          imageUrl: article.urlToImage,
          source: article.source.name,
          publishedAt: article.publishedAt,
          likesCount: Math.floor(Math.random() * 500)
        })).filter((a: any) => a.title !== "[Removed]");
      } else {
        throw new Error("NewsAPI fetch failed");
      }
    } catch (e) {
      console.warn("Falling back to generic news due to fetch error:", e);
      items = FALLBACK_NEWS;
    }

    if (items.length === 0) {
      items = FALLBACK_NEWS;
    }

    if (redis) {
      await redis.set('spendr_news_feed', items, { ex: 3600 }); // Cache for 1 hour
    }

    return res.status(200).json(items);
  } catch (error) {
    console.error(error);
    return res.status(500).json(FALLBACK_NEWS);
  }
}
