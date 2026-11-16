"use client";

import type { ReactNode } from "react";
import TonightSocialContextBadges from "@/components/profile/TonightSocialContextBadges";
import {
  MERGE_ATTITUDES,
  VIBE_SCALES,
  hasAnySocialContext,
  type TonightSocialContext,
} from "@/lib/profile/tonightSocialContext";

type ProfileSocialSummaryProps = {
  context: TonightSocialContext;
};

function InfoRow({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0d0d12] px-4 py-3.5">
      <p className="text-[11px] font-bold text-[#5a5668]">{title}</p>
      <div className="mt-2">{children}</div>
      {description ? (
        <p className="mt-2 text-sm leading-relaxed text-[#9994a8]">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export default function ProfileSocialSummary({
  context,
}: ProfileSocialSummaryProps) {
  if (!hasAnySocialContext(context)) {
    return (
      <p className="rounded-xl border border-dashed border-white/10 bg-[#0d0d12] px-4 py-6 text-center text-sm text-[#5a5668]">
        まだ今夜の合流・人数感は設定されていません
      </p>
    );
  }

  const mergeMeta = MERGE_ATTITUDES.find((m) => m.id === context.mergeAttitude);
  const vibeMeta = VIBE_SCALES.find((v) => v.id === context.vibeScale);

  return (
    <div className="space-y-3">
      {context.mergeAttitude ? (
        <InfoRow
          title="合流・声かけ"
          description={mergeMeta?.description}
        >
          <TonightSocialContextBadges
            context={{
              mergeAttitude: context.mergeAttitude,
              vibeScale: null,
            }}
            size="md"
          />
        </InfoRow>
      ) : null}

      {context.vibeScale ? (
        <InfoRow title="席の人数感" description={vibeMeta?.description}>
          <TonightSocialContextBadges
            context={{
              mergeAttitude: null,
              vibeScale: context.vibeScale,
            }}
            size="md"
          />
        </InfoRow>
      ) : null}
    </div>
  );
}