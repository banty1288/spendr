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
    const { prompt, temperature = this.config.temperature } = options;

    const apiKey =
      import.meta.env.VITE_GEMINI_API_KEY ||
      import.meta.env.VITE_GEMINI_API_KEY;

    try {
      const requestBody = {
        system_instruction: {
          parts: [{ text: "You are a financial analysis AI. ONLY output raw JSON. Do NOT wrap in markdown fences. Do NOT include explanations." }],
        },
        contents: [
          {
            role: "user",
            parts: options.inlineData ? [
              { text: prompt },
              { inline_data: { mime_type: options.inlineData.mimeType, data: options.inlineData.data } }
            ] : [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature,
          ...(this.config.features.jsonResponse ? { responseMimeType: "application/json" } : {}),
        },
      };

      const response = await fetch(`${GEMINI_REST_URL}?key=${apiKey}`, {
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
        
        throw new Error(errorData?.error?.message || `API Error: ${status}`);
      }

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

      if (!text?.trim()) {
        throw new AiError("EMPTY", "AI returned an empty response.", true);
      }

      // If jsonResponse was requested, it might still have markdown fences sometimes
      let cleanText = text.trim();
      if (cleanText.startsWith("```json")) {
        cleanText = cleanText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      }

      return cleanText;
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
