import { AREA_FILTERS } from "@/lib/home/filters";

const KNOWN_AREAS = AREA_FILTERS.filter(
  (area) => area.id !== "すべて" && area.id !== "その他",
).map((area) => area.id);

export function extractAreaFromAddress(address: string | null | undefined): string {
  if (!address) return "—";

  for (const area of KNOWN_AREAS) {
    if (address.includes(area)) return area;
  }

  return "その他";
}

/** カード表示用: 住所から「渋谷区円山町」のような短いエリア表記を抽出 */
export function extractCompactAreaFromAddress(
  address: string | null | undefined,
): string {
  if (!address) return "—";

  const normalized = address.trim();
  const withoutPref = normalized.replace(
    /^(?:東京都|北海道|(?:京都|大阪)府|.{2,3}県)/,
    "",
  );

  const wardNeighborhood = withoutPref.match(
    /^(.+?区)([^0-9０-９\-－]+?)(?:\d|－|-|$)/,
  );
  if (wardNeighborhood) {
    const neighborhood = wardNeighborhood[2].replace(/丁目$/, "").trim();
    if (neighborhood) return `${wardNeighborhood[1]}${neighborhood}`;
    return wardNeighborhood[1];
  }

  const wardOnly = withoutPref.match(/^(.+?区)/);
  if (wardOnly) return wardOnly[1];

  const known = extractAreaFromAddress(normalized);
  if (known !== "その他") return known;

  if (normalized.length > 14) return `${normalized.slice(0, 14)}…`;
  return normalized;
}
