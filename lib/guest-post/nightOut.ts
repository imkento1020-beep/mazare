import type { VibePost } from "@/lib/home/types";

export type NightOutInput = {
  /** 今夜何軒目（1〜10） */
  stopNumber: number | null;
  drinkName: string;
  /** 今夜トータル杯数 */
  tonightTotalCups: number | null;
  /** 一緒に飲んでいる人数（1〜10） */
  partySize: number | null;
};

export function normalizeNightOutInput(input: NightOutInput): {
  stop_number: number | null;
  visit_order: number | null;
  drink_name: string | null;
  drink_cups: number | null;
  drink_count: number | null;
  party_size: number | null;
} {
  const stop =
    input.stopNumber != null && input.stopNumber >= 1 && input.stopNumber <= 10
      ? Math.floor(input.stopNumber)
      : null;

  const drink = input.drinkName.trim().slice(0, 40);
  const drink_name = drink || null;

  let drink_cups: number | null = null;
  if (input.tonightTotalCups != null && input.tonightTotalCups >= 1) {
    drink_cups = Math.min(99, Math.floor(input.tonightTotalCups));
  }

  let party_size: number | null = null;
  if (input.partySize != null && input.partySize >= 1) {
    party_size = Math.min(10, Math.floor(input.partySize));
  }

  return {
    stop_number: stop,
    visit_order: stop,
    drink_name,
    drink_cups,
    drink_count: drink_cups,
    party_size,
  };
}

export function parseNightOutFromRow(row: Record<string, unknown>) {
  const visitRaw = row.visit_order;
  const stopRaw = row.stop_number;
  const orderFromVisit =
    typeof visitRaw === "number" && visitRaw >= 1 ? visitRaw : null;
  const orderFromStop =
    typeof stopRaw === "number" && stopRaw >= 1 ? stopRaw : null;
  const stop_number = orderFromVisit ?? orderFromStop;

  const drinkRaw = row.drink_name;
  const drink_name =
    typeof drinkRaw === "string" && drinkRaw.trim() ? drinkRaw.trim() : null;

  const countRaw = row.drink_count;
  const cupsRaw = row.drink_cups;
  const drink_cups =
    typeof countRaw === "number" && countRaw >= 1
      ? countRaw
      : typeof cupsRaw === "number" && cupsRaw >= 1
        ? cupsRaw
        : null;

  const partyRaw = row.party_size;
  const party_size =
    typeof partyRaw === "number" && partyRaw >= 1 ? partyRaw : null;

  return {
    stop_number,
    visit_order: stop_number,
    drink_name,
    drink_cups,
    drink_count: drink_cups,
    party_size,
  };
}

export function getVisitOrder(
  post: Pick<VibePost, "visit_order" | "stop_number">,
): number | null {
  return post.visit_order ?? post.stop_number ?? null;
}

export function getTonightCupDisplay(
  post: Pick<VibePost, "drink_count" | "drink_cups">,
  fallbackTotal?: number | null,
): number | null {
  if (post.drink_count != null && post.drink_count >= 1) return post.drink_count;
  if (post.drink_cups != null && post.drink_cups >= 1) return post.drink_cups;
  if (fallbackTotal != null && fallbackTotal >= 1) return fallbackTotal;
  return null;
}

export function formatNightOutSummary(
  post: Pick<VibePost, "stop_number" | "drink_name" | "drink_cups" | "drink_count">,
): string | null {
  const parts: string[] = [];

  if (post.stop_number != null) {
    parts.push(`${post.stop_number}軒目`);
  }

  const cups = getTonightCupDisplay(post);
  if (post.drink_name) {
    parts.push(post.drink_name);
    if (cups != null) parts.push(`今夜${cups}杯目`);
  } else if (cups != null) {
    parts.push(`今夜${cups}杯目`);
  }

  if (parts.length === 0) return null;
  return parts.join(" · ");
}

export function hasNightOutInfo(
  post: Pick<
    VibePost,
    "stop_number" | "drink_name" | "drink_cups" | "drink_count" | "party_size"
  >,
) {
  return (
    getVisitOrder(post) != null ||
    Boolean(post.drink_name) ||
    getTonightCupDisplay(post) != null ||
    (post.party_size != null && post.party_size >= 1)
  );
}
