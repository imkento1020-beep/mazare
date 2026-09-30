import {
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_SIZE,
  DEFAULT_ICON_STROKE,
  type SvgIconProps,
} from "@/components/icons/iconProps";

export default function MapIcon({
  size = DEFAULT_ICON_SIZE,
  color = DEFAULT_ICON_COLOR,
  strokeWidth = DEFAULT_ICON_STROKE,
}: SvgIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden>
      <path
        d="M10 4L4 7V24L10 21L18 24L24 21V4L18 7L10 4Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 4V21"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M18 7V24"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}
