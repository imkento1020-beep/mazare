import {
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_SIZE,
  DEFAULT_ICON_STROKE,
  type SvgIconProps,
} from "@/components/icons/iconProps";

export default function ShopIcon({
  size = DEFAULT_ICON_SIZE,
  color = DEFAULT_ICON_COLOR,
  strokeWidth = DEFAULT_ICON_STROKE,
}: SvgIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden>
      <path
        d="M4 12H24V24H4V12Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 8L4 4H24L26 8H2Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 8C2 10 4 12 6 12C8 12 10 10 10 8"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M10 8C10 10 12 12 14 12C16 12 18 10 18 8"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M18 8C18 10 20 12 22 12C24 12 26 10 26 8"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <rect
        x="11"
        y="17"
        width="6"
        height="7"
        rx="1"
        stroke={color}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}
