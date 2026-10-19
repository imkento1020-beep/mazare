import {
  DEFAULT_ICON_STROKE,
  type SvgIconProps,
} from "@/components/icons/iconProps";

const SW = DEFAULT_ICON_STROKE;

/** Outline camera for “投稿する” */
export function PostOutlineIcon({
  size = 24,
  color = "currentColor",
}: SvgIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="2"
        y="6"
        width="20"
        height="15"
        rx="2.5"
        stroke={color}
        strokeWidth={SW}
      />
      <circle cx="12" cy="13.5" r="3.5" stroke={color} strokeWidth={SW} />
      <path
        d="M8 6L9.2 3.5H14.8L16 6"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Outline map pin for check-in */
export function CheckinOutlineIcon({
  size = 24,
  color = "currentColor",
}: SvgIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z"
        stroke={color}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" stroke={color} strokeWidth={SW} />
    </svg>
  );
}
