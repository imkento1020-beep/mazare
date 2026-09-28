import type { VibePost } from "@/lib/home/types";

export const DRINK_PRESETS = [
  "ビール",
  "ハイボール",
  "サワー",
  "チューハイ",
  "ウイスキー",
  "ワイン",
  "カクテル",
  "テキーラ",
  "焼酎",
  "日本酒",
  "ノンアル",
] as const;

export type NightOutInput = {
  stopNumber: number | null;
  drinkName: string;
  drinkCups: number | null;
};

export function normalizeNightOutInput(input: NightOutInput): {
  stop_number: number | null;
  drink_name: string | null;
  drink_cups: number | null;
} {
  const stop =
    input.stopNumber != null && input.stopNumber >= 1 && input.stopNumber <= 30
      ? Math.floor(input.stopNumber)
      : null;

  const drink = input.drinkName.trim().slice(0, 40);
  const drink_name = drink || null;

  let drink_cups: number | null = null;
  if (drink_name && input.drinkCups != null && input.drinkCups >= 1) {
    drink_cups = Math.min(99, Math.floor(input.drinkCups));
  }

  return { stop_number: stop, drink_name, drink_cups };
}

export function parseNightOutFromRow(row: Record<string, unknown>) {
  const stopRaw = row.stop_number;
  const stop_number =
    typeof stopRaw === "number" && stopRaw >= 1 ? stopRaw : null;

  const drinkRaw = row.drink_name;
  const drink_name =
    typeof drinkRaw === "string" && drinkRaw.trim() ? drinkRaw.trim() : null;

  const cupsRaw = row.drink_cups;
  const drink_cups =
    typeof cupsRaw === "number" && cupsRaw >= 1 ? cupsRaw : null;

  return { stop_number, drink_name, drink_cups };
}

export function formatNightOutSummary(
  post: Pick<VibePost, "stop_number" | "drink_name" | "drink_cups">,
): string | null {
  const parts: string[] = [];

  if (post.stop_number != null) {
    parts.push(`${post.stop_number}軒目`);
  }

  if (post.drink_name) {
    if (post.drink_cups != null) {
      parts.push(`${post.drink_name} ${post.drink_cups}杯`);
    } else {
      parts.push(post.drink_name);
    }
  } else if (post.drink_cups != null) {
    parts.push(`${post.drink_cups}杯`);
  }

  if (parts.length === 0) return null;
  return parts.join(" · ");
}

export function hasNightOutInfo(
  post: Pick<VibePost, "stop_number" | "drink_name" | "drink_cups">,
) {
  return formatNightOutSummary(post) != null;
}
