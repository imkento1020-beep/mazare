import { MOOD_OPTIONS } from "@/lib/owner/constants";

export const MAX_MOOD_TAGS = 8;
export const MAX_CUSTOM_MOOD_LENGTH = 20;

const PRESET_MOOD_IDS = new Set<string>(MOOD_OPTIONS.map((option) => option.id));

export function splitMoods(moods: string[]) {
  const preset = new Set<string>();
  const custom: string[] = [];

  for (const mood of moods) {
    const trimmed = mood.trim();
    if (!trimmed) continue;

    if (PRESET_MOOD_IDS.has(trimmed)) {
      preset.add(trimmed);
      continue;
    }

    if (!custom.includes(trimmed)) {
      custom.push(trimmed);
    }
  }

  return { preset, custom };
}

export function mergeMoods(preset: Set<string>, custom: string[]) {
  return [...Array.from(preset), ...custom];
}

export function normalizeCustomMoodInput(input: string) {
  return input.trim().replace(/\s+/g, " ");
}

export function validateCustomMoodInput(
  input: string,
  preset: Set<string>,
  custom: string[],
): string | null {
  const normalized = normalizeCustomMoodInput(input);

  if (!normalized) {
    return "タグを入力してください";
  }

  if (normalized.length > MAX_CUSTOM_MOOD_LENGTH) {
    return `タグは${MAX_CUSTOM_MOOD_LENGTH}文字以内で入力してください`;
  }

  if (preset.has(normalized) || custom.includes(normalized)) {
    return "同じタグが既に追加されています";
  }

  if (preset.size + custom.length >= MAX_MOOD_TAGS) {
    return `タグは最大${MAX_MOOD_TAGS}個まで追加できます`;
  }

  return null;
}

export function addCustomMood(
  input: string,
  preset: Set<string>,
  custom: string[],
): { custom: string[]; error: string | null } {
  const error = validateCustomMoodInput(input, preset, custom);
  if (error) {
    return { custom, error };
  }

  return {
    custom: [...custom, normalizeCustomMoodInput(input)],
    error: null,
  };
}
