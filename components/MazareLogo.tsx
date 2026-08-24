import Link from "next/link";
import Image from "next/image";

type MazareLogoProps = {
  href?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClassName = {
  sm: "h-5 w-auto",
  md: "h-7 w-auto",
  lg: "h-8 w-auto sm:h-9",
} as const;

export default function MazareLogo({
  href = "/",
  size = "md",
  className = "",
}: MazareLogoProps) {
  const image = (
    <Image
      src="/mazare-logo.png"
      alt="mazare"
      width={129}
      height={26}
      priority={size !== "sm"}
      className={`${sizeClassName[size]} ${className}`.trim()}
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0 items-center">
        {image}
      </Link>
    );
  }

  return <span className="inline-flex shrink-0 items-center">{image}</span>;
}
