import { getDocs, limit, orderBy, query } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { app, functions } from "../firebase";
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
  
  const logRewardFn = httpsCallable(functions, "logReward");
  
  try {
    const result = await logRewardFn(reward);
    return result.data as RewardEvent;
  } catch (err: any) {
    throw new Error(err.message || "Failed to log reward");
  }
}
