import { generateJsonText } from "./client/index";
import { AiError, toAiError } from "./errors";
import { buildChallengePrompt } from "./challengePrompts";
import { buildAiUserContext, formatContextForPrompt } from "./context";
import { isAiEnabled } from "./config/index";
import type { ChallengeRecommendation } from "../../types/challenge";
import type { Transaction } from "../../types/transaction";
import type { UserData } from "../../types/user";
import type { AiUserContext } from "./types";

function parseChallengeResponse(raw: string): ChallengeRecommendation[] {
  try {
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.recommendations)) {
      throw new Error("Invalid format: missing recommendations array");
    }
    return data.recommendations;
  } catch (err) {
    throw new AiError("PARSE", "Failed to parse challenge recommendations", false);
  }
}

export async function generatePersonalizedChallenges({
  userData,
  transactions,
}: {
  userData: UserData | null | undefined;
  transactions: Transaction[];
}): Promise<ChallengeRecommendation[]> {
  if (!isAiEnabled()) {
    // Fallback data for dev
    return [
      {
        title: "Weekend No-Spend",
        description: "Avoid discretionary spending this weekend to boost your savings.",
        category: "no_spend",
        difficulty: "medium",
        targetAmount: 2,
        unit: "days",
        rewardXp: 100,
        durationDays: 2,
        reasoning: "Your weekend spending has been slightly higher than usual.",
      },
      {
        title: "Coffee Break",
        description: "Save ₹1500 on dining out this week.",
        category: "category_reduction",
        difficulty: "easy",
        targetAmount: 20,
        unit: "INR",
        rewardXp: 50,
        durationDays: 7,
        targetCategoryId: "dining",
        reasoning: "Small dining cuts add up fast.",
      }
    ];
  }

  const context: AiUserContext = buildAiUserContext(userData, transactions);
  const prompt = buildChallengePrompt(formatContextForPrompt(context));

  try {
    const raw = await generateJsonText({ prompt });
    return parseChallengeResponse(raw);
  } catch (err) {
    throw toAiError(err);
  }
}
