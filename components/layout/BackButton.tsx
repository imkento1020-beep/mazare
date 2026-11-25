"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type BackButtonProps = {
  href: string;
  label?: string;
  preferHistory?: boolean;
};

export default function BackButton({
  href,
  label = "戻る",
  preferHistory = true,
}: BackButtonProps) {
  const router = useRouter();

  if (preferHistory) {
    return (
      <button
        type="button"
        onClick={() => {
          if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
            return;
          }
          router.push(href);
        }}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#9994a8] transition hover:text-[#eeeaf4]"
      >
        <span aria-hidden>←</span>
        {label}
      </button>
    );
  }

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-[#9994a8] transition hover:text-[#eeeaf4]"
    >
      <span aria-hidden>←</span>
      {label}
    </Link>
  );
}
