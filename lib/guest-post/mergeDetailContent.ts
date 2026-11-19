import {
  genderMixLabel,
  mergeMeetupLabel,
  mergeMoodLabel,
  type MazaruDetails,
  type PostMazaruSettings,
} from "@/lib/guest-post/mazaruSettings";
import {
  hasAnySocialContext,
  labelForMergeAttitude,
  labelForVibeScale,
  MERGE_ATTITUDES,
  VIBE_SCALES,
  type TonightSocialContext,
} from "@/lib/profile/tonightSocialContext";

export type MergeDetailRow = { label: string; value: string };

export function buildMazaruDetailRows(
  details: MazaruDetails,
): MergeDetailRow[] {
  const rows: MergeDetailRow[] = [];

  if (details.currentHeadcount != null) {
    rows.push({
      label: "いまの人数",
      value: `${details.currentHeadcount}人${
        genderMixLabel(details.currentGenderMix)
          ? ` · ${genderMixLabel(details.currentGenderMix)}`
          : ""
      }`,
    });
  } else if (details.currentGenderMix) {
    rows.push({
      label: "いまの席",
      value: genderMixLabel(details.currentGenderMix) ?? "",
    });
  }

  if (details.mergeMaxHeadcount != null) {
    rows.push({
      label: "合流の上限",
      value: `最大${details.mergeMaxHeadcount}人まで${
        genderMixLabel(details.mergeGenderMix)
          ? ` · ${genderMixLabel(details.mergeGenderMix)}`
          : ""
      }`,
    });
  }

  if (details.mergeMood) {
    rows.push({
      label: "合流の雰囲気",
      value: mergeMoodLabel(details.mergeMood) ?? "",
    });
  }

  if (details.mergeMeetup) {
    rows.push({
      label: "合流場所",
      value: mergeMeetupLabel(details.mergeMeetup) ?? "",
    });
  }

  return rows;
}

export function buildMergeContextSummary(
  mazaru: Pick<PostMazaruSettings, "mode" | "details">,
  social: TonightSocialContext,
  partySize: number | null | undefined,
): string | null {
  const parts: string[] = [];

  if (mazaru.mode === "mazaru") {
    const rows = buildMazaruDetailRows(mazaru.details);
    for (const row of rows.slice(0, 2)) {
      parts.push(`${row.label} ${row.value}`);
    }
  }

  if (parts.length === 0) {
    const mergeLabel = labelForMergeAttitude(social.mergeAttitude);
    if (mergeLabel) parts.push(mergeLabel);
    const vibeLabel = labelForVibeScale(social.vibeScale);
    if (vibeLabel) parts.push(`席は${vibeLabel}`);
  }

  if (
    partySize != null &&
    partySize >= 1 &&
    mazaru.details.currentHeadcount == null
  ) {
    parts.push(`同行 ${partySize}人`);
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}

export function canShowMergeContextSheet(
  mazaru: Pick<PostMazaruSettings, "mode" | "details">,
  social: TonightSocialContext,
  partySize: number | null | undefined,
): boolean {
  if (mazaru.mode) return true;
  if (hasAnySocialContext(social)) return true;
  if (partySize != null && partySize >= 1) return true;
  return false;
}

export function mergeAttitudeDescription(
  attitude: TonightSocialContext["mergeAttitude"],
): string | null {
  if (!attitude) return null;
  return MERGE_ATTITUDES.find((m) => m.id === attitude)?.description ?? null;
}

export function vibeScaleDescription(
  scale: TonightSocialContext["vibeScale"],
): string | null {
  if (!scale) return null;
  return VIBE_SCALES.find((v) => v.id === scale)?.description ?? null;
}