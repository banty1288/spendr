import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { fetchUserRewards, logUserReward } from "../lib/firebase/rewards";
import type { RewardEvent } from "../types/reward";
import { toast } from "sonner";
import React from "react";
import { trackRewardEarned } from "../services/analytics";

export const rewardsQueryKey = (uid?: string) => ["rewards", uid] as const;

const EMPTY_REWARDS: RewardEvent[] = [];

export function useRewards() {
  const user = useAuthStore((state) => state.user);
  const uid = user?.uid;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: rewardsQueryKey(uid),
    queryFn: () => fetchUserRewards(uid!),
    enabled: !!uid,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const mutation = useMutation({
    mutationFn: (reward: Omit<RewardEvent, "id" | "timestamp">) =>
      logUserReward(uid!, reward),
    onSuccess: (newReward) => {
      if (uid) {
        queryClient.setQueryData<RewardEvent[]>(
          rewardsQueryKey(uid),
          (old) => [newReward, ...(old || [])]
        );
      }
      trackRewardEarned(newReward.type, newReward.xp);
      
      // Trigger a visual toast animation for the reward
      toast.custom((_t) => React.createElement('div', {
        className: "bg-black/90 border border-[#00ff88]/30 p-4 rounded-2xl shadow-2xl shadow-[#00ff88]/10 flex items-center gap-4 animate-in slide-in-from-bottom-5 fade-in duration-300",
      }, [
        React.createElement('div', { className: "text-3xl animate-bounce" }, newReward.icon || "✨"),
        React.createElement('div', { className: "flex-1" }, [
          React.createElement('h4', { className: "text-white font-bold text-sm" }, newReward.title),
          React.createElement('p', { className: "text-white/60 text-xs" }, newReward.subtitle),
        ]),
        React.createElement('div', { className: "bg-[#00ff88]/20 px-3 py-1.5 rounded-full" }, [
          React.createElement('span', { className: "text-[#00ff88] font-black text-sm" }, `+${newReward.xp} XP`)
        ])
      ]));
    },
  });

  return {
    rewards: query.data ?? EMPTY_REWARDS,
    isLoading: query.isLoading,
    isError: query.isError,
    logReward: mutation.mutate,
    logRewardAsync: mutation.mutateAsync,
  };
}
