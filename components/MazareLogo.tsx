import Link from "next/link";
import Image from "next/image";

type MazareLogoProps = {
  href?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClassName = {
  sm: "h-3 w-auto",
  md: "h-[15px] w-auto",
  lg: "h-[18px] w-auto sm:h-[21px]",
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
      width={255}
      height={52}
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
