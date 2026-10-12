import {
  DEFAULT_ICON_STROKE,
  type SvgIconProps,
} from "@/components/icons/iconProps";

const SW = DEFAULT_ICON_STROKE;

export function FeedWaveIcon({ size = 22, color = "#ffffff" }: SvgIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden
    >
      <path
        d="M9 4C9 3 9.9 2 11 2C12.1 2 13 3 13 4V14"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap="round"
      />
      <path
        d="M13 6C13 5 13.9 4 15 4C16.1 4 17 5 17 6V14"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap="round"
      />
      <path
        d="M17 8C17 7 17.9 6 19 6C20.1 6 21 7 21 8V16C21 21 17 26 11 26C7 26 4 23 4 19V12C4 11 4.9 10 6 10C7.1 10 8 11 8 12V14C8 13 8.9 12 10 12C11.1 12 12 13 12 14"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FeedCommentIcon({ size = 22, color = "#ffffff" }: SvgIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden
    >
      <path
        d="M4 6C4 4.9 4.9 4 6 4H22C23.1 4 24 4.9 24 6V18C24 19.1 23.1 20 22 20H8L4 24V6Z"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FeedShareIcon({ size = 22, color = "#ffffff" }: SvgIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden
    >
      <path
        d="M20 9L14 3L8 9"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 3V18"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap="round"
      />
      <path
        d="M6 13V23H22V13"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FeedPeopleIcon({ size = 14, color = "#00e87a" }: SvgIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden
    >
      <circle cx="14" cy="9" r="5" stroke={color} strokeWidth={SW} />
      <path
        d="M4 25C4 20 8.5 16 14 16C19.5 16 24 20 24 25"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FeedPinIcon({ size = 12, color = "rgba(255,255,255,0.55)" }: SvgIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden
    >
      <circle cx="14" cy="11" r="4" stroke={color} strokeWidth={SW} />
      <path
        d="M14 3C9.6 3 6 6.6 6 11C6 17 14 25 14 25C14 25 22 17 22 11C22 6.6 18.4 3 14 3Z"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FeedGlassIcon({ size = 48, color = "rgba(255,61,0,0.35)" }: SvgIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden
    >
      <path
        d="M8 4H20L18 24H10L8 4Z"
        stroke={color}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <path
        d="M8 10H20"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap="round"
      />
    </svg>
  );
}
