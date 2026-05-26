import { useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { fetchUserFinancialLevel, upsertUserFinancialLevel } from "../lib/firebase/financialLevels";
import { buildFinancialLevelSummary } from "../services/levels/levelEngine";
import { useChallenges } from "./useChallenges";
import type { Transaction } from "../types/transaction";
import type { UserData } from "../types/user";
import type { AchievementStatus } from "../types/achievement";
import type { FinancialLevelSummary } from "../types/financialLevel";

export const financialLevelQueryKey = (uid?: string) => ["financialLevel", uid] as const;

export function useFinancialLevels(
  transactions: Transaction[],
  achievements: AchievementStatus[],
  userData: UserData | null
) {
  const user = useAuthStore((state) => state.user);
  const uid = user?.uid;
  const queryClient = useQueryClient();
  const { challenges } = useChallenges(userData, transactions);

  const query = useQuery({
    queryKey: financialLevelQueryKey(uid),
    queryFn: () => fetchUserFinancialLevel(uid!),
    enabled: !!uid,
    staleTime: 1000 * 60 * 2,
  });

  const summary = useMemo(
    () => buildFinancialLevelSummary(transactions, achievements, userData, challenges),
    [transactions, achievements, userData, challenges]
  );

  const mutation = useMutation({
    mutationFn: (levelSummary: FinancialLevelSummary) =>
      upsertUserFinancialLevel(uid!, levelSummary),
    onSuccess: (newSummary) => {
      queryClient.setQueryData(financialLevelQueryKey(uid), newSummary);
    },
  });

  useEffect(() => {
    if (!uid || query.isLoading || mutation.isLoading) return;

    const currentDoc = query.data;
    const shouldPersist =
      !currentDoc ||
      currentDoc.totalXp !== summary.totalXp ||
      currentDoc.currentLevel !== summary.currentLevel;

    if (shouldPersist) {
      mutation.mutate(summary);
    }
  }, [uid, query.isLoading, query.data, summary, mutation.mutate]);

  return {
    financialLevel: summary,
    isLoading: query.isLoading || mutation.isLoading,
    isError: query.isError,
  };
}
