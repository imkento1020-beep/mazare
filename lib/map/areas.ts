export type MapPin = {
  shopId: string;
  name: string;
  area: string;
  x: number;
  y: number;
  live: boolean;
};

const AREA_POSITIONS: Record<string, { x: number; y: number }> = {
  渋谷: { x: 42, y: 58 },
  恵比寿: { x: 55, y: 52 },
  新宿: { x: 38, y: 38 },
  六本木: { x: 62, y: 45 },
  池袋: { x: 48, y: 28 },
};

export function extractArea(address: string) {
  for (const area of Object.keys(AREA_POSITIONS)) {
    if (address.includes(area)) return area;
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
