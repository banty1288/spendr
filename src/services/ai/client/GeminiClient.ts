import type { GoogleGenerativeAI } from "@google/generative-ai";
import { getAiSettings, type AiSettings } from "../config/index";
import { AiError } from "../errors";
import {
  isModelNotFoundError,
  isRetryableApiError,
  toAiError,
} from "../errors";
import { withRetry } from "../retry";
import { withTimeout } from "../timeout";

export interface GenerateJsonOptions {
  prompt: string;
  temperature?: number;
  modelChain?: readonly string[];
}

type GenerativeAiModule = typeof import("@google/generative-ai");

let sdkModule: GenerativeAiModule | null = null;

async function loadSdk(): Promise<GenerativeAiModule> {
  if (!sdkModule) {
    sdkModule = await import("@google/generative-ai");
  }
  return sdkModule;
}

/**
 * Reusable Gemini API client — lazy-loads SDK; never throws during construction.
 */
export class GeminiClient {
  private sdk: GoogleGenerativeAI | null = null;
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

  requireApiKey(): string {
    if (!this.config.apiKey) {
      throw new AiError(
        "CONFIG",
        "Gemini API key is not configured. Set VITE_GEMINI_API_KEY in .env.local.",
        false
      );
    }
    return this.config.apiKey;
  }

  assertEnabled(): void {
    if (!this.config.enabled) {
      throw new AiError(
        "CONFIG",
        "AI features are disabled. Set VITE_AI_ENABLED=true and configure VITE_GEMINI_API_KEY.",
        false
      );
    }
    this.requireApiKey();
  }

  private async getSdk(): Promise<GoogleGenerativeAI> {
    this.assertEnabled();
    if (!this.sdk) {
      const { GoogleGenerativeAI } = await loadSdk();
      this.sdk = new GoogleGenerativeAI(this.requireApiKey());
    }
    return this.sdk;
  }

  private async executeWithModel(
    options: GenerateJsonOptions,
    modelName: string
  ): Promise<string> {
    const { prompt, temperature = this.config.temperature } = options;
    const sdk = await this.getSdk();

    const model = sdk.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature,
        ...(this.config.features.jsonResponse
          ? { responseMimeType: "application/json" }
          : {}),
      },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    if (!text?.trim()) {
      throw new AiError("EMPTY", "Gemini returned an empty response.", true);
    }

    return text;
  }

  private async executeWithFallback(
    options: GenerateJsonOptions
  ): Promise<string> {
    const models = options.modelChain ?? this.getModelChain();
    let lastError: unknown;

    for (let i = 0; i < models.length; i++) {
      const modelName = models[i];
      try {
        return await this.executeWithModel(options, modelName);
      } catch (err) {
        lastError = err;
        const hasFallback = i < models.length - 1;
        if (isModelNotFoundError(err) && hasFallback) {
          console.warn(
            `[Spendr AI] Model "${modelName}" not found, trying "${models[i + 1]}".`
          );
          continue;
        }
        throw toAiError(err);
      }
    }

    throw toAiError(
      lastError ??
        new AiError(
          "MODEL_NOT_FOUND",
          `No valid Gemini model. Tried: ${models.join(", ")}`,
          false
        )
    );
  }

  async generateJson(options: GenerateJsonOptions): Promise<string> {
    const { retry, timeoutMs } = this.config;

    return withRetry(
      () =>
        withTimeout(
          this.executeWithFallback(options),
          timeoutMs,
          "Gemini analysis"
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
