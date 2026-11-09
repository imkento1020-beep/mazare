type IconProps = {
  size?: number;
  className?: string;
};

/** 二人で踊る（マザる・合流OK） */
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
      <circle cx="10.5" cy="8.5" r="3" fill="currentColor" />
      <path
        d="M10.5 11.5v5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10.5 13l-4-3.5M10.5 13.5l3-2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 16.5l-3 8M10.5 16.5l2.5-6.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx="21.5" cy="8.5" r="3" fill="currentColor" />
      <path
        d="M21.5 11.5v5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M21.5 13l4-3.5M21.5 13.5l-3-2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21.5 16.5l3 8M21.5 16.5l-2.5-6.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M13.5 7.5l2.5 1.5M16 7.5l-2.5 1.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M5 26.5h22"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  );
}

/** グラスで乾杯（マザらない・内輪） */
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
      <path
        d="M7.2 17.8l2.8-9.5a1 1 0 011.9 0l2.8 9.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M8.3 15.5h6.2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M8.8 14.8h4.6c0 0 .4 2.2-4.6 1.8"
        fill="currentColor"
        fillOpacity="0.32"
      />
      <path
        d="M11.4 17.8v5M9.2 22.8h4.4"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
      />

      <path
        d="M24.8 17.8l-2.8-9.5a1 1 0 00-1.9 0l-2.8 9.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M17.5 15.5h6.2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M18.6 14.8h4.6c0 0-.4 2.2 4.6 1.8"
        fill="currentColor"
        fillOpacity="0.32"
      />
      <path
        d="M20.6 17.8v5M18.4 22.8h4.4"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
      />

      <path
        d="M13.8 10.2l2.2-1.4 2.2 1.4"
        stroke="#ffaa00"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <circle cx="16" cy="9.6" r="1" fill="#ffaa00" opacity="0.88" />
      <path
        d="M15.1 8.1l.9.55M16.9 8.1l-.9.55"
        stroke="#ffaa00"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}
