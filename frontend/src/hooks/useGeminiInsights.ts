import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { invalidateSpendrAnalysisCache } from "../services/ai/cache";
import {
  buildSpendrAnalysisFingerprint,
  getSpendrAnalysisFromCache,
} from "../services/ai/gateway";
import { generateSpendrAnalysis } from "../services/ai/insights";
import { AiError, toSafeAiError } from "../services/ai/errors";
import { useAuthStore } from "../store/authStore";
import { useOnboardingCompleted } from "./useUserData";
import { useTransactions } from "./useTransactions";
import { trackAiInsightGenerated } from "../services/analytics";
import type { SpendrAIAnalysis } from "../services/ai/types";

export const geminiInsightsQueryKey = (uid?: string) =>
  ["geminiInsights", uid] as const;

const fingerprintStorageKey = (uid: string) => `spendr-ai-last-fp:${uid}`;

/**
 * Manual-only Gemini insights — never auto-fetches on mount.
 * Only `runAnalysis()` triggers network (explicit user action).
 */
export function useGeminiInsights() {
  const uid = useAuthStore((s) => s.user?.uid);
  const queryClient = useQueryClient();
  const { isCompleted, isLoading: onboardingLoading, userData } =
    useOnboardingCompleted();
  const { transactions, isLoading: txLoading } = useTransactions();

  const [isStale, setIsStale] = useState(false);
  const lastRunFingerprint = useRef<string | null>(null);
  const inFlightRef = useRef(false);

  const transactionsRef = useRef(transactions);
  const userDataRef = useRef(userData);
  transactionsRef.current = transactions;
  userDataRef.current = userData;

  const fingerprint = useMemo(() => {
    if (!uid) return "";
    return buildSpendrAnalysisFingerprint(transactions, userData ?? null);
  }, [uid, transactions, userData]);

  const query = useQuery<SpendrAIAnalysis, Error>({
    queryKey: geminiInsightsQueryKey(uid),
    queryFn: async (): Promise<SpendrAIAnalysis> => {
      throw new Error("Gemini insights are manual-only. Call runAnalysis().");
    },
    enabled: false,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60,
    retry: false,
  });

  useEffect(() => {
    if (!uid) return;
    const stored = sessionStorage.getItem(fingerprintStorageKey(uid));
    if (stored) lastRunFingerprint.current = stored;
    if (stored && fingerprint && stored !== fingerprint) {
      setIsStale(true);
    }
  }, [uid, fingerprint]);

  useEffect(() => {
    if (!lastRunFingerprint.current || !fingerprint || !uid) return;
    if (fingerprint !== lastRunFingerprint.current) {
      setIsStale(true);
      invalidateSpendrAnalysisCache(uid);
    }
  }, [fingerprint, uid]);

  const hydrateFromMemoryCache = useCallback(() => {
    if (!uid) return null;
    const cached = getSpendrAnalysisFromCache(
      uid,
      transactionsRef.current,
      userDataRef.current ?? null
    );
    if (cached) {
      queryClient.setQueryData(geminiInsightsQueryKey(uid), cached);
    }
    return cached;
  }, [uid, queryClient]);

  const runAnalysis = useCallback(
    async (options?: { force?: boolean }) => {
      if (!uid) {
        throw new AiError("CONFIG", "Sign in to generate insights.", false);
      }
      if (inFlightRef.current) {
        throw new AiError(
          "API",
          "Analysis already in progress.",
          false
        );
      }
      if (onboardingLoading) {
        throw new AiError("API", "Still loading your profile…", true);
      }
      if (!isCompleted) {
        throw new AiError(
          "API",
          "Complete onboarding before generating AI insights.",
          false
        );
      }
      if (transactionsRef.current.length === 0) {
        throw new AiError(
          "EMPTY",
          "Add at least one transaction to generate AI insights.",
          false
        );
      }

      if (!options?.force) {
        const memoryCached = hydrateFromMemoryCache();
        if (memoryCached) {
          lastRunFingerprint.current = fingerprint;
          sessionStorage.setItem(fingerprintStorageKey(uid), fingerprint);
          setIsStale(false);
          return memoryCached;
        }
        const rqCached = queryClient.getQueryData(
          geminiInsightsQueryKey(uid)
        );
        if (rqCached) {
          lastRunFingerprint.current = fingerprint;
          setIsStale(false);
          return rqCached;
        }
      }

      inFlightRef.current = true;
      try {
        const result = await queryClient.fetchQuery({
          queryKey: geminiInsightsQueryKey(uid),
          queryFn: () =>
            generateSpendrAnalysis(
              uid,
              userDataRef.current ?? null,
              transactionsRef.current,
              { force: options?.force }
            ),
          staleTime: options?.force ? 0 : Infinity,
          retry: false,
        });

        lastRunFingerprint.current = fingerprint;
        sessionStorage.setItem(fingerprintStorageKey(uid), fingerprint);
        setIsStale(false);
        trackAiInsightGenerated();
        return result;
      } catch (err) {
        throw toSafeAiError(err);
      } finally {
        inFlightRef.current = false;
      }
    },
    [
      uid,
      fingerprint,
      isCompleted,
      onboardingLoading,
      queryClient,
      hydrateFromMemoryCache,
    ]
  );

  const isRunning = query.isFetching || inFlightRef.current;

  return {
    analysis: query.data,
    isLoading: isRunning,
    isFetching: isRunning,
    isError: query.isError,
    error: query.error,
    isStale,
    hasAnalysis: !!query.data,
    canRun:
      !!uid &&
      isCompleted &&
      !onboardingLoading &&
      transactions.length > 0 &&
      !isRunning,
    isBlockedByOnboarding: !!uid && !onboardingLoading && !isCompleted,
    isBlockedByTransactions:
      !!uid && isCompleted && !txLoading && transactions.length === 0,
    txLoading,
    onboardingLoading,
    runAnalysis,
    refetch: () => runAnalysis({ force: true }),
  };
}
