type IconProps = {
  size?: number;
  className?: string;
};

/** マザる — 二人で踊る（合流・交流 OK） */
export function MazaruIcon({ size = 28, className = "" }: IconProps) {
  const stroke = 2.9;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle cx="10" cy="8.5" r="3.7" fill="currentColor" />
      <circle cx="22" cy="8.5" r="3.7" fill="currentColor" />

      <g
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 12.2v5.2" />
        <path d="M10 12.8L6 7.5" />
        <path d="M10 12.8L14 7.5" />
        <path d="M10 17.4L7.2 25.5" />
        <path d="M10 17.4L12.5 23.5" />

        <path d="M22 12.2v5.2" />
        <path d="M22 12.8L18 7.5" />
        <path d="M22 12.8L26 7.5" />
        <path d="M22 17.4L19.5 23.5" />
        <path d="M22 17.4L24.8 25.5" />
      </g>
    </svg>
  );
}

/** マザらない — ジョッキで乾杯（今夜は内輪） */
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
      <g transform="rotate(-16 9 23)">
        <path
          d="M4.2 14.2h7.1c.9 0 1.6.7 1.6 1.6v7.8c0 1.5-1.2 2.7-2.7 2.7H5.3c-1.5 0-2.7-1.2-2.7-2.7v-7.8c0-.9.7-1.6 1.6-1.6z"
          fill="currentColor"
          fillOpacity="0.2"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path d="M4.5 14.2h6.5v3.4H4.5z" fill="currentColor" fillOpacity="0.55" />
        <path
          d="M3.5 16.8c-1.5 0-1.5 3.4 0 3.4"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <ellipse cx="7.3" cy="12.6" rx="3.8" ry="1.55" fill="currentColor" />
      </g>

      <g transform="rotate(16 23 23)">
        <path
          d="M20.7 14.2h7.1c.9 0 1.6.7 1.6 1.6v7.8c0 1.5-1.2 2.7-2.7 2.7h-4.3c-1.5 0-2.7-1.2-2.7-2.7v-7.8c0-.9.7-1.6 1.6-1.6z"
          fill="currentColor"
          fillOpacity="0.2"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path d="M21 14.2h6.5v3.4H21z" fill="currentColor" fillOpacity="0.55" />
        <path
          d="M28.5 16.8c1.5 0 1.5 3.4 0 3.4"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <ellipse cx="24.7" cy="12.6" rx="3.8" ry="1.55" fill="currentColor" />
      </g>

      <g stroke="#ffaa00" strokeLinecap="round">
        <circle cx="16" cy="11.5" r="1.4" fill="#ffaa00" stroke="none" />
        <path d="M14.2 9.8l1.1 1.6M17.8 9.8l-1.1 1.6" strokeWidth="1.25" />
      </g>
    </svg>
  );
}
