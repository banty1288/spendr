import { useCallback, useEffect, useState } from "react";
import type { WeeklyReport } from "../types/weeklyReport";
import { useAuthStore } from "../store/authStore";
import { useUserData } from "./useUserData";
import { useTransactions } from "./useTransactions";
import { generateWeeklyReport } from "../services/ai/weeklyGateway";
import { fetchLatestWeeklyReport, saveWeeklyReport, fetchWeeklyReports } from "../lib/firebase/weeklyReports";
import { AiError } from "../services/ai/errors";
import { startOfWeek, subWeeks, format } from "date-fns";

export function useWeeklyReport() {
  const auth = useAuthStore();
  const { userData, isLoading: userLoading } = useUserData();
  const { transactions, isLoading: txLoading } = useTransactions();
  
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [latestReport, setLatestReport] = useState<WeeklyReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const uid = auth.user?.uid;
  
  const isBlockedByOnboarding = !userData?.onboardingCompleted;
  const isBlockedByTransactions = (transactions?.length ?? 0) === 0;
  const canGenerate = uid && userData && (transactions?.length ?? 0) > 0;

  // Fetch latest report on mount
  useEffect(() => {
    if (!uid) return;

    async function loadLatestReport() {
      try {
        setIsFetching(true);
        setError(null);
        const report = await fetchLatestWeeklyReport(uid);
        setLatestReport(report);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load report"));
      } finally {
        setIsFetching(false);
      }
    }

    loadLatestReport();
  }, [uid]);

  // Generate a weekly report
  const generateReport = useCallback(
    async (force = false) => {
      if (!canGenerate || !uid) {
        throw new AiError(
          "INVALID",
          "Cannot generate report: missing user data or transactions",
          false
        );
      }

      setIsGenerating(true);
      setError(null);

      try {
        // Calculate week dates
        const today = new Date();
        const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
        const weekEnd = subWeeks(today, -1);
        const weekStartStr = format(weekStart, "yyyy-MM-dd");
        const weekEndStr = format(weekEnd, "yyyy-MM-dd");
        const periodLabel = format(weekStart, "MMM d") + " - " + format(weekEnd, "MMM d, yyyy");

        // Filter transactions for this week
        const weekTransactions = (transactions ?? []).filter((tx) => {
          const txDate = new Date(tx.date);
          return txDate >= weekStart && txDate <= weekEnd;
        });

        // Calculate previous week expenses
        const prevWeekStart = subWeeks(weekStart, 1);
        const prevWeekEnd = weekStart;
        const prevWeekTransactions = (transactions ?? []).filter((tx) => {
          const txDate = new Date(tx.date);
          return txDate >= prevWeekStart && txDate < prevWeekEnd;
        });
        const previousWeekExpenses = prevWeekTransactions
          .filter((tx) => tx.type === "expense")
          .reduce((sum, tx) => sum + tx.amount, 0);

        // Generate report
        const report = await generateWeeklyReport({
          uid,
          userData,
          transactions: weekTransactions.length > 0 ? weekTransactions : (transactions ?? []),
          weekStartDate: weekStartStr,
          weekEndDate: weekEndStr,
          periodLabel,
          previousWeekExpenses,
          force,
        });

        // Save to Firestore
        await saveWeeklyReport(uid, report);
        setLatestReport(report);

        return report;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to generate report");
        setError(error);
        throw error;
      } finally {
        setIsGenerating(false);
      }
    },
    [uid, userData, transactions, canGenerate]
  );

  // Fetch all reports
  const fetchAllReports = useCallback(async () => {
    if (!uid) return;

    try {
      setIsLoading(true);
      setError(null);
      const allReports = await fetchWeeklyReports(uid);
      setReports(allReports);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch reports"));
    } finally {
      setIsLoading(false);
    }
  }, [uid]);

  return {
    latestReport,
    reports,
    isLoading,
    isFetching,
    isGenerating,
    error,
    canGenerate,
    isBlockedByOnboarding,
    isBlockedByTransactions,
    generateReport,
    fetchAllReports,
  };
}
