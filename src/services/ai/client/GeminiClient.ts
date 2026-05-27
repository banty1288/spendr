import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../../../lib/firebase"; // Ensure correct path to firebase app
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
}

/**
 * Reusable AI client — delegates to Firebase Cloud Functions securely.
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
    const { prompt, temperature = this.config.temperature, analysisType } = options;

    const functions = getFunctions(app, "us-central1");
    const generateInsight = httpsCallable<{ 
      prompt: string; 
      temperature: number; 
      jsonResponse: boolean;
      analysisType?: string;
    }, { text: string }>(functions, "generateInsight");

    try {
      const result = await generateInsight({
        prompt,
        temperature,
        jsonResponse: this.config.features.jsonResponse,
        analysisType,
      });

      const text = result.data.text;

      if (!text?.trim()) {
        throw new AiError("EMPTY", "AI returned an empty response.", true);
      }

      return text;
    } catch (err: any) {
      // Handle Firebase Functions specific errors
      if (err?.code === "functions/resource-exhausted") {
        throw new AiError("API", "Rate limit exceeded. Please wait a moment.", true);
      }
      if (err?.code === "functions/unauthenticated") {
        throw new AiError("API", "You must be signed in to generate insights.", false);
      }
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
