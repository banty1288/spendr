import { AiError } from "./errors";

export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label = "Gemini request"
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(
        new AiError(
          "TIMEOUT",
          `${label} timed out after ${Math.round(ms / 1000)}s. Please try again.`,
          true
        )
      );
    }, ms);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
