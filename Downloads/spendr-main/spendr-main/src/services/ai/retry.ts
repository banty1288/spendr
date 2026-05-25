import { isRetryableApiError } from "./errors";

export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  /** Do not retry quota / config errors */
  shouldRetry?: (err: unknown, attempt: number) => boolean;
}

const DEFAULTS: Required<Omit<RetryOptions, "shouldRetry">> = {
  maxAttempts: 4,
  baseDelayMs: 1000,
  maxDelayMs: 16_000,
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function defaultShouldRetry(err: unknown): boolean {
  return isRetryableApiError(err);
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxAttempts, baseDelayMs, maxDelayMs } = { ...DEFAULTS, ...options };
  const shouldRetry = options.shouldRetry ?? defaultShouldRetry;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      if (!shouldRetry(err, attempt) || attempt === maxAttempts) {
        break;
      }

      const backoff = Math.min(
        baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 200,
        maxDelayMs
      );
      await delay(backoff);
    }
  }

  throw lastError;
}
