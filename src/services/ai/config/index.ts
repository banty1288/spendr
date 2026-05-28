import {
  DEFAULT_CACHE_TTL_MS,
  DEFAULT_REQUEST_TIMEOUT_MS,
} from "./defaults";

export {
  PRIMARY_GEMINI_MODEL,
  DEFAULT_FALLBACK_MODELS,
  FALLBACK_GEMINI_MODELS,
  DEFAULT_REQUEST_TIMEOUT_MS,
  DEFAULT_CACHE_TTL_MS,
  DEFAULT_THROTTLE_INTERVAL_MS,
  DEFAULT_TEMPERATURE,
  DEFAULT_RETRY,
} from "./defaults";

export { loadRawAiEnv, type RawAiEnv } from "./env";
export { buildModelChain, type AiModelConfig } from "./models";
export { SAFE_AI_SETTINGS } from "./safe";
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
  isDevMockEnabled,
  type AiSettings,
  type AiRetryConfig,
  type AiFeatureFlags,
} from "./settings";

import { getAiSettings } from "./settings";
import { AiError } from "../errors";

/** Returns API key or throws CONFIG — only call when making an API request */
export function getGeminiApiKey(): string {
  const key = "";
  if (!key) {
    throw new AiError(
      "CONFIG",
      "AI features are not configured correctly.",
      false
    );
  }
  return key;
}

export const GEMINI_REQUEST_TIMEOUT_MS = DEFAULT_REQUEST_TIMEOUT_MS;
export const GEMINI_CACHE_TTL_MS = DEFAULT_CACHE_TTL_MS;
