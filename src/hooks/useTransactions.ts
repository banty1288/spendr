import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useMemo } from "react";
import { useAuthStore } from "../store/authStore";
import { useRewards } from "./useRewards";
import { XP_VALUES, REWARD_ICONS } from "../services/rewards/xpEngine";
import {
  createTransaction,
  fetchTransactions,
  removeTransaction,
  syncUserBalance,
  updateTransaction,
} from "../lib/firebase/transactions";
import {
  computeBalanceFromTransactions,
  filterTransactions,
  getAvailableMonths,
  getCategoryBreakdown,
  getMonthTotals,
  getMonthlySummaries,
  sortTransactions,
} from "../lib/transactions/analytics";
import type {
  Transaction,
  TransactionFilters,
  TransactionInput,
  TransactionSort,
} from "../types/transaction";
import { userDataQueryKey } from "./useUserData";
import { invalidateSpendrAnalysisCache } from "../services/ai/cache";
import { trackTransactionAdded, trackTransactionDeleted } from "../services/analytics";

export const transactionsQueryKey = (uid?: string) =>
  ["transactions", uid] as const;

export function useTransactions() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const uid = user?.uid;
  const { logReward } = useRewards();

  const query = useQuery({
    queryKey: transactionsQueryKey(uid),
    queryFn: () => fetchTransactions(uid!),
    enabled: !!uid,
    staleTime: 1000 * 30,
  });

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: transactionsQueryKey(uid) });
    await queryClient.invalidateQueries({ queryKey: userDataQueryKey(uid) });
    if (uid) invalidateSpendrAnalysisCache(uid);
  };

  const syncBalance = (list: Transaction[]) => {
    if (!uid) return;
    const balance = computeBalanceFromTransactions(list);
    void syncUserBalance(uid, balance);
    queryClient.setQueryData(userDataQueryKey(uid), (old: unknown) => {
      if (!old || typeof old !== "object") return old;
      return { ...old, balance };
    });
  };

  const addMutation = useMutation({
    mutationFn: (input: TransactionInput) => createTransaction(uid!, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: transactionsQueryKey(uid) });
      const previous = queryClient.getQueryData<Transaction[]>(
        transactionsQueryKey(uid)
      );
      const optimistic: Transaction = {
        id: `temp-${Date.now()}`,
        merchant: input.merchant,
        amount: Math.abs(input.amount),
        type: input.type,
        categoryId: input.categoryId,
        notes: input.notes ?? "",
        date: input.date,
        currency: input.currency,
        baseAmountUsd: input.baseAmountUsd,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const next = [optimistic, ...(previous ?? [])];
      queryClient.setQueryData(transactionsQueryKey(uid), next);
      syncBalance(next);
      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(transactionsQueryKey(uid), context.previous);
        syncBalance(context.previous);
      }
    },
    onSuccess: (created) => {
      trackTransactionAdded(created.type, created.categoryId);
      queryClient.setQueryData<Transaction[]>(
        transactionsQueryKey(uid),
        (old) => {
          const list = old ?? [];
          return [created, ...list.filter((t) => !t.id.startsWith("temp-"))];
        }
      );
      
      if (uid) {
        const lastLogged = localStorage.getItem(`last_tx_reward_${uid}`);
        const now = Date.now();
        if (!lastLogged || now - parseInt(lastLogged) > 60000) {
          localStorage.setItem(`last_tx_reward_${uid}`, now.toString());
          logReward({
            type: "transaction",
            title: "Transaction Logged",
            subtitle: "Tracking your spending habits",
            xp: XP_VALUES.TRANSACTION_LOGGED,
            icon: REWARD_ICONS.transaction,
          });
        }
      }
    },
    onSettled: () => void invalidateAll(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: TransactionInput }) =>
      updateTransaction(uid!, id, input),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: transactionsQueryKey(uid) });
      const previous = queryClient.getQueryData<Transaction[]>(
        transactionsQueryKey(uid)
      );
      const next = (previous ?? []).map((t) =>
        t.id === id
          ? {
              ...t,
              ...input,
              amount: Math.abs(input.amount),
              notes: input.notes ?? "",
              updatedAt: new Date().toISOString(),
            }
          : t
      );
      queryClient.setQueryData(transactionsQueryKey(uid), next);
      syncBalance(next);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(transactionsQueryKey(uid), context.previous);
        syncBalance(context.previous);
      }
    },
    onSettled: () => void invalidateAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => removeTransaction(uid!, id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: transactionsQueryKey(uid) });
      const previous = queryClient.getQueryData<Transaction[]>(
        transactionsQueryKey(uid)
      );
      const next = (previous ?? []).filter((t) => t.id !== id);
      queryClient.setQueryData(transactionsQueryKey(uid), next);
      syncBalance(next);
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(transactionsQueryKey(uid), context.previous);
        syncBalance(context.previous);
      }
    },
    onSettled: () => {
      trackTransactionDeleted();
      void invalidateAll();
    },
  });

  return {
    transactions: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    addTransaction: addMutation.mutateAsync,
    updateTransaction: updateMutation.mutateAsync,
    deleteTransaction: deleteMutation.mutateAsync,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useFilteredTransactions(
  filters: TransactionFilters,
  sort: TransactionSort = "date_desc"
) {
  const { transactions, isLoading, isError } = useTransactions();

  const filtered = useMemo(
    () => sortTransactions(filterTransactions(transactions, filters), sort),
    [transactions, filters, sort]
  );

  const availableMonths = useMemo(
    () => getAvailableMonths(transactions),
    [transactions]
  );

  return { transactions: filtered, all: transactions, isLoading, isError, availableMonths };
}

export function useTransactionAnalytics(month: string) {
  const { transactions, isLoading } = useTransactions();

  const analytics = useMemo(() => {
    const monthKey = month === "all" ? format(new Date(), "yyyy-MM") : month;
    const breakdown = getCategoryBreakdown(transactions, monthKey);
    const monthly = getMonthlySummaries(transactions, 6);
    const totals = getMonthTotals(transactions, monthKey);
    const balance = computeBalanceFromTransactions(transactions);

    return { breakdown, monthly, totals, balance, monthKey };
  }, [transactions, month]);

  return { ...analytics, isLoading, transactions };
}
