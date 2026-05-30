import { useCallback } from "react";
import type { WeeklyReport } from "../types/weeklyReport";
import { useAuthStore } from "../store/authStore";
import { useUserData } from "./useUserData";
import { useTransactions } from "./useTransactions";
import { generateWeeklyReport } from "../services/ai/weeklyGateway";
import { fetchLatestWeeklyReport, fetchWeeklyReports } from "../lib/firebase/weeklyReports";
import { startOfWeek, subWeeks, format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useWeeklyReport() {
  const auth = useAuthStore();
  const queryClient = useQueryClient();
  const { data: userData, isLoading: isUserLoading } = useUserData();
  const { transactions = [], isLoading: isTxLoading } = useTransactions();
  
  const uid = auth.user?.uid;
  
  const isBlockedByOnboarding = userData ? !userData.onboardingCompleted : false;
  const isBlockedByTransactions = transactions.length === 0;
  const hasMinimalData = transactions.length >= 1;
  const hasGoodData = transactions.length >= 5;
  const canGenerate = !!uid && !!userData?.onboardingCompleted && hasMinimalData;
  const isDataLoading = isUserLoading || isTxLoading;

  // Cache latest report using React Query to avoid unnecessary Firestore reads
  const { data: latestReport, isLoading: isLatestLoading, error: latestError } = useQuery({
    queryKey: ['weeklyReport', 'latest', uid],
    queryFn: async () => {
      if (!uid) return null;
      return await fetchLatestWeeklyReport(uid);
    },
    enabled: !!uid,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  // Query all reports (optional load)
  const { data: reports = [], isLoading: isAllReportsLoading, refetch: fetchAllReports } = useQuery({
    queryKey: ['weeklyReport', 'all', uid],
    queryFn: async () => {
      if (!uid) return [];
      return await fetchWeeklyReports(uid);
    },
    enabled: false, // Explicit fetch required
    staleTime: 1000 * 60 * 60,
  });

  const generateMutation = useMutation({
    mutationFn: async (force: boolean = false) => {
      if (!uid) throw new Error("Not authenticated. Please log in.");
      if (!userData) throw new Error("User profile not loaded. Please wait.");
      if (!userData.onboardingCompleted) throw new Error("Complete onboarding before generating reports.");
      if (transactions.length === 0) throw new Error("Add at least one transaction first.");

      const today = new Date();
      const weekStart = startOfWeek(today, { weekStartsOn: 1 });
      const weekEnd = subWeeks(today, -1);
      const weekStartStr = format(weekStart, "yyyy-MM-dd");
      const weekEndStr = format(weekEnd, "yyyy-MM-dd");
      const periodLabel = format(weekStart, "MMM d") + " - " + format(weekEnd, "MMM d, yyyy");

      const weekTransactions = transactions.filter((tx) => {
        const txDate = new Date(tx.date);
        return txDate >= weekStart && txDate <= weekEnd;
      });

      const prevWeekStart = subWeeks(weekStart, 1);
      const prevWeekEnd = weekStart;
      const prevWeekTransactions = transactions.filter((tx) => {
        const txDate = new Date(tx.date);
        return txDate >= prevWeekStart && txDate < prevWeekEnd;
      });
      const previousWeekExpenses = prevWeekTransactions
        .filter((tx) => tx.type === "expense")
        .reduce((sum, tx) => sum + tx.amount, 0);

      // Call the AI Gateway
      const report = await generateWeeklyReport({
        uid,
        userData,
        transactions: weekTransactions.length > 0 ? weekTransactions : transactions,
        weekStartDate: weekStartStr,
        weekEndDate: weekEndStr,
        periodLabel,
        previousWeekExpenses,
        force,
      });

      return report;
    },
    onSuccess: (newReport) => {
      // Invalidate cache directly
      queryClient.invalidateQueries({ queryKey: ['weeklyReport', uid] });
      queryClient.setQueryData(['weeklyReport', 'latest', uid], newReport);
    }
  });

  const generateReport = useCallback((force: boolean = false) => {
    return generateMutation.mutateAsync(force);
  }, [generateMutation]);

  return {
    latestReport,
    reports,
    transactions,
    isLoading: isLatestLoading || isAllReportsLoading,
    isFetching: isLatestLoading,
    isGenerating: generateMutation.isPending,
    isDataLoading,
    error: latestError || generateMutation.error,
    canGenerate,
    hasMinimalData,
    hasGoodData,
    isBlockedByOnboarding,
    isBlockedByTransactions,
    generateReport,
    fetchAllReports,
  };
}
