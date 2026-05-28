import { getDocs, limit, orderBy, query } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../firebase";
import { userRewardsRef } from "./paths";
import type { RewardEvent } from "../../types/reward";

export async function fetchUserRewards(uid: string, limitCount = 50): Promise<RewardEvent[]> {
  const q = query(
    userRewardsRef(uid),
    orderBy("timestamp", "desc"),
    limit(limitCount)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate().toISOString() || new Date().toISOString(),
  })) as RewardEvent[];
}

export async function logUserReward(uid: string, reward: Omit<RewardEvent, "id" | "timestamp">): Promise<RewardEvent> {
  const auth = getAuth(app);
  const currentUser = auth.currentUser;
  
  if (!currentUser) throw new Error("Must be logged in to claim rewards");
  
  const idToken = await currentUser.getIdToken();
  const baseUrl = import.meta.env.VITE_API_URL || 'https://spendr-main.vercel.app';
  
  const response = await fetch(`${baseUrl}/api/logReward`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify(reward)
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Failed to log reward");
  }

  return response.json();
}
