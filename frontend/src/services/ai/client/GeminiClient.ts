import { getAiSettings, type AiSettings } from "../config/index";
import { AiError } from "../errors";
import { isRetryableApiError, toAiError } from "../errors";
import { withRetry } from "../retry";
import { withTimeout } from "../timeout";

export interface GenerateJsonOptions {
  prompt: string;
  temperature?: number;
  modelChain?: readonly string[]; // No longer used directly, but kept for signature compatibility
  analysisType?: string;
  inlineData?: {
    mimeType: string;
    data: string; // Base64
  };
}

const GEMINI_REST_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

/**
 * Reusable AI client — calls Gemini directly from the client.
 * Bypasses Vercel backend to avoid rate limits and CORS issues on localhost.
 */
export class GeminiClient {
  private readonly config: Readonly<AiSettings>;

  constructor(settings?: Readonly<AiSettings>) {
    this.config = settings ?? getAiSettings();
  }

  getConfig(): Readonly<AiSettings> {
    return this.config;
  }

  getModelChain(): readonly string[] {
    return this.config.models.chain;
  }

  getActiveModel(): string {
    return this.config.models.active;
  }

  assertEnabled(): void {
    if (!this.config.enabled) {
      throw new AiError(
        "CONFIG",
        "AI features are disabled. Set VITE_AI_ENABLED=true in .env.local.",
        false
      );
    }
  }

  private async executeWithFunction(options: GenerateJsonOptions): Promise<string> {
    this.assertEnabled();
    const { prompt, temperature = this.config.temperature, inlineData } = options;

    try {
      const requestBody = {
        prompt,
        temperature,
        inlineData,
        jsonResponse: this.config.features.jsonResponse
      };

      const response = await fetch(`/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const status = response.status;
        
        if (status === 429) {
          throw new AiError("API", "Rate limit exceeded. Please wait a moment.", true);
        }
        
        throw new Error(errorData?.error || `API Error: ${status}`);
      }

      const result = await response.json();
      const text = result.result ?? "";

      if (!text?.trim()) {
        throw new AiError("EMPTY", "AI returned an empty response.", true);
      }

      return text.trim();
    } catch (err: any) {
      throw toAiError(err);
    }
  }

  async generateJson(options: GenerateJsonOptions): Promise<string> {
    const { retry, timeoutMs } = this.config;

    return withRetry(
      () =>
        withTimeout(
          this.executeWithFunction(options),
          timeoutMs,
          "Backend AI analysis"
        ),
      {
        maxAttempts: retry.maxAttempts,
        baseDelayMs: retry.baseDelayMs,
        maxDelayMs: retry.maxDelayMs,
        shouldRetry: (err) => isRetryableApiError(err),
      }
    );
  }
}
