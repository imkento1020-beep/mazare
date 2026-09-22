export default function GoogleAttribution({ className = "" }: { className?: string }) {
  return (
    <p
      className={`text-[10px] leading-snug text-[#5a5668] ${className}`}
      aria-label="Google 帰属表示"
    >
      Powered by{" "}
      <span className="font-semibold text-[#9994a8]">Google</span>
    </p>
  );
}
