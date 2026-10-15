type CacheEntry<T> = {
  expiresAt: number;
  value: Promise<T>;
};

const cache = new Map<string, CacheEntry<unknown>>();

export function getCached<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && hit.expiresAt > now) {
    return hit.value as Promise<T>;
  }

  const value = loader().catch((err) => {
    cache.delete(key);
    throw err;
  });
  cache.set(key, { expiresAt: now + ttlMs, value });
  return value;
}

export function invalidateCached(key: string) {
  cache.delete(key);
}

export function invalidateCachedPrefix(prefix: string) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}
