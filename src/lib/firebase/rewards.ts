import { addDoc, getDocs, limit, orderBy, query, serverTimestamp } from "firebase/firestore";
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
  const docRef = await addDoc(userRewardsRef(uid), {
    ...reward,
    timestamp: serverTimestamp(),
  });
  
  return {
    id: docRef.id,
    ...reward,
    timestamp: new Date().toISOString(),
  };
}
