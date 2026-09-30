"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_HASHTAG_SUGGESTIONS,
  fetchHashtagSuggestions,
} from "@/lib/guest-post/createPost";
import { appendHashtagToBody } from "@/lib/guest-post/composeBody";

type GuestPostBodyHashtagSuggestionsProps = {
  bodyText: string;
  onBodyTextChange: (next: string) => void;
};

export default function GuestPostBodyHashtagSuggestions({
  bodyText,
  onBodyTextChange,
}: GuestPostBodyHashtagSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([
    ...DEFAULT_HASHTAG_SUGGESTIONS,
  ]);

  const draftQuery = useMemo(() => {
    const match = bodyText.match(/#([^\s#]*)$/);
    return match?.[1]?.trim() ?? "";
  }, [bodyText]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const next = await fetchHashtagSuggestions(draftQuery);
      if (!cancelled) setSuggestions(next);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [draftQuery]);

  function addTag(tag: string) {
    onBodyTextChange(appendHashtagToBody(bodyText, tag));
  }

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold text-[#5a5668]">よく使うタグ</p>
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
