import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import {
  fetchUserChallenges,
  addChallenge,
  updateChallengeProgress,
  upsertUserChallenge,
} from "../lib/firebase/challenges";
import { generatePersonalizedChallenges } from "../services/ai/challengeGateway";
import { useRewards } from "./useRewards";
import { REWARD_ICONS } from "../services/rewards/xpEngine";
import type { UserData } from "../types/user";
import type { Transaction } from "../types/transaction";
import type { SavingsChallenge, ChallengeStatus, ChallengeRecommendation } from "../types/challenge";

export const challengesQueryKey = (uid?: string) => ["challenges", uid] as const;

export function useChallenges(
  userData: UserData | null | undefined,
  transactions: Transaction[]
) {
  const user = useAuthStore((s) => s.user);
  const uid = user?.uid;
  const queryClient = useQueryClient();
  const { logReward } = useRewards();

  const challengesQuery = useQuery({
    queryKey: challengesQueryKey(uid),
    queryFn: () => fetchUserChallenges(uid!),
    enabled: !!uid,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!uid) throw new Error("Must be logged in to generate challenges.");
      return generatePersonalizedChallenges({ userData, transactions });
    },
  });

  const acceptMutation = useMutation({
    mutationFn: async (recommendation: ChallengeRecommendation) => {
      if (!uid) throw new Error("Must be logged in to accept a challenge.");
      return addChallenge(uid, {
        title: recommendation.title,
        description: recommendation.description,
        category: recommendation.category,
        difficulty: recommendation.difficulty,
        targetAmount: recommendation.targetAmount,
        currentProgress: 0,
        unit: recommendation.unit,
        rewardXp: recommendation.rewardXp,
        status: "active",
        targetCategoryId: recommendation.targetCategoryId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(challengesQueryKey(uid));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      challengeId,
      progress,
      status,
    }: {
      challengeId: string;
      progress?: number;
      status?: ChallengeStatus;
    }) => {
      if (!uid) throw new Error("Must be logged in to update a challenge.");
      await updateChallengeProgress(uid, challengeId, {
        currentProgress: progress,
        status,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: challengesQueryKey(uid) });
      queryClient.invalidateQueries({ queryKey: ["financialLevel", uid] });
      
      if (variables.status === "completed") {
        logReward({
          type: "challenge",
          title: "Challenge Completed!",
          subtitle: "You crushed a savings goal",
          xp: XP_VALUES.CHALLENGE_COMPLETED,
          icon: REWARD_ICONS.challenge,
        });
      }
    },
  });

  return {
    challenges: challengesQuery.data ?? [],
    isLoading: challengesQuery.isLoading,
    generateRecommendations: generateMutation.mutateAsync,
    isGenerating: generateMutation.isLoading,
    recommendations: generateMutation.data,
    acceptChallenge: acceptMutation.mutateAsync,
    isAccepting: acceptMutation.isLoading,
    updateChallenge: updateMutation.mutateAsync,
    isUpdating: updateMutation.isLoading,
  };
}
