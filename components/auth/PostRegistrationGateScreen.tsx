"use client";

import Link from "next/link";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import LoginRequiredPanel from "@/components/auth/LoginRequiredPanel";
import { POST_REGISTRATION_PROMPT } from "@/lib/auth/postAccessPrompt";

type PostRegistrationGateScreenProps = {
  returnPath: string;
};

export default function PostRegistrationGateScreen({
  returnPath,
}: PostRegistrationGateScreenProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-[#080810] text-[#eeeaf4]">
      <Header />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8">
        <LoginRequiredPanel
          returnPath={returnPath}
          title={POST_REGISTRATION_PROMPT.title}
          description={POST_REGISTRATION_PROMPT.description}
        />
        <Link
          href="/home"
          className="mt-6 block text-center text-sm font-semibold text-[#9994a8] hover:text-[#eeeaf4]"
        >
          ホームに戻る
        </Link>
      </main>
      <BottomNav />
    </div>
  );
}