import { sanitizeEnv } from "../../../lib/firebase/env";

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = parseInt(sanitizeEnv(value, ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseTemperature(value: string | undefined, fallback: number): number {
  const parsed = parseFloat(sanitizeEnv(value, ""));
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(2, Math.max(0, parsed));
}

function parseBool(value: string | undefined, fallback: boolean): boolean {
  const raw = sanitizeEnv(value, "").toLowerCase();
  if (!raw) return fallback;
  return raw === "true" || raw === "1" || raw === "yes";
}

function parseCsvList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => sanitizeEnv(item.trim(), ""))
    .filter(Boolean);
}

export interface RawAiEnv {
  model: string;
  fallbackModels: string[];
  timeoutMs: number;
  cacheTtlMs: number;
  throttleMs: number;
  temperature: number;
  enabled: boolean;
  devMockOnFailure: boolean;
  retryMaxAttempts: number;
  retryBaseDelayMs: number;
  retryMaxDelayMs: number;
}

export function loadRawAiEnv(): RawAiEnv {
  const isDev = Boolean(import.meta.env?.DEV);

  try {
    return readRawAiEnv(isDev);
  } catch (err) {
    console.warn("[Spendr AI] Env read failed, using empty config:", err);
    return readRawAiEnv(isDev, true);
  }
}

function readRawAiEnv(isDev: boolean, forceEmpty = false): RawAiEnv {
  const env = import.meta.env ?? {};

  return {
    model: forceEmpty
      ? ""
      : sanitizeEnv(env.VITE_GEMINI_MODEL as string | undefined, ""),
    fallbackModels: forceEmpty
      ? []
      : parseCsvList(env.VITE_GEMINI_FALLBACK_MODELS as string | undefined),
    timeoutMs: parsePositiveInt(
      env.VITE_GEMINI_TIMEOUT_MS as string | undefined,
      0
    ),
    cacheTtlMs: parsePositiveInt(
      env.VITE_GEMINI_CACHE_TTL_MS as string | undefined,
      0
    ),
    throttleMs: parsePositiveInt(
      env.VITE_GEMINI_THROTTLE_MS as string | undefined,
      0
    ),
    temperature: parseTemperature(
      env.VITE_GEMINI_TEMPERATURE as string | undefined,
      0
    ),
    enabled: forceEmpty
      ? false
      : parseBool(env.VITE_AI_ENABLED as string | undefined, true),
    devMockOnFailure: parseBool(
      env.VITE_GEMINI_DEV_MOCK as string | undefined,
      isDev
    ),
    retryMaxAttempts: parsePositiveInt(
      env.VITE_GEMINI_RETRY_MAX as string | undefined,
      0
    ),
    retryBaseDelayMs: parsePositiveInt(
      env.VITE_GEMINI_RETRY_BASE_MS as string | undefined,
      0
    ),
    retryMaxDelayMs: parsePositiveInt(
      env.VITE_GEMINI_RETRY_MAX_DELAY_MS as string | undefined,
      0
    ),
  };
}
