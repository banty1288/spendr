import type { Transaction } from "../../types/transaction";
import type { UserData } from "../../types/user";
import { generateJsonText } from "./client/index";
import { getCachedAnalysis, setCachedAnalysis, buildAnalysisCacheKey } from "./cache";
import { dedupeRequest } from "./dedupe";
import { withRequestLock } from "./requestLock";
import { AiError, toAiError } from "./errors";
import { assertThrottle, markApiCall } from "./throttle";

export interface AiTaskContext {
  uid: string;
  userData: UserData | null | undefined;
  transactions: Transaction[];
  cacheKeyPrefix: string;
  force?: boolean;
}

/**
 * Universal AI execution pipeline.
 * Handles validation, caching, deduplication, locking, throttling, and API communication.
 */
export async function executeAiTask<T>(
  context: AiTaskContext,
  promptBuilder: () => string,
  parser: (rawResponse: string) => T | Promise<T>,
  saveResult?: (result: T) => Promise<void>
): Promise<T> {
  const { uid, userData, transactions, cacheKeyPrefix, force = false } = context;

  if (!userData?.onboardingCompleted) {
    throw new AiError("API", "Complete onboarding before generating insights.", false);
  }

  if (transactions.length === 0) {
    throw new AiError("EMPTY", "Add at least one transaction to generate insights.", false);
  }

  const cacheKey = buildAnalysisCacheKey(uid, cacheKeyPrefix);

  if (!force) {
    const cached = getCachedAnalysis(cacheKey);
    if (cached) return cached as unknown as T;
  }

  const dedupeKey = force ? `${cacheKey}:force` : cacheKey;
  const lockKey = `ai-lock:${uid}:${cacheKeyPrefix}`;

  return dedupeRequest(dedupeKey, () =>
    withRequestLock(lockKey, async () => {
      if (!force) {
        const cachedAgain = getCachedAnalysis(cacheKey);
        if (cachedAgain) return cachedAgain as unknown as T;
      }

      assertThrottle(uid, force);

      const prompt = promptBuilder();
      
      try {
        const rawResponse = await generateJsonText({ prompt });
        const result = await parser(rawResponse);
        
        markApiCall(uid);
        
        // Ensure result satisfies SpendrAIAnalysis cache interface if possible, 
        // or just rely on the specific save functions
        if (saveResult) {
          await saveResult(result);
        } else {
          setCachedAnalysis(cacheKey, cacheKeyPrefix, result as any);
        }

        return result;
      } catch (err) {
        if (err instanceof Error && err.message === "REQUEST_IN_FLIGHT") {
          throw new AiError("API", "Analysis already in progress. Please wait.", false);
        }
        throw toAiError(err);
      }
    })
  );
}
