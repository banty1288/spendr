const inflight = new Map<string, Promise<unknown>>();

/**
 * Collapse concurrent identical requests into one in-flight promise.
 */
export function dedupeRequest<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key);
  if (existing) return existing as Promise<T>;

  const promise = fn().finally(() => {
    inflight.delete(key);
  });

  inflight.set(key, promise);
  return promise;
}

export function clearInflight(keyPrefix?: string): void {
  if (!keyPrefix) {
    inflight.clear();
    return;
  }
  for (const key of inflight.keys()) {
    if (key.startsWith(keyPrefix)) inflight.delete(key);
  }
}
