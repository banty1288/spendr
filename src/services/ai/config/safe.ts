import {
  DEFAULT_CACHE_TTL_MS,
  DEFAULT_REQUEST_TIMEOUT_MS,
  DEFAULT_RETRY,
  DEFAULT_TEMPERATURE,
  DEFAULT_THROTTLE_INTERVAL_MS,
  PRIMARY_GEMINI_MODEL,
} from "./defaults";
import { buildModelChain } from "./models";
import type { AiSettings } from "./settings";

/** Used when env parsing or settings resolution fails — never throws */
export const SAFE_AI_SETTINGS: Readonly<AiSettings> = Object.freeze({
  enabled: false,
  models: Object.freeze(buildModelChain(PRIMARY_GEMINI_MODEL)),
  timeoutMs: DEFAULT_REQUEST_TIMEOUT_MS,
  cacheTtlMs: DEFAULT_CACHE_TTL_MS,
  throttleIntervalMs: DEFAULT_THROTTLE_INTERVAL_MS,
  temperature: DEFAULT_TEMPERATURE,
  retry: Object.freeze({ ...DEFAULT_RETRY }),
  features: Object.freeze({
    devMockOnFailure: import.meta.env.DEV,
    jsonResponse: true,
  }),
});
