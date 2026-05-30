/** Default Gemini model — must match a valid Google AI Studio model id */
export const PRIMARY_GEMINI_MODEL = "gemini-2.5-flash";

/** Used when env does not specify fallbacks */
export const DEFAULT_FALLBACK_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-flash-latest",
] as const;

/** Public alias — same list as {@link DEFAULT_FALLBACK_MODELS} */
export const FALLBACK_GEMINI_MODELS = DEFAULT_FALLBACK_MODELS;

export const DEFAULT_REQUEST_TIMEOUT_MS = 45_000;
export const DEFAULT_CACHE_TTL_MS = 10 * 60 * 1000;
export const DEFAULT_THROTTLE_INTERVAL_MS = 60_000;
export const DEFAULT_TEMPERATURE = 0.4;
export const DEFAULT_JSON_MIME = "application/json";

export const DEFAULT_RETRY = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 12_000,
} as const;
