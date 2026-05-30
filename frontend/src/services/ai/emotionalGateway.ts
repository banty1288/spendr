import type { Transaction } from "../../types/transaction";
import type { UserData } from "../../types/user";
import type { EmotionalSpendingInsights } from "../../types/emotionalInsight";
import {
  getEmotionalInsightsDocument,
  setEmotionalInsightsDocument,
} from "../../lib/firebase/emotionalInsights";
import { generateJsonText } from "./client/index";
import { buildAiUserContext, formatContextForPrompt } from "./context";
import { dedupeRequest } from "./dedupe";
import { isAiEnabled } from "./config/index";
import { AiError, toAiError } from "./errors";
import { assertThrottle, markApiCall } from "./throttle";
import { withRequestLock } from "./requestLock";
import { buildAnalysisFingerprint } from "./fingerprint";
import { buildEmotionalSpendingPrompt } from "./emotionalPrompts";
import { parseEmotionalSpendingInsights } from "./emotionalParse";
import { generateEmotionalHeuristicInsights } from "./emotionalHeuristics";

export interface RunEmotionalInsightsParams {
  uid: string;
  userData: UserData | null | undefined;
  transactions: Transaction[];
  force?: boolean;
}

async function callGeminiAndParse(
  userData: UserData | null | undefined,
  transactions: Transaction[],
  fingerprint: string
): Promise<EmotionalSpendingInsights> {
  if (!isAiEnabled()) {
    return generateEmotionalHeuristicInsights(userData, transactions, fingerprint);
  }

  const context = buildAiUserContext(userData, transactions);
  const prompt = buildEmotionalSpendingPrompt(formatContextForPrompt(context));

  try {
    const raw = await generateJsonText({ prompt, temperature: 0.35 });
    return parseEmotionalSpendingInsights(raw, fingerprint);
  } catch (err) {
    const aiErr = toAiError(err);
    if (aiErr.code === "CONFIG" || aiErr.code === "QUOTA" || aiErr.code === "PARSE") {
      console.warn(
        `[Spendr AI] Emotional insights fallback used: ${aiErr.code}.`,
        aiErr
      );
      return generateEmotionalHeuristicInsights(userData, transactions, fingerprint);
    }
    throw aiErr;
  }
}

export async function runEmotionalSpendingInsights({
  uid,
  userData,
  transactions,
  force = false,
}: RunEmotionalInsightsParams): Promise<EmotionalSpendingInsights> {
  if (!userData?.onboardingCompleted) {
    throw new AiError(
      "API",
      "Complete onboarding before generating emotional spending insights.",
      false
    );
  }

  if (transactions.length === 0) {
    throw new AiError(
      "EMPTY",
      "Add at least one transaction to analyze emotional spending.",
      false
    );
  }

  const fingerprint = buildAnalysisFingerprint(transactions, userData);
  const dedupeKey = force
    ? `emotional:${uid}:${fingerprint}:force`
    : `emotional:${uid}:${fingerprint}`;
  const lockKey = `gemini-emotional:${uid}`;

  return dedupeRequest(dedupeKey, () =>
    withRequestLock(lockKey, async () => {
      if (!force) {
        const existing = await getEmotionalInsightsDocument(uid);
        if (existing?.fingerprint === fingerprint) return existing;
      }

      const willCallAi = isAiEnabled();
      if (willCallAi) assertThrottle(uid, force);
      const insights = await callGeminiAndParse(userData, transactions, fingerprint);
      if (willCallAi) markApiCall(uid);
      await setEmotionalInsightsDocument(uid, insights, transactions.length);
      return insights;
    }).catch((err) => {
      if (err instanceof Error && err.message === "REQUEST_IN_FLIGHT") {
        throw new AiError(
          "API",
          "Emotional analysis already in progress. Please wait.",
          false
        );
      }
      throw err;
    })
  );
}

export async function getStoredEmotionalSpendingInsights(
  uid: string
): Promise<EmotionalSpendingInsights | null> {
  return getEmotionalInsightsDocument(uid);
}

export function buildEmotionalInsightsPreview(
  userData: UserData | null | undefined,
  transactions: Transaction[]
): EmotionalSpendingInsights {
  const fingerprint = buildAnalysisFingerprint(transactions, userData);
  return generateEmotionalHeuristicInsights(userData, transactions, fingerprint);
}
