/** Classify errors for user-facing copy (never throws) */
export function isAiRelatedError(error: Error): boolean {
  const text = `${error.name} ${error.message}`.toLowerCase();
  return (
    text.includes("gemini") ||
    text.includes("spendr ai") ||
    text.includes("aierror") ||
    text.includes("generative") ||
    text.includes("vite_gemini")
  );
}

export function getPublicErrorMessage(error: Error, isDev: boolean): string {
  if (isAiRelatedError(error)) {
    return "AI insights are temporarily unavailable. The rest of Spendr still works — try again or continue without AI.";
  }

  if (isDev) {
    return error.message || "An unexpected error occurred.";
  }

  return "Something unexpected happened. Your data is safe — try again or reload the app.";
}

export function logAppError(
  error: Error,
  info?: { componentStack?: string | null }
): void {
  console.error("[Spendr] Uncaught error:", error);
  if (info?.componentStack) {
    console.error("[Spendr] Component stack:", info.componentStack);
  }
}
