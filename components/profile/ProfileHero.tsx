import type { ReactNode } from "react";
import UserIcon from "@/components/icons/UserIcon";
import TonightSocialMoodBadge from "@/components/profile/TonightSocialMoodBadge";
import type { TonightSocialMoodId } from "@/lib/profile/tonightSocialMood";

export type ProfileStat = {
  value: number | string;
  label: string;
};

type ProfileHeroProps = {
  displayName: string;
  avatarUrl?: string | null;
  metaLine?: string | null;
  mood?: TonightSocialMoodId | null;
  stats?: ProfileStat[];
  actions?: ReactNode;
};

export default function ProfileHero({
  displayName,
  avatarUrl,
  metaLine,
  mood = null,
  stats = [],
  actions,
}: ProfileHeroProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111118]">
      <div
        className="relative h-24 bg-gradient-to-br from-[#ff3d00]/25 via-[#1a1520] to-[#111118]"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,61,0,0.2),transparent_55%)]" />
      </div>

      <div className="relative px-5 pb-5">
        <div className="-mt-12 flex gap-4">
          <div className="h-[88px] w-[88px] shrink-0 overflow-hidden rounded-full border-[3px] border-[#111118] bg-[#18181f] ring-2 ring-[#ff3d00]/25">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <UserIcon size={40} color="#5a5668" />
              </div>
            )}
          </div>

          {stats.length > 0 && (
            <div className="mt-8 flex flex-1 items-center justify-around gap-2 text-center">
              {stats.map((stat) => (
                <div key={stat.label} className="min-w-0 flex-1">
                  <p className="text-lg font-black tabular-nums leading-none text-[#eeeaf4]">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[10px] font-semibold text-[#5a5668]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4">
          <h1 className="text-xl font-black tracking-tight text-[#eeeaf4]">
            {displayName}
          </h1>
          {metaLine && (
            <p className="mt-0.5 truncate text-xs text-[#9994a8]">{metaLine}</p>
          )}
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <TonightSocialMoodBadge mood={mood} size="md" />
            {!mood && (
              <span className="text-[11px] text-[#5a5668]">
                今夜の気分は未設定
              </span>
            )}
          </div>
        </div>

        {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
      </div>
    </section>
  );
}
