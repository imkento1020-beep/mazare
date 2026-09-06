import Link from "next/link";
import { pageBgClassName, primaryButtonClassName } from "@/lib/ui/styles";

export default function OfflinePage() {
  return (
    <div className={`${pageBgClassName} flex min-h-dvh items-center justify-center px-4`}>
      <div className="max-w-sm text-center">
        <p className="text-4xl">📡</p>
        <h1 className="mt-4 text-xl font-black">オフラインです</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#9994a8]">
          インターネット接続を確認して、もう一度お試しください。
        </p>
        <Link href="/home" className={`${primaryButtonClassName} mt-8 inline-block`}>
          ホームへ戻る
        </Link>
      </div>
    </div>
  );
}
