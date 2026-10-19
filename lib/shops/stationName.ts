export function formatJapaneseStationName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return trimmed;
  if (trimmed.includes("駅")) return trimmed;
  return `${trimmed}駅`;
}

/** Places の displayName から「○○駅」向けの短いラベルを抽出 */
export function stationLabelFromPlaceName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return trimmed;

  const withoutSuffix = trimmed
    .replace(/\s*(駅|Station)\s*$/i, "")
    .replace(/\s*（.*?）\s*$/u, "")
    .trim();

  return formatJapaneseStationName(withoutSuffix || trimmed);
}
