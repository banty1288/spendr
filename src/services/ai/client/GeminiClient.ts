import { getAuth } from "firebase/auth";
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
 * Reusable AI client — delegates to Vercel Serverless Functions securely.
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

    const auth = getAuth(app);
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new AiError("API", "You must be signed in to generate insights.", false);
    }

    try {
      // Get the Firebase ID token
      const idToken = await currentUser.getIdToken(true); // true forces refresh if close to expiration

      // Call the Vercel API endpoint
      const response = await fetch('/api/generateInsight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          prompt,
          temperature,
          jsonResponse: this.config.features.jsonResponse,
          analysisType,
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const status = response.status;
        
        if (status === 401) {
          throw new AiError("API", "Authentication failed. Please sign in again.", false);
        }
        if (status === 429) {
          throw new AiError("API", "Rate limit exceeded. Please wait a moment.", true);
        }
        
        throw new Error(errorData?.error || `API Error: ${status}`);
      }

      const result = await response.json();
      const text = result.text;

      if (!text?.trim()) {
        throw new AiError("EMPTY", "AI returned an empty response.", true);
      }

      return text;
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
