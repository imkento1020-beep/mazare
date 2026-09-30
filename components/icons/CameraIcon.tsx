import {
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_SIZE,
  DEFAULT_ICON_STROKE,
  type SvgIconProps,
} from "@/components/icons/iconProps";

export default function CameraIcon({
  size = DEFAULT_ICON_SIZE,
  color = DEFAULT_ICON_COLOR,
  strokeWidth = DEFAULT_ICON_STROKE,
}: SvgIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden>
      <rect
        x="2"
        y="8"
        width="24"
        height="17"
        rx="3"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <circle cx="14" cy="16" r="4" stroke={color} strokeWidth={strokeWidth} />
      <path
        d="M10 8L11.5 5H16.5L18 8"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="21" cy="12" r="1.2" fill={color} />
    </svg>
  );
}
