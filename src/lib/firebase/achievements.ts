import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import type { UserAchievementRecord } from "../../types/achievement";
import { waitForFirestoreAuth } from "./assertAuth";
import { userAchievementRef, userAchievementsRef } from "./paths";

export async function fetchUserAchievements(
  uid: string
): Promise<UserAchievementRecord[]> {
  await waitForFirestoreAuth(uid);
  const snap = await getDocs(userAchievementsRef(uid));
  return snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<UserAchievementRecord, "id">),
  }));
}

export async function unlockUserAchievement(
  uid: string,
  achievement: Omit<UserAchievementRecord, "id"> & { id: string }
): Promise<UserAchievementRecord> {
  await waitForFirestoreAuth(uid);
  const ref = userAchievementRef(uid, achievement.id);
  const unlockedAt = achievement.unlockedAt ?? new Date().toISOString();

  await setDoc(
    ref,
    {
      id: achievement.id,
      unlockedAt,
      rarity: achievement.rarity,
      title: achievement.title,
      rewardXp: achievement.rewardXp,
    },
    { merge: true }
  );

  return {
    id: achievement.id,
    unlockedAt,
    rarity: achievement.rarity,
    title: achievement.title,
    rewardXp: achievement.rewardXp,
  };
}
