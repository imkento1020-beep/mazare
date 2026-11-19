"use client";

import PostComposeSheet from "@/components/guest-post/compose/PostComposeSheet";
import { MazaranaiIcon, MazaruIcon } from "@/components/icons/MazaruModeIcons";
import {
  buildMazaruDetailRows,
  mergeAttitudeDescription,
  type MergeDetailRow,
} from "@/lib/guest-post/mergeDetailContent";
import { labelForMergeAttitude } from "@/lib/profile/tonightSocialContext";
import type { PostMazaruSettings } from "@/lib/guest-post/mazaruSettings";
import type { TonightSocialContext } from "@/lib/profile/tonightSocialContext";

type MergeContextDetailSheetProps = {
  open: boolean;
  onClose: () => void;
  authorName: string;
  mazaru: Pick<PostMazaruSettings, "mode" | "details">;
  social: TonightSocialContext;
  partySize: number | null | undefined;
};

function DetailBlock({
  title,
  description,
  children,
}: {
  title: string;
  description?: string | null;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0d0d12] px-4 py-3.5">
      <p className="text-[11px] font-bold uppercase tracking-wide text-[#5a5668]">
        {title}
      </p>
      {children ? <div className="mt-2">{children}</div> : null}
      {description ? (
        <p className="mt-2 text-sm leading-relaxed text-[#9994a8]">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function MazaruRows({ rows }: { rows: MergeDetailRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-[#9994a8]">
        人数や雰囲気の細かい指定はありません。気になったらコメントや連絡で聞いてみましょう。
      </p>
    );
  }

  return (
    <dl className="space-y-2.5">
      {rows.map((row) => (
        <div key={row.label} className="flex gap-3 text-sm">
          <dt className="w-24 shrink-0 text-[#5a5668]">{row.label}</dt>
          <dd className="font-semibold text-[#eeeaf4]">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function MergeContextDetailSheet({
  open,
  onClose,
  authorName,
  mazaru,
  social,
  partySize,
}: MergeContextDetailSheetProps) {
  const mazaruRows =
    mazaru.mode === "mazaru" ? buildMazaruDetailRows(mazaru.details) : [];

  return (
    <PostComposeSheet
      open={open}
      title="今夜の合流・席の情報"
      onClose={onClose}
    >
      <p className="text-xs leading-relaxed text-[#9994a8]">
        <span className="font-bold text-[#eeeaf4]">{authorName}</span>
        さんが投稿時に登録した内容です。
      </p>

      {mazaru.mode === "mazaru" ? (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#00e87a]/35 bg-[#00e87a]/10 px-4 py-3">
          <MazaruIcon size={22} className="text-[#00e87a]" />
          <div>
            <p className="text-sm font-black text-[#00e87a]">マザる（合流ウェルカム）</p>
            <p className="text-[11px] text-[#7dffb8]/90">
              下に人数や雰囲気の詳細があります
            </p>
          </div>
        </div>
      ) : mazaru.mode === "mazaranai" ? (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3">
          <MazaranaiIcon size={22} className="text-[#9994a8]" />
          <div>
            <p className="text-sm font-bold text-[#c4bfd6]">マザらない</p>
            <p className="text-[11px] text-[#9994a8]">今夜は投稿・記録のみ</p>
          </div>
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        {social.mergeAttitude ? (
          <DetailBlock
            title="合流・声かけ"
            description={mergeAttitudeDescription(social.mergeAttitude)}
          >
            <p className="text-sm font-bold text-[#00e87a]">
              {labelForMergeAttitude(social.mergeAttitude)}
            </p>
          </DetailBlock>
        ) : null}

        {partySize != null && partySize >= 1 ? (
          <DetailBlock title="「誰と？」（投稿の同行人数）">
            <p className="text-sm font-bold text-[#eeeaf4]">{partySize}人</p>
          </DetailBlock>
        ) : null}

        {mazaru.mode === "mazaru" ? (
          <DetailBlock title="登録した合流の詳細">
            <MazaruRows rows={mazaruRows} />
          </DetailBlock>
        ) : null}

        {mazaru.mode === "mazaru" && social.mergeAttitude === "open" ? (
          <p className="text-center text-[11px] text-[#5a5668]">
            合流の意思が伝わったら、投稿の「連絡する」からメッセージを送れます。
          </p>
        ) : null}
      </div>
    </PostComposeSheet>
  );
}