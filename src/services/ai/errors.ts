import type { AiServiceError } from "./types";

export class AiError extends Error {
  readonly code: AiServiceError["code"];
  readonly retryable: boolean;

  constructor(
    code: AiServiceError["code"],
    message: string,
    retryable = false
  ) {
    super(message);
    this.name = "AiError";
    this.code = code;
    this.retryable = retryable;
  }
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return String(err);
}

export function isQuotaExceededError(err: unknown): boolean {
  const lower = errorMessage(err).toLowerCase();
  return (
    lower.includes("quota") ||
    lower.includes("resource_exhausted") ||
    lower.includes("rate limit") ||
    lower.includes("too many requests") ||
    lower.includes("[429]")
  );
}

export function isModelNotFoundError(err: unknown): boolean {
  const lower = errorMessage(err).toLowerCase();
  return (
    lower.includes("404") ||
    lower.includes("not found") ||
    lower.includes("is not found") ||
    lower.includes("model_not_found") ||
    (lower.includes("model") && lower.includes("invalid"))
  );
}

export function isTimeoutError(err: unknown): boolean {
  if (err instanceof AiError && err.code === "TIMEOUT") return true;
  const lower = errorMessage(err).toLowerCase();
  return lower.includes("timeout") || lower.includes("timed out");
}

export function isRetryableApiError(err: unknown): boolean {
  if (err instanceof AiError) {
    return err.retryable && err.code !== "MODEL_NOT_FOUND";
  }
  const lower = errorMessage(err).toLowerCase();
  if (isQuotaExceededError(err) || isModelNotFoundError(err)) return false;
  return (
    lower.includes("503") ||
    lower.includes("overloaded") ||
    lower.includes("unavailable") ||
    lower.includes("network") ||
    lower.includes("fetch failed") ||
    isTimeoutError(err)
  );
}

export function toAiError(err: unknown): AiError {
  if (err instanceof AiError) return err;

  const message = errorMessage(err) || "An unexpected AI error occurred.";
  const lower = message.toLowerCase();

  if (isQuotaExceededError(err)) {
    return new AiError(
      "QUOTA",
      "Gemini API quota exceeded. Please try again later.",
      false
    );
  }

  if (isModelNotFoundError(err)) {
    return new AiError(
      "MODEL_NOT_FOUND",
      "Gemini model not found. Check model configuration or try again later.",
      false
    );
  }

  if (isTimeoutError(err)) {
    return new AiError(
      "TIMEOUT",
      "The AI request timed out. Please try again.",
      true
    );
  }

  if (lower.includes("api key") || lower.includes("api_key")) {
    return new AiError(
      "CONFIG",
      "Invalid or missing API key. Backend configuration error.",
      false
    );
  }

  return new AiError("API", message, isRetryableApiError(err));
}

/** Safe for UI — never throws */
export function toSafeAiError(err: unknown): AiError {
  try {
    return toAiError(err);
  } catch {
    return new AiError("UNKNOWN", "An unexpected AI error occurred.", false);
  }
}
