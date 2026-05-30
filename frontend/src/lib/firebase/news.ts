import {
  collection,
  doc,
  getDocs,
  query,
  orderBy,
  limit,
  setDoc,
  deleteDoc,
  getDoc,
  increment,
  updateDoc
} from "firebase/firestore";
import { db } from "../firebase";
import { FeedItem } from "../../types/news";

const NEWS_COLLECTION = "financialNews";
const TIPS_COLLECTION = "dailyTips";
const LIKES_COLLECTION = "likes";

export async function getFeedItems(): Promise<FeedItem[]> {
  // To simulate a combined feed from multiple sources, we'll fetch from both
  // and interleave them. In a real app, a backend cron would populate a single feed collection.
  
  const newsRef = collection(db, NEWS_COLLECTION);
  const tipsRef = collection(db, TIPS_COLLECTION);
  
  const qNews = query(newsRef, orderBy("publishedAt", "desc"), limit(10));
  const qTips = query(tipsRef, orderBy("publishedAt", "desc"), limit(10));

  const [newsSnap, tipsSnap] = await Promise.all([getDocs(qNews), getDocs(qTips)]);
  
  const items: FeedItem[] = [];
  
  newsSnap.forEach(doc => {
    items.push({ id: doc.id, ...doc.data() } as FeedItem);
  });
  
  tipsSnap.forEach(doc => {
    items.push({ id: doc.id, ...doc.data() } as FeedItem);
  });

  // Sort combined by date desc
  items.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  
  return items;
}

export async function toggleLike(userId: string, itemId: string, itemType: "news" | "tip"): Promise<boolean> {
  const likeId = `${userId}_${itemId}`;
  const likeRef = doc(db, LIKES_COLLECTION, likeId);
  const likeSnap = await getDoc(likeRef);
  
  const collectionName = itemType === "news" ? NEWS_COLLECTION : TIPS_COLLECTION;
  const itemRef = doc(db, collectionName, itemId);

  if (likeSnap.exists()) {
    // Unlike
    await deleteDoc(likeRef);
    await updateDoc(itemRef, { likesCount: increment(-1) });
    return false;
  } else {
    // Like
    await setDoc(likeRef, {
      userId,
      itemId,
      createdAt: new Date().toISOString()
    });
    await updateDoc(itemRef, { likesCount: increment(1) });
    return true;
  }
}

export async function hasUserLiked(userId: string, itemId: string): Promise<boolean> {
  const likeId = `${userId}_${itemId}`;
  const likeRef = doc(db, LIKES_COLLECTION, likeId);
  const likeSnap = await getDoc(likeRef);
  return likeSnap.exists();
}
