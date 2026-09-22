"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useAnonymousAuth } from "@/components/auth/AnonymousAuthProvider";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";

type FormalRegistrationLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  title?: string;
  description?: string;
};

export default function FormalRegistrationLink({
  href,
  className,
  children,
  title,
  description,
}: FormalRegistrationLinkProps) {
  const { isAnonymous, ready } = useAnonymousAuth();
  const { openFormalRegistrationPrompt } = useAuthPrompt();

  if (ready && isAnonymous) {
    return (
      <button
        type="button"
        className={className}
        onClick={() =>
          openFormalRegistrationPrompt({
            returnPath: href,
            title,
            description,
          })
        }
      >
        {children}
      </button>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
