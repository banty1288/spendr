import { DEFAULT_THROTTLE_INTERVAL_MS } from "./config/defaults";
import { getAiSettings } from "./config/index";
import { AiError } from "./errors";

const lastApiCallAt = new Map<string, number>();

function getMinApiIntervalMs(): number {
  try {
    return getAiSettings().throttleIntervalMs;
  } catch {
    return DEFAULT_THROTTLE_INTERVAL_MS;
  }
}

export function canMakeApiCall(uid: string): boolean {
  const last = lastApiCallAt.get(uid);
  if (!last) return true;
  return Date.now() - last >= getMinApiIntervalMs();
}

export function markApiCall(uid: string): void {
  lastApiCallAt.set(uid, Date.now());
}

export function getThrottleWaitMs(uid: string): number {
  const last = lastApiCallAt.get(uid) ?? 0;
  const elapsed = Date.now() - last;
  return Math.max(0, getMinApiIntervalMs() - elapsed);
}

export function assertThrottle(uid: string, force = false): void {
  if (force) return;
  if (canMakeApiCall(uid)) return;

  const waitSec = Math.ceil(getThrottleWaitMs(uid) / 1000);
  throw new AiError(
    "QUOTA",
    `Please wait ${waitSec}s before requesting another analysis to save API quota.`,
    false
  );
}
