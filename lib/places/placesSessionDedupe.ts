const shopPhotoInflight = new Map<string, Promise<string | null>>();
const shopPhotoResolved = new Map<string, string | null>();

export function getSessionCachedShopPhoto(shopId: string): string | null | undefined {
  if (shopPhotoResolved.has(shopId)) {
    return shopPhotoResolved.get(shopId) ?? null;
  }
  return undefined;
}

export function rememberSessionShopPhoto(
  shopId: string,
  url: string | null,
): void {
  shopPhotoResolved.set(shopId, url);
}

export function dedupeShopPhotoFetch(
  shopId: string,
  fetcher: () => Promise<string | null>,
): Promise<string | null> {
  const session = getSessionCachedShopPhoto(shopId);
  if (session !== undefined) {
    return Promise.resolve(session);
  }

  const inflight = shopPhotoInflight.get(shopId);
  if (inflight) return inflight;

  const promise = fetcher()
    .then((url) => {
      rememberSessionShopPhoto(shopId, url);
      return url;
    })
    .finally(() => {
      shopPhotoInflight.delete(shopId);
    });

  shopPhotoInflight.set(shopId, promise);
  return promise;
}
