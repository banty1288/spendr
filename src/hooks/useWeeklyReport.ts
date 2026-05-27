import { useCallback, useEffect, useState } from "react";
import type { WeeklyReport } from "../types/weeklyReport";
import { useAuthStore } from "../store/authStore";
import { useUserData } from "./useUserData";
import { useTransactions } from "./useTransactions";
import { generateWeeklyReport } from "../services/ai/weeklyGateway";
import { generateFallbackWeeklyReport } from "../services/ai/weeklyFallback";
import { fetchLatestWeeklyReport, saveWeeklyReport, fetchWeeklyReports } from "../lib/firebase/weeklyReports";
import { hasUndefinedValues } from "../services/ai/sanitizeReport";
import { AiError } from "../services/ai/errors";
import { startOfWeek, subWeeks, format } from "date-fns";

export function useWeeklyReport() {
  const auth = useAuthStore();
  const queryUserData = useUserData();
  const queryTransactions = useTransactions();
  
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [latestReport, setLatestReport] = useState<WeeklyReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const uid = auth.user?.uid;
  const userData = queryUserData.data;
  const transactions = queryTransactions.transactions ?? [];
  
  const isBlockedByOnboarding = userData ? !userData.onboardingCompleted : false;
  const isBlockedByTransactions = transactions.length === 0;
  const hasMinimalData = transactions.length >= 1;
  const hasGoodData = transactions.length >= 5;
  
  // Can generate if user is authenticated, onboarded, and has data
  const canGenerate = uid && userData?.onboardingCompleted && hasMinimalData;
  
  // Data is still loading if either query is in flight
  const isDataLoading = queryUserData.isLoading || queryTransactions.isLoading;

  // Fetch latest report on mount
  useEffect(() => {
    if (!uid) return;

    async function loadLatestReport() {
      try {
        setIsFetching(true);
        setError(null);
        const report = await fetchLatestWeeklyReport(uid!);
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
      if (!uid) {
        throw new Error("Not authenticated. Please log in.");
      }

      if (!userData) {
        throw new Error("User profile not loaded. Please wait.");
      }

      if (!userData.onboardingCompleted) {
        throw new Error("Complete onboarding before generating weekly reports.");
      }

      if (transactions.length === 0) {
        throw new Error("Add at least one transaction to generate a weekly report.");
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
        const weekTransactions = transactions.filter((tx) => {
          const txDate = new Date(tx.date);
          return txDate >= weekStart && txDate <= weekEnd;
        });

        // Calculate previous week expenses
        const prevWeekStart = subWeeks(weekStart, 1);
        const prevWeekEnd = weekStart;
        const prevWeekTransactions = transactions.filter((tx) => {
          const txDate = new Date(tx.date);
          return txDate >= prevWeekStart && txDate < prevWeekEnd;
        });
        const previousWeekExpenses = prevWeekTransactions
          .filter((tx) => tx.type === "expense")
          .reduce((sum, tx) => sum + tx.amount, 0);

        let report: WeeklyReport;

        // Use AI generation if we have enough data, otherwise use fallback
        if (hasGoodData || force) {
          report = await generateWeeklyReport({
            uid,
            userData,
            transactions: weekTransactions.length > 0 ? weekTransactions : transactions,
            weekStartDate: weekStartStr,
            weekEndDate: weekEndStr,
            periodLabel,
            previousWeekExpenses,
            force,
          });
        } else {
          // Fallback for limited transaction history
          report = generateFallbackWeeklyReport(
            uid,
            transactions,
            weekStartStr,
            weekEndStr,
            periodLabel
          );
        }

        // Save to Firestore
        const undefinedIssues = hasUndefinedValues(report);
        if (undefinedIssues.length > 0) {
          console.warn("Warning: Report contains undefined values:", undefinedIssues);
        }
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
    [uid, userData, transactions, hasGoodData]
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
    transactions,
    isLoading,
    isFetching,
    isGenerating,
    isDataLoading,
    error,
    canGenerate,
    hasMinimalData,
    hasGoodData,
    isBlockedByOnboarding,
    isBlockedByTransactions,
    generateReport,
    fetchAllReports,
  };
}
