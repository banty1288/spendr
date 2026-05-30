import { GeminiClient } from "./GeminiClient";

export { GeminiClient, type GenerateJsonOptions } from "./GeminiClient";

let defaultClient: GeminiClient | null = null;

/** Shared singleton — uses centralized {@link getAiSettings} */
export function getGeminiClient(): GeminiClient {
  if (!defaultClient) {
    defaultClient = new GeminiClient();
  }
  return defaultClient;
}

export function resetGeminiClient(): void {
  defaultClient = null;
}

/** Convenience wrapper used by gateway and insights */
export async function generateJsonText(
  options: Parameters<GeminiClient["generateJson"]>[0]
): Promise<string> {
  return getGeminiClient().generateJson(options);
}
