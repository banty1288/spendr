import { isDevMockEnabled } from "./config/index";
import {
  isModelNotFoundError,
  isQuotaExceededError,
  toAiError,
} from "./errors";
import type { AiUserContext, SpendrAIAnalysis } from "./types";
import { getDevMockAnalysis } from "./mock";

/**
 * In development, return mock analysis for recoverable API failures
 * so the UI never hard-crashes during quota/model/config issues.
 */
export function tryDevMockFallback(
  err: unknown,
  context: AiUserContext
): SpendrAIAnalysis | null {
  try {
    if (!isDevMockEnabled()) return null;

    const aiErr = toAiError(err);
    const recoverable =
      isQuotaExceededError(err) ||
      isModelNotFoundError(err) ||
      aiErr.code === "CONFIG" ||
      aiErr.code === "PARSE";

    if (!recoverable) return null;

    const reason =
      aiErr.code === "CONFIG"
        ? "AI not configured"
        : isQuotaExceededError(err)
          ? "quota exceeded"
          : isModelNotFoundError(err)
            ? "model not found"
            : "parse error";

    console.warn(`[Spendr AI] ${reason} — using development mock analysis.`);
    return getDevMockAnalysis(context);
  } catch (fallbackErr) {
    console.error("[Spendr AI] Mock fallback failed:", fallbackErr);
    return null;
  }
}
