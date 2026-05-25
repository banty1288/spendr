const locks = new Set<string>();

export function tryAcquireLock(key: string): boolean {
  if (locks.has(key)) return false;
  locks.add(key);
  return true;
}

export function releaseLock(key: string): void {
  locks.delete(key);
}

export async function withRequestLock<T>(
  key: string,
  fn: () => Promise<T>
): Promise<T> {
  if (!tryAcquireLock(key)) {
    throw new Error("REQUEST_IN_FLIGHT");
  }
  try {
    return await fn();
  } finally {
    releaseLock(key);
  }
}
