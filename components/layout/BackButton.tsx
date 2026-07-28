"use client";

import Link from "next/link";

type BackButtonProps = {
  href: string;
  label?: string;
};

export default function BackButton({ href, label = "戻る" }: BackButtonProps) {
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
