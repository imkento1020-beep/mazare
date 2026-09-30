import {
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_SIZE,
  DEFAULT_ICON_STROKE,
  type SvgIconProps,
} from "@/components/icons/iconProps";

export default function SearchIcon({
  size = DEFAULT_ICON_SIZE,
  color = DEFAULT_ICON_COLOR,
  strokeWidth = DEFAULT_ICON_STROKE,
}: SvgIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke={color} strokeWidth={strokeWidth} />
      <path
        d="M18 18L25 25"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}
