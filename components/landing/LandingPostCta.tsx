"use client";

import type { ReactNode } from "react";
import RegisteredOnlyLink from "@/components/auth/RegisteredOnlyLink";

type LandingPostCtaProps = {
  className?: string;
  children: ReactNode;
};

export default function LandingPostCta({
  className,
  children,
}: LandingPostCtaProps) {
  return (
    <RegisteredOnlyLink href="/post" className={className}>
      {children}
    </RegisteredOnlyLink>
  );
}