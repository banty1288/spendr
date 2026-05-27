import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { fetchUserAchievements, unlockUserAchievement } from "../lib/firebase/achievements";
import { buildAchievementStatuses } from "../services/achievements/badgeEngine";
import type { Transaction } from "../types/transaction";
import type { UserData } from "../types/user";
import type { AchievementStatus, UserAchievementRecord } from "../types/achievement";
import { useRewards } from "./useRewards";
import { REWARD_ICONS } from "../services/rewards/xpEngine";

export const achievementsQueryKey = (uid?: string) => ["userAchievements", uid] as const;

const EMPTY_RECORDS: UserAchievementRecord[] = [];

export function useAchievements(
  transactions: Transaction[],
  userData: UserData | null
) {
  const user = useAuthStore((state) => state.user);
  const uid = user?.uid;
  const queryClient = useQueryClient();
  const { logReward } = useRewards();
  const [pendingUnlocks, setPendingUnlocks] = useState<AchievementStatus[]>([]);
  const attemptedUnlocks = useRef(new Set<string>());

  const achievementQuery = useQuery({
    queryKey: achievementsQueryKey(uid),
    queryFn: () => fetchUserAchievements(uid!),
    enabled: !!uid,
    staleTime: 1000 * 60 * 2,
  });

  const earnedRecords = achievementQuery.data ?? EMPTY_RECORDS;

  const statuses = useMemo(
    () => buildAchievementStatuses(transactions, userData, earnedRecords),
    [transactions, userData, earnedRecords]
  );

  const unlockMutation = useMutation({
    mutationFn: (achievement: AchievementStatus) =>
      unlockUserAchievement(uid!, {
        id: achievement.id,
        title: achievement.title,
        rarity: achievement.rarity,
        rewardXp: achievement.rewardXp,
        unlockedAt: new Date().toISOString(),
      }),
    onSuccess: (_, achievement) => {
      if (uid) {
        queryClient.invalidateQueries({ queryKey: achievementsQueryKey(uid) });
        logReward({
          type: "achievement",
          title: "Badge Unlocked!",
          subtitle: achievement.title,
          xp: achievement.rewardXp,
          icon: REWARD_ICONS.achievement,
        });
      }
    },
  });

  useEffect(() => {
    if (!uid || !userData || achievementQuery.isLoading) return;

    const newUnlocks = statuses.filter(
      (status) => status.earned && !earnedRecords.some((record) => record.id === status.id)
    );

    newUnlocks.forEach((achievement) => {
      if (attemptedUnlocks.current.has(achievement.id)) return;
      attemptedUnlocks.current.add(achievement.id);
      setPendingUnlocks((prev) => [...prev, achievement]);
      unlockMutation.mutate(achievement);
    });
  }, [statuses, uid, userData, earnedRecords, achievementQuery.isLoading, unlockMutation.mutate]);

  const recentUnlocked = useMemo(
    () =>
      statuses
        .filter((status) => status.earned)
        .sort((a, b) => {
          const aTime = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0;
          const bTime = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0;
          return bTime - aTime;
        })
        .slice(0, 4),
    [statuses]
  );

  const openUnlocks = useMemo(
    () => pendingUnlocks.filter((unlock) => !earnedRecords.some((record) => record.id === unlock.id)),
    [pendingUnlocks, earnedRecords]
  );

  return {
    statuses,
    recentUnlocked,
    openUnlocks,
    isLoading: achievementQuery.isLoading || unlockMutation.isPending,
    isError: achievementQuery.isError,
    onClearUnlocks: () => setPendingUnlocks([]),
  };
}
