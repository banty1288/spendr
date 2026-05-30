/** Strip surrounding quotes from .env values (common misconfiguration). */
export function sanitizeEnv(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  return value.replace(/^["']|["']$/g, "").trim();
}
