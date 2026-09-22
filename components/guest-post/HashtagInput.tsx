"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_HASHTAG_SUGGESTIONS,
  fetchHashtagSuggestions,
  normalizeHashtagInput,
} from "@/lib/guest-post/createPost";

type HashtagInputProps = {
  tags: string[];
  onChange: (tags: string[]) => void;
};

export default function HashtagInput({ tags, onChange }: HashtagInputProps) {
  const [draft, setDraft] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([
    ...DEFAULT_HASHTAG_SUGGESTIONS,
  ]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const next = await fetchHashtagSuggestions(draft);
      if (!cancelled) setSuggestions(next);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [draft]);

  const displayDraft = useMemo(() => {
    if (!draft) return "#";
    return draft.startsWith("#") ? draft : `#${draft}`;
  }, [draft]);

  function addTag(raw: string) {
    const normalized = normalizeHashtagInput(raw);
    if (!normalized || tags.includes(normalized)) return;
    onChange([...tags, normalized]);
    setDraft("");
  }

  function removeTag(tag: string) {
    onChange(tags.filter((item) => item !== tag));
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-bold text-[#eeeaf4]">ハッシュタグ（任意）</label>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => removeTag(tag)}
            className="rounded-full bg-[#ff3d00]/15 px-3 py-1 text-xs font-bold text-[#ff3d00]"
          >
            {tag} ×
          </button>
        ))}
      </div>
      <input
        value={displayDraft === "#" && !draft ? "" : displayDraft}
        onChange={(event) => {
          const value = event.target.value.replace(/^#+/, "");
          setDraft(value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            addTag(draft);
          }
        }}
        placeholder="# タグを入力"
        className="w-full rounded-[12px] border border-white/10 bg-[#111118] px-4 py-3 text-sm text-[#eeeaf4] outline-none focus:border-[#ff3d00]/50"
      />
      <div className="flex flex-wrap gap-2">
        {suggestions.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => addTag(tag)}
            className="rounded-full border border-white/10 px-3 py-1 text-xs text-[#9994a8] transition hover:border-[#ff3d00]/40 hover:text-[#eeeaf4]"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
