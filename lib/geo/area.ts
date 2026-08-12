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
