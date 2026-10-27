type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SPINNER_SIZE = {
  sm: "h-6 w-6 border-[2px]",
  md: "h-10 w-10 border-2",
  lg: "h-12 w-12 border-[3px]",
} as const;

export function LoadingSpinner({
  size = "md",
  className = "",
}: LoadingSpinnerProps) {
  return (
    <div
      className={`animate-spin rounded-full border-[#ff3d00] border-t-transparent ${SPINNER_SIZE[size]} ${className}`.trim()}
      aria-hidden
    />
  );
}

type LoadingScreenProps = {
  message?: string;
  submessage?: string;
  /** ページ全体ではなくセクション内用 */
  compact?: boolean;
  className?: string;
};

export default function LoadingScreen({
  message = "読み込み中…",
  submessage,
  compact = false,
  className = "",
}: LoadingScreenProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center bg-[#080810] px-6 text-center ${
        compact ? "py-16" : "min-h-dvh"
      } ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative flex items-center justify-center">
        <span className="absolute h-16 w-16 animate-pulse rounded-full bg-[#ff3d00]/10" />
        <LoadingSpinner size="lg" />
      </div>
      <p className="mt-5 text-base font-bold text-[#eeeaf4]">{message}</p>
      {submessage ? (
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#9994a8]">
          {submessage}
        </p>
      ) : null}
    </div>
  );
}

type LoadingBlockProps = {
  message: string;
  submessage?: string;
  className?: string;
};

/** 一覧の上やフォーム内など、部分的な読み込み表示 */
export function LoadingBlock({
  message,
  submessage,
  className = "",
}: LoadingBlockProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-[#111118] px-6 py-10 text-center ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <LoadingSpinner size="md" />
      <p className="text-sm font-bold text-[#eeeaf4]">{message}</p>
      {submessage ? (
        <p className="max-w-xs text-xs leading-relaxed text-[#9994a8]">
          {submessage}
        </p>
      ) : null}
    </div>
  );
}

type LoadingOverlayProps = {
  message: string;
  submessage?: string;
};

/** 操作確定後など、画面全体を覆う短時間ローディング */
export function LoadingOverlay({ message, submessage }: LoadingOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#080810]/85 px-6 backdrop-blur-sm"
      role="alertdialog"
      aria-live="assertive"
      aria-busy="true"
      aria-label={message}
    >
      <LoadingSpinner size="lg" />
      <p className="mt-5 text-base font-black text-[#eeeaf4]">{message}</p>
      {submessage ? (
        <p className="mt-2 text-sm text-[#9994a8]">{submessage}</p>
      ) : null}
    </div>
  );
}
