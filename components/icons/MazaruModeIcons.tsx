type IconProps = {
  size?: number;
  className?: string;
};

export function MazaruIcon({ size = 28, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle cx="11" cy="12" r="4" fill="currentColor" opacity="0.9" />
      <circle cx="21" cy="12" r="4" fill="currentColor" opacity="0.55" />
      <path
        d="M6 24c2.5-3.5 6-5 10-5s7.5 1.5 10 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M14 8l4-2 4 2"
        stroke="#00e87a"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MazaranaiIcon({ size = 28, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle cx="16" cy="13" r="5" fill="currentColor" opacity="0.85" />
      <path
        d="M8 25c2.2-3.2 5.2-4.5 8-4.5s5.8 1.3 8 4.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
      <rect
        x="20"
        y="7"
        width="9"
        height="9"
        rx="2.5"
        fill="#18181f"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.9"
      />
      <path
        d="M22.5 9.5h4M22.5 12h3"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}
