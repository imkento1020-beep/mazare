import type { ReactNode } from "react";
import Link from "next/link";

type ProfileSectionProps = {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  children: ReactNode;
  className?: string;
};

export default function ProfileSection({
  title,
  description,
  actionHref,
  actionLabel,
  children,
  className = "",
}: ProfileSectionProps) {
  return (
    <section className={`scroll-mt-24 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-[#eeeaf4]">{title}</h2>
          {description && (
            <p className="mt-0.5 text-xs leading-relaxed text-[#9994a8]">
              {description}
            </p>
          )}
        </div>
        {actionHref && actionLabel && (
          <Link
            href={actionHref}
            className="shrink-0 text-xs font-bold text-[#ff3d00] hover:underline"
          >
            {actionLabel}
          </Link>
        )}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}
