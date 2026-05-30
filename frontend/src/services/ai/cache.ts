import { DEFAULT_CACHE_TTL_MS } from "./config/defaults";
import { getAiSettings } from "./config/index";
import type { SpendrAIAnalysis } from "./types";

interface CacheEntry {
  data: SpendrAIAnalysis;
  expiresAt: number;
  fingerprint: string;
}

const memoryCache = new Map<string, CacheEntry>();

function resolveCacheTtlMs(override?: number): number {
  if (override !== undefined) return override;
  try {
    return getAiSettings().cacheTtlMs;
  } catch {
    return DEFAULT_CACHE_TTL_MS;
  }
}

export function buildAnalysisCacheKey(
  uid: string,
  fingerprint: string
): string {
  return `spendr-ai:${uid}:${fingerprint}`;
}

export function getCachedAnalysis(
  cacheKey: string
): SpendrAIAnalysis | null {
  const entry = memoryCache.get(cacheKey);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(cacheKey);
    return null;
  }
  return entry.data;
}

export function setCachedAnalysis(
  cacheKey: string,
  fingerprint: string,
  data: SpendrAIAnalysis,
  ttlMs?: number
): void {
  const ttl = resolveCacheTtlMs(ttlMs);
  memoryCache.set(cacheKey, {
    data,
    fingerprint,
    expiresAt: Date.now() + ttl,
  });
}

export function clearAnalysisCache(uid?: string): void {
  if (!uid) {
    memoryCache.clear();
    return;
  }
  const prefix = `spendr-ai:${uid}:`;
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) memoryCache.delete(key);
  }
}

/** Safe to import from hooks — does not load Gemini SDK */
export function invalidateSpendrAnalysisCache(uid: string): void {
  clearAnalysisCache(uid);
}

export function getCachedFingerprint(cacheKey: string): string | null {
  return memoryCache.get(cacheKey)?.fingerprint ?? null;
}
