const MIN_INTERVAL_MS = 1000;
let lastPlacesApiAt = 0;
let chain: Promise<unknown> = Promise.resolve();

function waitForSlot(): Promise<void> {
  const now = Date.now();
  const waitMs = Math.max(0, MIN_INTERVAL_MS - (now - lastPlacesApiAt));
  if (waitMs === 0) {
    lastPlacesApiAt = now;
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    setTimeout(() => {
      lastPlacesApiAt = Date.now();
      resolve();
    }, waitMs);
  });
}

/** Google Places 系 HTTP 呼び出しを 1 秒あたり最大 1 回に直列化 */
export async function withPlacesApiRateLimit<T>(
  fn: () => Promise<T>,
): Promise<T> {
  const run = async () => {
    await waitForSlot();
    return fn();
  };
  const next = chain.then(run, run);
  chain = next.then(
    () => undefined,
    () => undefined,
  );
  return next as Promise<T>;
}
