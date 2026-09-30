import {
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_SIZE,
  DEFAULT_ICON_STROKE,
  type SvgIconProps,
} from "@/components/icons/iconProps";

export default function UserIcon({
  size = DEFAULT_ICON_SIZE,
  color = DEFAULT_ICON_COLOR,
  strokeWidth = DEFAULT_ICON_STROKE,
}: SvgIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden>
      <circle cx="14" cy="9" r="5" stroke={color} strokeWidth={strokeWidth} />
      <path
        d="M4 25C4 20 8.5 16 14 16C19.5 16 24 20 24 25"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}
