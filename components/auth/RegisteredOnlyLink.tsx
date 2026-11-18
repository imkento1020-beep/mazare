"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isRegisteredUser } from "@/lib/auth/anonymous";
import { useAnonymousAuth } from "@/components/auth/AnonymousAuthProvider";
import { usePostAuthPrompt } from "@/hooks/usePostAuthPrompt";

type RegisteredOnlyLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  onBeforeNavigate?: () => void;
};

export default function RegisteredOnlyLink({
  href,
  className,
  children,
  onBeforeNavigate,
}: RegisteredOnlyLinkProps) {
  const router = useRouter();
  const { user, ready } = useAnonymousAuth();
  const { promptRegistration } = usePostAuthPrompt();

  if (ready && isRegisteredUser(user)) {
    return (
      <Link
        href={href}
        className={className}
        onClick={() => onBeforeNavigate?.()}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        onBeforeNavigate?.();
        if (!ready) return;
        if (isRegisteredUser(user)) {
          router.push(href);
          return;
        }
        promptRegistration(href);
      }}
    >
      {children}
    </button>
  );
}