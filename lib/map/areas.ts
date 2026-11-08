import { TOKYO_DRINKING_AREAS } from "@/lib/geo/tokyoDrinkingAreas";

export type MapPin = {
  shopId: string;
  name: string;
  area: string;
  x: number;
  y: number;
  live: boolean;
};

/** 簡易ピン位置（%）— 東京ナイトマップ用 */
const AREA_POSITIONS: Record<string, { x: number; y: number }> =
  Object.fromEntries(
    TOKYO_DRINKING_AREAS.map((area, index) => [
      area.id,
      {
        x: 18 + (index % 6) * 12,
        y: 22 + Math.floor(index / 6) * 18,
      },
    ]),
  );

export function extractArea(address: string) {
  for (const area of TOKYO_DRINKING_AREAS) {
    if (area.matchTerms.some((term) => address.includes(term))) {
      return area.id;
    }
  }
  return "渋谷";
}

export function addressToPin(
  shopId: string,
  name: string,
  address: string,
  live: boolean,
): MapPin {
  const area = extractArea(address);
  const pos = AREA_POSITIONS[area] ?? { x: 50, y: 50 };
  return { shopId, name, area, x: pos.x, y: pos.y, live };
}
