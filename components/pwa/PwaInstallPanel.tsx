"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePwaInstall } from "@/hooks/usePwaInstall";

function StepList({ steps }: { steps: string[] }) {
  return (
    <ol className="mt-4 space-y-3 text-sm leading-relaxed text-[#9994a8]">
      {steps.map((step, index) => (
        <li key={step} className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ff3d00]/15 text-xs font-bold text-[#ff3d00]">
            {index + 1}
          </span>
          <span className="pt-0.5">{step}</span>
        </li>
      ))}
    </ol>
  );
}

function InstructionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[14px] border border-white/7 bg-[#111118] p-6">
      <h2 className="text-lg font-bold text-[#eeeaf4]">{title}</h2>
      {children}
    </section>
  );
}

export default function PwaInstallPanel() {
  const { platform, isInstalled, canNativePrompt, promptInstall } =
    usePwaInstall();

  if (isInstalled) {
    return (
      <div className="rounded-[14px] border border-[#00e87a]/30 bg-[#00e87a]/[0.06] p-6">
        <p className="text-base font-bold text-[#00e87a]">
          アプリとして追加済みです
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[#9994a8]">
          ホーム画面のアイコンから mazare を開くと、ネイティブアプリのように全画面で利用できます。
        </p>
        <Link
          href="/home"
          className="mt-6 inline-flex rounded-[13px] bg-[#ff3d00] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#e63600]"
        >
          ホームを開く
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-[#9994a8]">
        mazare は PWA（Progressive Web App）に対応しています。ブラウザのブックマークではなく、
        ホーム画面に追加するとアプリのようにすぐ開けます。インストール後は{" "}
        <Link href="/home" className="text-[#ff3d00] underline-offset-2 hover:underline">
          ホーム
        </Link>
        から始まります。
      </p>

      {canNativePrompt && (
        <div className="rounded-[14px] border border-[#ff3d00]/25 bg-[#ff3d00]/[0.06] p-6">
          <p className="text-sm text-[#9994a8]">
            この端末では、下のボタンからワンタップで追加できます。
          </p>
          <button
            type="button"
            onClick={() => void promptInstall()}
            className="mt-4 inline-flex rounded-[13px] bg-[#ff3d00] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#e63600]"
          >
            アプリをインストール
          </button>
        </div>
      )}

      {(platform === "ios" || platform === "unknown") && (
        <InstructionCard title="iPhone・iPad（Safari）">
          <p className="mt-2 text-sm text-[#9994a8]">
            iOS では Safari から「ホーム画面に追加」してください。
          </p>
          <StepList
            steps={[
              "Safari で https://mazare.app を開く（Chrome 等では追加できません）",
              "画面下（または上）の「共有」ボタン（□に↑のマーク）をタップ",
              "一覧から「ホーム画面に追加」を選ぶ",
              "右上の「追加」をタップして完了",
            ]}
          />
        </InstructionCard>
      )}

      {(platform === "android" || platform === "unknown") && (
        <InstructionCard title="Android（Chrome など）">
          {!canNativePrompt && (
            <p className="mt-2 text-sm text-[#9994a8]">
              上にインストールボタンが出ない場合は、次の手順で追加してください。
            </p>
          )}
          <StepList
            steps={
              canNativePrompt
                ? [
                    "「アプリをインストール」ボタンをタップ",
                    "表示された確認で「インストール」を選ぶ",
                    "ホーム画面に mazare のアイコンが追加されます",
                  ]
                : [
                    "Chrome で https://mazare.app を開く",
                    "アドレスバー右の「インストール」またはメニュー（⋮）→「アプリをインストール」「ホーム画面に追加」",
                    "指示に従って追加を完了する",
                  ]
            }
          />
        </InstructionCard>
      )}

      {(platform === "desktop" || platform === "unknown") && (
        <InstructionCard title="パソコン（Chrome / Edge）">
          <StepList
            steps={[
              "https://mazare.app を Chrome または Edge で開く",
              "アドレスバー右の「インストール」アイコンをクリック（表示されない場合はメニューから「mazare をインストール」）",
              "確認ダイアログでインストールを完了する",
            ]}
          />
        </InstructionCard>
      )}

      <p className="text-xs leading-relaxed text-[#5a5668]">
        追加後もログインは通常どおりです。「行くかも」やチェックインなど、アカウントが必要な操作のときだけサインアップまたはログインを案内します。
      </p>
    </div>
  );
}
