import type { Transaction } from "../../types/transaction";
import type { UserData } from "../../types/user";
import { generateJsonText } from "./client/index";
import {
  buildAnalysisCacheKey,
  clearAnalysisCache,
  getCachedAnalysis,
  setCachedAnalysis,
} from "./cache";
import { buildAiUserContext, formatContextForPrompt } from "./context";
import { dedupeRequest } from "./dedupe";
import { isAiEnabled } from "./config/index";
import { AiError, toAiError } from "./errors";
import { tryDevMockFallback } from "./devFallback";
import { assertThrottle, markApiCall } from "./throttle";
import { withRequestLock } from "./requestLock";
import { buildAnalysisFingerprint } from "./fingerprint";
import { buildAnalysisPrompt } from "./prompts";
import { parseSpendrAnalysis } from "./parse";
import type { AiUserContext, GenerateAnalysisOptions, SpendrAIAnalysis } from "./types";

export { invalidateSpendrAnalysisCache } from "./cache";

async function callGeminiAndParse(
  context: AiUserContext
): Promise<SpendrAIAnalysis> {
  if (!isAiEnabled()) {
    const mock = tryDevMockFallback(
      new AiError("CONFIG", "AI is not configured.", false),
      context
    );
    if (mock) return mock;
    throw new AiError(
      "CONFIG",
      "AI is not configured. Set VITE_GEMINI_API_KEY in .env.local.",
      false
    );
  }

  const prompt = buildAnalysisPrompt(formatContextForPrompt(context));

  try {
    const raw = await generateJsonText({ prompt });
    return parseSpendrAnalysis(raw);
  } catch (err) {
    const mock = tryDevMockFallback(err, context);
    if (mock) return mock;
    throw toAiError(err);
  }
}

export interface RunAnalysisParams {
  uid: string;
  userData: UserData | null | undefined;
  transactions: Transaction[];
  options?: GenerateAnalysisOptions;
}

export async function runSpendrAnalysis({
  uid,
  userData,
  transactions,
  options = {},
}: RunAnalysisParams): Promise<SpendrAIAnalysis> {
  if (!userData?.onboardingCompleted) {
    throw new AiError(
      "API",
      "Complete onboarding before generating AI insights.",
      false
    );
  }

  if (transactions.length === 0) {
    throw new AiError(
      "EMPTY",
      "Add at least one transaction to generate AI insights.",
      false
    );
  }

  const context = buildAiUserContext(userData, transactions);
  const fingerprint = buildAnalysisFingerprint(transactions, userData);
  const cacheKey = buildAnalysisCacheKey(uid, fingerprint);

  if (!options.force) {
    const cached = getCachedAnalysis(cacheKey);
    if (cached) return cached;
  }

  const dedupeKey = options.force ? `${cacheKey}:force` : cacheKey;
  const lockKey = `gemini:${uid}`;

  return dedupeRequest(dedupeKey, () =>
    withRequestLock(lockKey, async () => {
      if (!options.force) {
        const cachedAgain = getCachedAnalysis(cacheKey);
        if (cachedAgain) return cachedAgain;
      }

      assertThrottle(uid, options.force);

      const analysis = await callGeminiAndParse(context);
      markApiCall(uid);
      setCachedAnalysis(cacheKey, fingerprint, analysis);
      return analysis;
    }).catch((err) => {
      if (err instanceof Error && err.message === "REQUEST_IN_FLIGHT") {
        const cached = getCachedAnalysis(cacheKey);
        if (cached) return cached;
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

export function getSpendrAnalysisFromCache(
  uid: string,
  transactions: Transaction[],
  userData: UserData | null | undefined
): SpendrAIAnalysis | null {
  const fingerprint = buildAnalysisFingerprint(transactions, userData);
  return getCachedAnalysis(buildAnalysisCacheKey(uid, fingerprint));
}

export function buildSpendrAnalysisFingerprint(
  transactions: Transaction[],
  userData: UserData | null | undefined
): string {
  return buildAnalysisFingerprint(transactions, userData);
}
