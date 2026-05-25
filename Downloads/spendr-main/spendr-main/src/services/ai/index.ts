/**
 * Public AI module surface.
 * Prefer direct imports (e.g. `./cache`, `./config/index`) in hot paths to avoid loading the Gemini SDK.
 */
export * from "./types";
export {
  AiError,
  toAiError,
  toSafeAiError,
  isQuotaExceededError,
  isModelNotFoundError,
  isRetryableApiError,
} from "./errors";
export {
  getAiSettings,
  resetAiSettings,
  didAiSettingsFailToLoad,
  isAiEnabled,
  isAiConfigured,
  getActiveModelLabel,
  getModelChain,
  getGeminiModelChain,
  getGeminiModel,
  getActiveGeminiModelLabel,
  getGeminiApiKey,
  PRIMARY_GEMINI_MODEL,
  FALLBACK_GEMINI_MODELS,
  DEFAULT_REQUEST_TIMEOUT_MS,
  DEFAULT_CACHE_TTL_MS,
  GEMINI_REQUEST_TIMEOUT_MS,
  GEMINI_CACHE_TTL_MS,
  isDevMockEnabled,
  SAFE_AI_SETTINGS,
  type AiSettings,
  type AiModelConfig,
  type RawAiEnv,
} from "./config/index";
export {
  GeminiClient,
  getGeminiClient,
  resetGeminiClient,
  generateJsonText,
  type GenerateJsonOptions,
} from "./client/index";
export {
  invalidateSpendrAnalysisCache,
  getCachedAnalysis,
  clearAnalysisCache,
} from "./cache";
export { tryDevMockFallback } from "./devFallback";
export { withRetry } from "./retry";
export { withTimeout } from "./timeout";
export { buildAiUserContext, buildTransactionsSummary } from "./context";
export {
  runSpendrAnalysis,
  buildSpendrAnalysisFingerprint,
  getSpendrAnalysisFromCache,
} from "./gateway";
export {
  runEmotionalSpendingInsights,
  getStoredEmotionalSpendingInsights,
  buildEmotionalInsightsPreview,
} from "./emotionalGateway";
export {
  generateSpendrAnalysis,
  generateSpendingAnalysis,
  detectEmotionalSpending,
  generateSavingsRecommendations,
  generateFinancialInsights,
  generateWeeklySummary,
  generateCoachingTip,
} from "./insights";
export { getDevMockAnalysis } from "./mock";
