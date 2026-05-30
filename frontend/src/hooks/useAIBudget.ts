import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBudget, saveBudget } from "../lib/firebase/budgets";
import { BudgetRecommendation } from "../types/budget";
import { useAuthStore } from "../store/authStore";
import { toast } from "sonner";
import { useUserData } from "./useUserData";

const QUERY_KEY = "budget";

export function useAIBudget(month: string) {
  const { user } = useAuthStore();
  const { data: userData } = useUserData();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEY, user?.uid, month],
    queryFn: () => {
      if (!user?.uid) throw new Error("Not authenticated");
      return getBudget(user.uid, month);
    },
    enabled: !!user?.uid && !!month,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  const generateMutation = useMutation({
    mutationFn: async (transactions: any[]) => {
      if (!user?.uid) throw new Error("Not authenticated");
      
      const idToken = await user.getIdToken();
      
      const res = await fetch("/api/generateBudget", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          month,
          transactions,
          income: userData?.balance || 0,
          currency: userData?.preferences?.currency || "USD"
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate budget");
      }

      const data = await res.json();
      
      // Save the generated budget to Firebase
      await saveBudget(user.uid, month, data.budget);
      
      return data.budget as BudgetRecommendation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, user?.uid, month] });
      toast.success("AI Budget generated!");
    },
    onError: (err) => {
      console.error(err);
      toast.error("Failed to generate AI budget");
    },
  });

  return {
    ...query,
    generateBudget: generateMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
  };
}
