import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { useOnboardingCompleted } from "./useUserData";
import { useTransactions } from "./useTransactions";
import {
  buildEmotionalInsightsPreview,
  getStoredEmotionalSpendingInsights,
  runEmotionalSpendingInsights,
} from "../services/ai/emotionalGateway";
import { toSafeAiError } from "../services/ai/errors";

export const emotionalInsightsQueryKey = (uid?: string) =>
  ["emotionalInsights", uid] as const;

export function useEmotionalInsights() {
  const uid = useAuthStore((state) => state.user?.uid);
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const { isCompleted, isLoading: onboardingLoading, userData } =
    useOnboardingCompleted();
  const { transactions, isLoading: txLoading } = useTransactions();

  const query = useQuery({
    queryKey: emotionalInsightsQueryKey(uid),
    queryFn: async () => {
      if (!uid) return null;
      return getStoredEmotionalSpendingInsights(uid);
    },
    enabled: !!uid,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const preview = useMemo(() => {
    if (!userData || transactions.length === 0) return null;
    return buildEmotionalInsightsPreview(userData, transactions);
  }, [userData, transactions]);

  const runAnalysis = useCallback(
    async (options?: { force?: boolean }) => {
      if (!uid) throw new Error("Sign in to analyze emotional spending.");
      setGenerating(true);
      try {
        const result = await runEmotionalSpendingInsights({
          uid,
          userData,
          transactions,
          force: options?.force,
        });
        queryClient.setQueryData(emotionalInsightsQueryKey(uid), result);
        return result;
      } catch (err) {
        throw toSafeAiError(err);
      } finally {
        setGenerating(false);
      }
    },
    [uid, userData, transactions, queryClient]
  );

  const insights = query.data ?? preview;

  return {
    insights,
    storedInsights: query.data,
    preview,
    isLoading: query.isLoading || onboardingLoading || txLoading,
    isGenerating: generating,
    isError: query.isError,
    error: query.error,
    canRun: !!uid && isCompleted && transactions.length > 0 && !onboardingLoading,
    runAnalysis,
  };
}
