import { NewsItem } from "./types";
import { formatDistanceToNow } from "date-fns";

export async function fetchFinancialNews(): Promise<NewsItem[]> {
  const apiKey = import.meta.env.VITE_NEWS_API_KEY;
  if (!apiKey) {
    console.warn("No NewsAPI key found, returning empty news list.");
    return [];
  }

  try {
    const res = await fetch(
      `https://newsapi.org/v2/top-headlines?category=business&country=us&apiKey=${apiKey}`
    );

    if (!res.ok) {
      console.warn("Failed to fetch from NewsAPI", res.status);
      return [];
    }

    const data = await res.json();
    if (!data.articles) return [];

    return data.articles
      .filter((article: any) => article.title && article.title !== "[Removed]")
      .slice(0, 10)
      .map((article: any) => {
        let timeLabel = "Recently";
        try {
          if (article.publishedAt) {
            timeLabel = formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true });
          }
        } catch (e) {
          // Ignore date parsing errors
        }

        return {
          title: article.title,
          source: article.source?.name || "News",
          time: timeLabel,
          description: article.description || "",
          url: article.url,
        };
      });
  } catch (err) {
    console.error("Error fetching financial news:", err);
    return [];
  }
}
