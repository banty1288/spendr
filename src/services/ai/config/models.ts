import {
  DEFAULT_FALLBACK_MODELS,
  PRIMARY_GEMINI_MODEL,
} from "./defaults";

export interface AiModelConfig {
  /** First model attempted */
  primary: string;
  /** Models tried after primary on 404 / not found */
  fallbacks: readonly string[];
  /** Full deduped attempt order */
  chain: readonly string[];
  /** Alias for chain[0] — label shown in UI */
  active: string;
}

export function buildModelChain(
  envModel?: string,
  envFallbacks: string[] = []
): AiModelConfig {
  const chain: string[] = [];

  if (envModel) chain.push(envModel);
  if (!chain.includes(PRIMARY_GEMINI_MODEL)) {
    chain.push(PRIMARY_GEMINI_MODEL);
  }

  const mergedFallbacks = [...envFallbacks, ...DEFAULT_FALLBACK_MODELS];
  for (const model of mergedFallbacks) {
    if (model && !chain.includes(model)) {
      chain.push(model);
    }
  }

  const primary = chain[0] ?? PRIMARY_GEMINI_MODEL;

  return {
    primary,
    fallbacks: chain.slice(1),
    chain,
    active: primary,
  };
}
