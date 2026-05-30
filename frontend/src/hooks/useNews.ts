import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FeedItem } from "../types/news";
import { toggleLike, hasUserLiked } from "../lib/firebase/news";
import { useAuthStore } from "../store/authStore";
import { useTransactions } from "./useTransactions";
import { useUserData } from "./useUserData";

const QUERY_KEY = "personalizedFeed";

export function useNews() {
  const { user } = useAuthStore();
  const { data: userData } = useUserData();
  const { transactions } = useTransactions();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEY, user?.uid],
    queryFn: async () => {
      // Pass contextual data to generate highly personalized AI tips
      const context = {
        spendingHistory: transactions?.slice(0, 10) || [],
        wellnessScore: userData?.profile?.financialGoals ? 75 : 50 // arbitrary default if missing complex wellness scoring
      };

      const baseUrl = import.meta.env.VITE_API_URL || 'https://spendr-main.vercel.app';
      const res = await fetch(`${baseUrl}/api/getPersonalizedFeed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(context)
      });
      
      if (!res.ok) throw new Error("Failed to fetch personalized feed");
      const data: FeedItem[] = await res.json();
      return data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour caching so we don't spam Gemini
    enabled: !!user // Only fetch if user is present
  });

  const checkLike = async (itemId: string) => {
    if (!user) return false;
    return hasUserLiked(user.uid, itemId);
  };

  const likeMutation = useMutation({
    mutationFn: ({ itemId, type }: { itemId: string, type: "news"|"tip" }) => {
      if (!user) throw new Error("Not logged in");
      return toggleLike(user.uid, itemId, type);
    },
    onMutate: async ({ itemId }) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY, user?.uid] });
      const previous = queryClient.getQueryData<FeedItem[]>([QUERY_KEY, user?.uid]);
      if (previous) {
        queryClient.setQueryData<FeedItem[]>([QUERY_KEY, user?.uid], old => {
          if (!old) return old;
          return old.map(item => {
            if (item.id === itemId) {
              return { ...item, likesCount: item.likesCount + 1 };
            }
            return item;
          });
        });
      }
      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData([QUERY_KEY, user?.uid], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, user?.uid] });
    }
  });

  return {
    ...query,
    toggleLike: likeMutation.mutate,
    checkLike,
  };
}
