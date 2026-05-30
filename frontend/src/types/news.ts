export type FeedItemType = "news" | "tip";

export interface FeedItem {
  id: string;
  type: FeedItemType;
  title: string;
  description: string;
  imageUrl?: string;
  url?: string; // For news articles
  source?: string;
  publishedAt: string; // ISO String
  likesCount: number;
}

export interface LikeData {
  id: string;
  itemId: string;
  userId: string;
  createdAt: string;
}
