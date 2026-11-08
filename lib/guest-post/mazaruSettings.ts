import type { TonightSocialContext } from "@/lib/profile/tonightSocialContext";

export type MazaruMode = "mazaru" | "mazaranai";

export type GenderMix =
  | "balanced"
  | "mostly_men"
  | "mostly_women"
  | "not_say";

export type MergeMood = "lively" | "conversation";

export type MergeMeetup = "here" | "can_move" | "either";

export type MazaruDetails = {
  currentHeadcount: number | null;
  currentGenderMix: GenderMix | null;
  mergeMaxHeadcount: number | null;
  mergeGenderMix: GenderMix | null;
  mergeMood: MergeMood | null;
  mergeMeetup: MergeMeetup | null;
};

export type PostMazaruSettings = {
  mode: MazaruMode | null;
  details: MazaruDetails;
};

export const GENDER_MIX_OPTIONS: { id: GenderMix; label: string }[] = [
  { id: "balanced", label: "半々くらい" },
  { id: "mostly_men", label: "男性多め" },
  { id: "mostly_women", label: "女性多め" },
  { id: "not_say", label: "指定しない" },
];

export const MERGE_MOOD_OPTIONS: { id: MergeMood; label: string; hint: string }[] =
  [
    { id: "lively", label: "わいわい系", hint: "盛り上がり優先" },
    {
      id: "conversation",
      label: "会話重視",
      hint: "落ち着いて話したい",
    },
  ];

export const MERGE_MEETUP_OPTIONS: {
  id: MergeMeetup;
  label: string;
}[] = [
  { id: "here", label: "この店で合流" },
  { id: "can_move", label: "移動できる" },
  { id: "either", label: "どちらでも" },
];

const GENDER_SET = new Set<GenderMix>([
  "balanced",
  "mostly_men",
  "mostly_women",
  "not_say",
]);
const MOOD_SET = new Set<MergeMood>(["lively", "conversation"]);
const MEETUP_SET = new Set<MergeMeetup>(["here", "can_move", "either"]);

export function defaultMazaruDetails(): MazaruDetails {
  return {
    currentHeadcount: null,
    currentGenderMix: null,
    mergeMaxHeadcount: null,
    mergeGenderMix: null,
    mergeMood: null,
    mergeMeetup: null,
  };
}

export function defaultMazaruSettings(): PostMazaruSettings {
  return { mode: null, details: defaultMazaruDetails() };
}

export function hasMazaruSelection(settings: PostMazaruSettings): boolean {
  return settings.mode !== null;
}

function parseHeadcount(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const n = Math.round(value);
  if (n < 1 || n > 20) return null;
  return n;
}

function parseGenderMix(value: unknown): GenderMix | null {
  return typeof value === "string" && GENDER_SET.has(value as GenderMix)
    ? (value as GenderMix)
    : null;
}

export function parseMazaruDetails(raw: unknown): MazaruDetails {
  if (!raw || typeof raw !== "object") return defaultMazaruDetails();
  const o = raw as Record<string, unknown>;
  return {
    currentHeadcount: parseHeadcount(o.currentHeadcount),
    currentGenderMix: parseGenderMix(o.currentGenderMix),
    mergeMaxHeadcount: parseHeadcount(o.mergeMaxHeadcount),
    mergeGenderMix: parseGenderMix(o.mergeGenderMix),
    mergeMood:
      typeof o.mergeMood === "string" && MOOD_SET.has(o.mergeMood as MergeMood)
        ? (o.mergeMood as MergeMood)
        : null,
    mergeMeetup:
      typeof o.mergeMeetup === "string" &&
      MEETUP_SET.has(o.mergeMeetup as MergeMeetup)
        ? (o.mergeMeetup as MergeMeetup)
        : null,
  };
}

export function parseMazaruFromRow(row: {
  mazaru_mode?: unknown;
  mazaru_details?: unknown;
}): Pick<PostMazaruSettings, "mode" | "details"> {
  const modeRaw = row.mazaru_mode;
  const mode: MazaruMode | null =
    modeRaw === "mazaru" || modeRaw === "mazaranai" ? modeRaw : null;
  return {
    mode,
    details: parseMazaruDetails(row.mazaru_details),
  };
}

export function genderMixLabel(id: GenderMix | null): string | null {
  if (!id) return null;
  return GENDER_MIX_OPTIONS.find((o) => o.id === id)?.label ?? null;
}

export function mergeMoodLabel(id: MergeMood | null): string | null {
  if (!id) return null;
  return MERGE_MOOD_OPTIONS.find((o) => o.id === id)?.label ?? null;
}

export function mergeMeetupLabel(id: MergeMeetup | null): string | null {
  if (!id) return null;
  return MERGE_MEETUP_OPTIONS.find((o) => o.id === id)?.label ?? null;
}

export function mazaruToSocialContext(
  settings: PostMazaruSettings,
): TonightSocialContext {
  if (settings.mode === "mazaru") {
    return { mergeAttitude: "open", vibeScale: null };
  }
  if (settings.mode === "mazaranai") {
    return { mergeAttitude: "closed", vibeScale: null };
  }
  return { mergeAttitude: null, vibeScale: null };
}

export function socialContextToMazaruMode(
  ctx: TonightSocialContext,
): MazaruMode | null {
  if (ctx.mergeAttitude === "open") return "mazaru";
  if (ctx.mergeAttitude === "closed") return "mazaranai";
  return null;
}

export function normalizeMazaruDetails(details: MazaruDetails): MazaruDetails {
  return {
    currentHeadcount: parseHeadcount(details.currentHeadcount),
    currentGenderMix: parseGenderMix(details.currentGenderMix),
    mergeMaxHeadcount: parseHeadcount(details.mergeMaxHeadcount),
    mergeGenderMix: parseGenderMix(details.mergeGenderMix),
    mergeMood:
      details.mergeMood && MOOD_SET.has(details.mergeMood)
        ? details.mergeMood
        : null,
    mergeMeetup:
      details.mergeMeetup && MEETUP_SET.has(details.mergeMeetup)
        ? details.mergeMeetup
        : null,
  };
}
