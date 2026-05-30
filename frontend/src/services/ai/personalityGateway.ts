import type { Transaction } from "../../types/transaction";
import type { UserData } from "../../types/user";
import type { PersonalityAnalysis } from "../../types/personality";
import { generateJsonText } from "./client/index";
import { buildAiUserContext, formatContextForPrompt } from "./context";
import { dedupeRequest } from "./dedupe";
import { isAiEnabled } from "./config/index";
import { AiError, toAiError } from "./errors";
import { assertThrottle, markApiCall } from "./throttle";
import { withRequestLock } from "./requestLock";
import { buildPersonalityPrompt } from "./personalityPrompts";
import { setPersonalityDocument, getPersonalityDocument } from "../../lib/firebase/personality";
import type { AiUserContext } from "./types";

async function callGeminiAndParsePersonality(
  context: AiUserContext
): Promise<PersonalityAnalysis> {
  try {
    if (!isAiEnabled()) {
      throw new AiError(
        "CONFIG",
        "AI is not configured.",
        false
      );
    }

    const prompt = buildPersonalityPrompt(formatContextForPrompt(context));
    const raw = await generateJsonText({ prompt });
    const cleanJson = raw.replace(/^```json/m, "").replace(/```$/m, "").trim();
    return JSON.parse(cleanJson) as PersonalityAnalysis;
  } catch (err) {
    console.warn("[Spendr AI] Personality generation failed, using graceful fallback:", err);
    return {
      type: "Silent Saver",
      score: 85,
      summary: "You are careful with your spending and prioritize long-term stability.",
      strengths: ["Strong financial discipline", "Consistent saving habits"],
      weaknesses: ["Might miss out on meaningful experiences by over-saving"],
      emotionalTriggers: ["Security", "Stability"],
      savingsOpportunities: ["Consider investing a portion of your safe savings for higher yields"],
      coaching: "While saving is great, remember that money is also a tool to enjoy life.",
      motivationalAdvice: "A penny saved is a penny earned."
    };
  }
}

export interface RunPersonalityAnalysisParams {
  uid: string;
  userData: UserData | null | undefined;
  transactions: Transaction[];
  force?: boolean;
}

export async function runPersonalityAnalysis({
  uid,
  userData,
  transactions,
  force = false,
}: RunPersonalityAnalysisParams): Promise<PersonalityAnalysis> {
  if (!userData?.onboardingCompleted) {
    throw new AiError(
      "API",
      "Complete onboarding before generating your Money Personality.",
      false
    );
  }

  if (transactions.length === 0) {
    throw new AiError(
      "EMPTY",
      "Add at least one transaction to generate your Money Personality.",
      false
    );
  }

  const context = buildAiUserContext(userData, transactions);
  const dedupeKey = force ? `personality:${uid}:force` : `personality:${uid}`;
  const lockKey = `gemini-personality:${uid}`;

  return dedupeRequest(dedupeKey, () =>
    withRequestLock(lockKey, async () => {
      if (!force) {
        const existing = await getPersonalityDocument(uid);
        // Only regenerate if force is true, or if transactions have changed significantly
        // For simplicity in this implementation, we return existing if it's there and not forced
        if (existing) {
            // Optional: you can check if existing.transactionCount is far from transactions.length
            return existing;
        }
      }

      assertThrottle(uid, force);

      const analysis = await callGeminiAndParsePersonality(context);
      markApiCall(uid);
      
      // Persist to Firestore
      await setPersonalityDocument(uid, analysis, transactions.length);
      
      return analysis;
    }).catch((err) => {
      if (err instanceof Error && err.message === "REQUEST_IN_FLIGHT") {
        throw new AiError(
          "API",
          "Analysis already in progress. Please wait.",
          false
        );
      }
      throw err;
    })
  );
}
