import type { Shop } from "./types";

/** この日数以内に登録されたお店を「新着」として表示 */
export const NEW_SHOP_DAYS = 14;

export function isNewShop(
  shop: Pick<Shop, "created_at">,
  now = new Date(),
): boolean {
  if (!shop.created_at) return false;

  const created = new Date(shop.created_at);
  if (Number.isNaN(created.getTime())) return false;

  const ageMs = now.getTime() - created.getTime();
  return ageMs >= 0 && ageMs <= NEW_SHOP_DAYS * 24 * 60 * 60 * 1000;
}
