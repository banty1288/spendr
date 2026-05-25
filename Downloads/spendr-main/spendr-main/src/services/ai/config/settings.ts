import type { RawAiEnv } from "./env";
import { loadRawAiEnv } from "./env";
import {
  DEFAULT_CACHE_TTL_MS,
  DEFAULT_REQUEST_TIMEOUT_MS,
  DEFAULT_RETRY,
  DEFAULT_TEMPERATURE,
  DEFAULT_THROTTLE_INTERVAL_MS,
  PRIMARY_GEMINI_MODEL,
} from "./defaults";
import { buildModelChain, type AiModelConfig } from "./models";
import { SAFE_AI_SETTINGS } from "./safe";

export interface AiRetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

export interface AiFeatureFlags {
  devMockOnFailure: boolean;
  jsonResponse: boolean;
}

export interface AiSettings {
  readonly enabled: boolean;
  readonly apiKey: string;
  readonly models: AiModelConfig;
  readonly timeoutMs: number;
  readonly cacheTtlMs: number;
  readonly throttleIntervalMs: number;
  readonly temperature: number;
  readonly retry: AiRetryConfig;
  readonly features: AiFeatureFlags;
}

function resolveSettings(raw: RawAiEnv): AiSettings {
  const models = buildModelChain(
    raw.model || undefined,
    raw.fallbackModels
  );

  return Object.freeze({
    enabled: raw.enabled && Boolean(raw.apiKey),
    apiKey: raw.apiKey,
    models,
    timeoutMs: raw.timeoutMs || DEFAULT_REQUEST_TIMEOUT_MS,
    cacheTtlMs: raw.cacheTtlMs || DEFAULT_CACHE_TTL_MS,
    throttleIntervalMs: raw.throttleMs || DEFAULT_THROTTLE_INTERVAL_MS,
    temperature: raw.temperature || DEFAULT_TEMPERATURE,
    retry: Object.freeze({
      maxAttempts: raw.retryMaxAttempts || DEFAULT_RETRY.maxAttempts,
      baseDelayMs: raw.retryBaseDelayMs || DEFAULT_RETRY.baseDelayMs,
      maxDelayMs: raw.retryMaxDelayMs || DEFAULT_RETRY.maxDelayMs,
    }),
    features: Object.freeze({
      devMockOnFailure: raw.devMockOnFailure,
      jsonResponse: true,
    }),
  });
}

let cachedSettings: AiSettings | null = null;
let settingsLoadFailed = false;

/** Load (or return cached) AI settings — never throws */
export function getAiSettings(): Readonly<AiSettings> {
  if (cachedSettings) return cachedSettings;

  try {
    cachedSettings = resolveSettings(loadRawAiEnv());
  } catch (err) {
    settingsLoadFailed = true;
    console.error("[Spendr AI] Failed to load settings, using safe defaults:", err);
    cachedSettings = SAFE_AI_SETTINGS;
  }

  return cachedSettings;
}

export function didAiSettingsFailToLoad(): boolean {
  return settingsLoadFailed;
}

export function resetAiSettings(): void {
  cachedSettings = null;
  settingsLoadFailed = false;
}

export function isAiEnabled(): boolean {
  try {
    return getAiSettings().enabled;
  } catch {
    return false;
  }
}

export function isAiConfigured(): boolean {
  try {
    return Boolean(getAiSettings().apiKey);
  } catch {
    return false;
  }
}

export function getActiveModelLabel(): string {
  try {
    return getAiSettings().models.active;
  } catch {
    return PRIMARY_GEMINI_MODEL;
  }
}

export function getModelChain(): readonly string[] {
  try {
    return getAiSettings().models.chain;
  } catch {
    return SAFE_AI_SETTINGS.models.chain;
  }
}

export function getGeminiModelChain(): string[] {
  return [...getModelChain()];
}

export function getGeminiModel(): string {
  return getActiveModelLabel();
}

export function getActiveGeminiModelLabel(): string {
  return getActiveModelLabel();
}

export function isDevMockEnabled(): boolean {
  try {
    return getAiSettings().features.devMockOnFailure;
  } catch {
    return import.meta.env.DEV;
  }
}
