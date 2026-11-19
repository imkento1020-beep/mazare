import {
  genderMixLabel,
  mergeMeetupLabel,
  mergeMoodLabel,
  type MazaruDetails,
  type PostMazaruSettings,
} from "@/lib/guest-post/mazaruSettings";
import {
  labelForMergeAttitude,
  MERGE_ATTITUDES,
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
      value: `${details.currentHeadcount}人`,
    });
  }

  if (details.currentGenderMix) {
    rows.push({
      label: "いまの男女比",
      value: genderMixLabel(details.currentGenderMix) ?? "",
    });
  }

  if (details.mergeMaxHeadcount != null) {
    rows.push({
      label: "合流後の最大人数",
      value: `${details.mergeMaxHeadcount}人まで`,
    });
  }

  if (details.mergeGenderMix) {
    rows.push({
      label: "求める男女比",
      value: genderMixLabel(details.mergeGenderMix) ?? "",
    });
  }

  if (details.mergeMood) {
    rows.push({
      label: "今夜の飲みの気分",
      value: mergeMoodLabel(details.mergeMood) ?? "",
    });
  }

  if (details.mergeMeetup) {
    rows.push({
      label: "どこで合流する？",
      value: mergeMeetupLabel(details.mergeMeetup) ?? "",
    });
  }

  return rows;
}

/** フィード上のタグ用（人数・男女比などは出さない） */
export function feedMergeIntentLabel(
  mazaru: Pick<PostMazaruSettings, "mode">,
  social: TonightSocialContext,
): string {
  if (mazaru.mode === "mazaru") {
    return labelForMergeAttitude("open") ?? "合流・声かけ OK";
  }
  if (mazaru.mode === "mazaranai") {
    return "マザらない";
  }
  return (
    labelForMergeAttitude(social.mergeAttitude) ?? "合流・マザる設定"
  );
}

export function feedMergeIntentTone(
  mazaru: Pick<PostMazaruSettings, "mode">,
  social: TonightSocialContext,
): "open" | "closed" | "neutral" {
  if (mazaru.mode === "mazaru" || social.mergeAttitude === "open") {
    return "open";
  }
  if (mazaru.mode === "mazaranai" || social.mergeAttitude === "closed") {
    return "closed";
  }
  return "neutral";
}

export function canShowMergeContextSheet(
  mazaru: Pick<PostMazaruSettings, "mode" | "details">,
  social: TonightSocialContext,
  partySize: number | null | undefined,
): boolean {
  if (mazaru.mode) return true;
  if (social.mergeAttitude) return true;
  if (buildMazaruDetailRows(mazaru.details).length > 0) return true;
  if (partySize != null && partySize >= 1) return true;
  return false;
}

export function mergeAttitudeDescription(
  attitude: TonightSocialContext["mergeAttitude"],
): string | null {
  if (!attitude) return null;
  return MERGE_ATTITUDES.find((m) => m.id === attitude)?.description ?? null;
}

export function hasMazaruDetailFields(details: MazaruDetails): boolean {
  return buildMazaruDetailRows(details).length > 0;
}