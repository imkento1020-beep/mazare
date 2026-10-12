import type { ReactNode } from "react";
import { FeedPinIcon } from "@/components/icons/FeedActionIcons";
import { ClockIcon } from "@/components/icons/MazareIcons";

export function PinMeta({
  children,
  className = "flex items-center gap-1 text-[11px] text-[#9994a8]",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={className}>
      <FeedPinIcon size={12} color="#9994a8" />
      {children}
    </p>
  );
}

export function ClockMeta({
  children,
  className = "inline-flex items-center gap-1 text-[11px] text-[#9994a8]",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={className}>
      <ClockIcon size={12} color="#9994a8" />
      {children}
    </span>
  );
}
