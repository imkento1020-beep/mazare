import type { ReactNode } from "react";
import UserIcon from "@/components/icons/UserIcon";
import TonightSocialContextBadges from "@/components/profile/TonightSocialContextBadges";
import {
  hasAnySocialContext,
  type TonightSocialContext,
} from "@/lib/profile/tonightSocialContext";

export type ProfileStat = {
  value: number | string;
  label: string;
};

type ProfileHeroProps = {
  displayName: string;
  avatarUrl?: string | null;
  /** 参加日など短い補足（ヒーロー直下） */
  subtitle?: string | null;
  /** 自己紹介 */
  bio?: string | null;
  /** メールなど控えめな補足（自分のマイページ用） */
  footnote?: string | null;
  socialContext?: TonightSocialContext | null;
  stats?: ProfileStat[];
  actions?: ReactNode;
};

export default function ProfileHero({
  displayName,
  avatarUrl,
  subtitle = null,
  bio = null,
  footnote = null,
  socialContext = null,
  stats = [],
  actions,
}: ProfileHeroProps) {
  const bioText = bio?.trim() ?? "";
  const hasSocial = socialContext && hasAnySocialContext(socialContext);
  const statColumnClass =
    stats.length <= 1
      ? "grid-cols-1"
      : stats.length === 2
        ? "grid-cols-2"
        : "grid-cols-3";
  const statGridWidthClass =
    stats.length === 2 ? "mx-auto w-full max-w-[14rem]" : "";

  return (
    <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111118]">
      <div
        className="relative h-20 bg-gradient-to-br from-[#ff3d00]/22 via-[#1a1520] to-[#111118]"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,61,0,0.18),transparent_60%)]" />
      </div>

      <div className="relative px-5 pb-5">
        <div className="-mt-11 flex items-end gap-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-[3px] border-[#111118] bg-[#18181f] ring-2 ring-[#ff3d00]/20">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <UserIcon size={36} color="#5a5668" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 pb-1">
            <h1 className="truncate text-xl font-black tracking-tight text-[#eeeaf4]">
              {displayName}
            </h1>
            {subtitle ? (
              <p className="mt-0.5 text-xs text-[#9994a8]">{subtitle}</p>
            ) : null}
          </div>
        </div>

        {bioText ? (
          <p className="mt-4 text-sm leading-relaxed text-[#c4bfd6] whitespace-pre-wrap">
            {bioText}
          </p>
        ) : null}

        <div className="mt-3">
          {hasSocial ? (
            <TonightSocialContextBadges context={socialContext} size="md" />
          ) : (
            <p className="text-xs text-[#5a5668]">合流・席の人数感は未設定</p>
          )}
        </div>

        {stats.length > 0 ? (
          <dl
            className={`mt-5 grid divide-x divide-white/[0.08] rounded-xl border border-white/[0.07] bg-[#0d0d12] py-3.5 ${statColumnClass} ${statGridWidthClass}`}
          >
            {stats.map((stat) => (
              <div key={stat.label} className="px-2 text-center">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="text-xl font-black tabular-nums leading-none text-[#eeeaf4]">
                  {stat.value}
                </dd>
                <dd className="mt-1.5 text-[11px] font-semibold text-[#5a5668]">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        {actions ? (
          <div className="mt-4 flex flex-wrap gap-2">{actions}</div>
        ) : null}

        {footnote ? (
          <p className="mt-3 truncate text-[11px] text-[#5a5668]">{footnote}</p>
        ) : null}
      </div>
    </section>
  );
}