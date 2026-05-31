import { useQuery, useQueryClient } from "@tanstack/react-query";
import { generateDailyHubContent } from "../services/ai/dailyHub";
import { useTransactions } from "./useTransactions";
import { useAuthStore } from "../store/authStore";
import type { DailyHubContent } from "../services/ai/types";
import { AiError, toSafeAiError } from "../services/ai/errors";
import { useRef } from "react";

export function useDailyHubContent() {
  const uid = useAuthStore((s) => s.user?.uid);
  const { transactions } = useTransactions();
  const queryClient = useQueryClient();
  const inFlightRef = useRef(false);

  const queryKey = ["dailyHub", uid];

  const query = useQuery<DailyHubContent, Error>({
    queryKey,
    queryFn: async () => {
      if (!uid) throw new AiError("CONFIG", "Sign in required", false);
      inFlightRef.current = true;
      try {
        const result = await generateDailyHubContent(transactions);
        return result;
      } catch (err) {
        throw toSafeAiError(err);
      } finally {
        inFlightRef.current = false;
      }
    },
    enabled: !!uid,
    staleTime: 1000 * 60 * 60 * 4, // 4 hours
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 1,
  });

  const refresh = async () => {
    if (inFlightRef.current) return;
    await queryClient.invalidateQueries({ queryKey });
    await query.refetch();
  };

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refresh,
  };
}
