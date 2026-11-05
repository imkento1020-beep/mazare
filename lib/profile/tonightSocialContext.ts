import type { TonightSocialMoodId } from "@/lib/profile/tonightSocialMood";
import { isTonightSocialMoodId } from "@/lib/profile/tonightSocialMood";

/** 知らない人との合流・声かけ */
export const MERGE_ATTITUDES = [
  {
    id: "open",
    label: "合流・声かけ OK",
    description: "知らない人からの連絡や合流を歓迎",
  },
  {
    id: "closed",
    label: "今夜は自分のペース",
    description: "見る・記録は OK。合流や声かけは望まない",
  },
] as const;

/** 席の人数感（合流の意思とは独立） */
export const VIBE_SCALES = [
  {
    id: "solo",
    label: "ひとり",
    description: "1人で過ごしている",
  },
  {
    id: "small",
    label: "少人数",
    description: "2〜3人くらいの席",
  },
  {
    id: "lively",
    label: "にぎやか",
    description: "大人数・賑わっている席もアリ",
  },
] as const;

export type MergeAttitude = (typeof MERGE_ATTITUDES)[number]["id"];
export type VibeScale = (typeof VIBE_SCALES)[number]["id"];

export type TonightSocialContext = {
  mergeAttitude: MergeAttitude | null;
  vibeScale: VibeScale | null;
};

export function isMergeAttitude(
  value: string | null | undefined,
): value is MergeAttitude {
  return value === "open" || value === "closed";
}

export function isVibeScale(value: string | null | undefined): value is VibeScale {
  return value === "solo" || value === "small" || value === "lively";
}

export function labelForMergeAttitude(
  value: MergeAttitude | null | undefined,
): string | null {
  if (!value) return null;
  return MERGE_ATTITUDES.find((m) => m.id === value)?.label ?? null;
}

export function labelForVibeScale(
  value: VibeScale | null | undefined,
): string | null {
  if (!value) return null;
  return VIBE_SCALES.find((v) => v.id === value)?.label ?? null;
}

/** 旧4択 → 2軸（データ移行・読み取りフォールバック） */
export function socialContextFromLegacyMood(
  mood: TonightSocialMoodId | string | null | undefined,
): TonightSocialContext {
  if (!mood || !isTonightSocialMoodId(mood)) {
    return { mergeAttitude: null, vibeScale: null };
  }
  switch (mood) {
    case "merge_welcome":
      return { mergeAttitude: "open", vibeScale: null };
    case "solo":
      return { mergeAttitude: "closed", vibeScale: "solo" };
    case "pair_ok":
      return { mergeAttitude: null, vibeScale: "small" };
    case "large_ok":
      return { mergeAttitude: null, vibeScale: "lively" };
    default:
      return { mergeAttitude: null, vibeScale: null };
  }
}

export function parseTonightSocialContextFromProfile(row: {
  merge_attitude?: unknown;
  vibe_scale?: unknown;
  tonight_social_mood?: unknown;
}): TonightSocialContext {
  const mergeRaw = row.merge_attitude;
  const vibeRaw = row.vibe_scale;
  const mergeAttitude = isMergeAttitude(
    typeof mergeRaw === "string" ? mergeRaw : null,
  )
    ? (mergeRaw as MergeAttitude)
    : null;
  const vibeScale = isVibeScale(typeof vibeRaw === "string" ? vibeRaw : null)
    ? (vibeRaw as VibeScale)
    : null;

  if (mergeAttitude != null || vibeScale != null) {
    return { mergeAttitude, vibeScale };
  }

  const legacy =
    typeof row.tonight_social_mood === "string" ? row.tonight_social_mood : null;
  return socialContextFromLegacyMood(legacy);
}

export function resolvePostAuthorSocialContext(input: {
  author_merge_attitude?: unknown;
  author_vibe_scale?: unknown;
  author_tonight_social_mood?: unknown;
  profile?: TonightSocialContext | null;
}): TonightSocialContext {
  const snapMerge = isMergeAttitude(
    typeof input.author_merge_attitude === "string"
      ? input.author_merge_attitude
      : null,
  )
    ? (input.author_merge_attitude as MergeAttitude)
    : null;
  const snapVibe = isVibeScale(
    typeof input.author_vibe_scale === "string" ? input.author_vibe_scale : null,
  )
    ? (input.author_vibe_scale as VibeScale)
    : null;

  if (snapMerge != null || snapVibe != null) {
    return { mergeAttitude: snapMerge, vibeScale: snapVibe };
  }

  const legacySnap =
    typeof input.author_tonight_social_mood === "string"
      ? input.author_tonight_social_mood
      : null;
  if (legacySnap && isTonightSocialMoodId(legacySnap)) {
    return socialContextFromLegacyMood(legacySnap);
  }

  if (input.profile) {
    return input.profile;
  }

  return { mergeAttitude: null, vibeScale: null };
}

export function hasAnySocialContext(ctx: TonightSocialContext): boolean {
  return ctx.mergeAttitude != null || ctx.vibeScale != null;
}
