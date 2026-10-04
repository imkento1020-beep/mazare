import Link from "next/link";

type MazareWordmarkProps = {
  href?: string | null;
  height?: number;
  className?: string;
};

export function MazareWordmarkSvg({
  height = 36,
  className = "",
}: {
  height?: number;
  className?: string;
}) {
  return (
    <svg
      height={height}
      viewBox="0 0 200 40"
      fill="none"
      className={className}
      aria-label="mazare"
      role="img"
    >
      <text
        x="0"
        y="32"
        fontFamily="Outfit, sans-serif"
        fontWeight={900}
        fontSize={36}
        fill="#f5f0e8"
      >
        maz
      </text>
      <text
        x="72"
        y="32"
        fontFamily="Outfit, sans-serif"
        fontWeight={900}
        fontSize={36}
        fill="#ff3d00"
      >
        a
      </text>
      <text
        x="93"
        y="32"
        fontFamily="Outfit, sans-serif"
        fontWeight={900}
        fontSize={36}
        fill="#f5f0e8"
      >
        re
      </text>
      <circle cx="108" cy="8" r="4" fill="#ffaa00" />
    </svg>
  );
}

export default function MazareWordmark({
  href = "/",
  height = 36,
  className = "",
}: MazareWordmarkProps) {
  const svg = <MazareWordmarkSvg height={height} className={className} />;

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0 items-center">
        {svg}
      </Link>
    );
  }

  return <span className="inline-flex shrink-0 items-center">{svg}</span>;
}
