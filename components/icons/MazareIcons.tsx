import type { ReactNode } from "react";
import {
  DEFAULT_ICON_STROKE,
  type SvgIconProps,
} from "@/components/icons/iconProps";

const SW = DEFAULT_ICON_STROKE;

function IconShell({
  size = 24,
  children,
  className,
}: SvgIconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function CloseIcon({ size = 24, color = "currentColor" }: SvgIconProps) {
  return (
    <IconShell size={size}>
      <path
        d="M8 8L20 20M20 8L8 20"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap="round"
      />
    </IconShell>
  );
}

export function CheckIcon({ size = 24, color = "currentColor" }: SvgIconProps) {
  return (
    <IconShell size={size}>
      <path
        d="M6 14L11 19L22 8"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconShell>
  );
}

export function ClockIcon({ size = 24, color = "currentColor" }: SvgIconProps) {
  return (
    <IconShell size={size}>
      <circle cx="14" cy="14" r="9" stroke={color} strokeWidth={SW} />
      <path
        d="M14 8V14L18 16"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconShell>
  );
}

export function HeartIcon({
  size = 24,
  color = "currentColor",
  filled = false,
}: SvgIconProps & { filled?: boolean }) {
  return (
    <IconShell size={size}>
      <path
        d="M14 23C14 23 4 17 4 10.5C4 7.5 6.5 5 9.5 5C11.2 5 12.8 5.8 14 7.1C15.2 5.8 16.8 5 18.5 5C21.5 5 24 7.5 24 10.5C24 17 14 23 14 23Z"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? color : "none"}
      />
    </IconShell>
  );
}

export function FireIcon({ size = 24, color = "currentColor" }: SvgIconProps) {
  return (
    <IconShell size={size}>
      <path
        d="M14 25C10 21 6 17 6 12C6 8 9 5 12 5C12 8 14 9 14 9C14 9 16 8 16 5C19 5 22 8 22 12C22 17 18 21 14 25Z"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconShell>
  );
}

export function StarIcon({ size = 24, color = "currentColor" }: SvgIconProps) {
  return (
    <IconShell size={size}>
      <path
        d="M14 4L16.5 10.5L23 11.5L18 16L19.5 23L14 19.5L8.5 23L10 16L5 11.5L11.5 10.5L14 4Z"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconShell>
  );
}

export function SparkleIcon({ size = 24, color = "currentColor" }: SvgIconProps) {
  return (
    <IconShell size={size}>
      <path
        d="M14 3V7M14 21V25M3 14H7M21 14H25M6 6L8.5 8.5M19.5 19.5L22 22M22 6L19.5 8.5M8.5 19.5L6 22"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap="round"
      />
      <circle cx="14" cy="14" r="3" stroke={color} strokeWidth={SW} />
    </IconShell>
  );
}

export function MusicIcon({ size = 24, color = "currentColor" }: SvgIconProps) {
  return (
    <IconShell size={size}>
      <path
        d="M10 20V8L22 5V17"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="20" r="3" stroke={color} strokeWidth={SW} />
      <circle cx="19" cy="17" r="3" stroke={color} strokeWidth={SW} />
    </IconShell>
  );
}

export function MicIcon({ size = 24, color = "currentColor" }: SvgIconProps) {
  return (
    <IconShell size={size}>
      <rect
        x="10"
        y="4"
        width="8"
        height="13"
        rx="4"
        stroke={color}
        strokeWidth={SW}
      />
      <path
        d="M6 13C6 17 9.5 20 14 20C18.5 20 22 17 22 13"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap="round"
      />
      <path d="M14 20V24" stroke={color} strokeWidth={SW} strokeLinecap="round" />
    </IconShell>
  );
}

export function GuitarIcon({ size = 24, color = "currentColor" }: SvgIconProps) {
  return (
    <IconShell size={size}>
      <path
        d="M17 4L22 9L12 19H8V15L17 4Z"
        stroke={color}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <circle cx="9" cy="19" r="2" stroke={color} strokeWidth={SW} />
    </IconShell>
  );
}

export function DanceIcon({ size = 24, color = "currentColor" }: SvgIconProps) {
  return (
    <IconShell size={size}>
      <circle cx="14" cy="6" r="3" stroke={color} strokeWidth={SW} />
      <path
        d="M14 9V16M14 12L10 20M14 12L18 18M14 16L8 24M14 16L20 24"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconShell>
  );
}

export function HandshakeIcon({ size = 24, color = "currentColor" }: SvgIconProps) {
  return (
    <IconShell size={size}>
      <path
        d="M4 14L10 14L13 11L16 14L24 14"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 10L11 13M20 10L17 13"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap="round"
      />
    </IconShell>
  );
}

export function UploadIcon({ size = 24, color = "currentColor" }: SvgIconProps) {
  return (
    <IconShell size={size}>
      <path
        d="M14 18V6M14 6L9 11M14 6L19 11"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 20H22"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap="round"
      />
    </IconShell>
  );
}

export function CameraOutlineIcon({
  size = 24,
  color = "currentColor",
}: SvgIconProps) {
  return (
    <IconShell size={size}>
      <path
        d="M6 8H10L12 6H16L18 8H22V20H6V8Z"
        stroke={color}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <circle cx="14" cy="14" r="4" stroke={color} strokeWidth={SW} />
    </IconShell>
  );
}

export function MailIcon({ size = 24, color = "currentColor" }: SvgIconProps) {
  return (
    <IconShell size={size}>
      <rect
        x="4"
        y="7"
        width="20"
        height="14"
        rx="2"
        stroke={color}
        strokeWidth={SW}
      />
      <path
        d="M4 9L14 15L24 9"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconShell>
  );
}

export function OfflineIcon({ size = 24, color = "currentColor" }: SvgIconProps) {
  return (
    <IconShell size={size}>
      <path
        d="M4 14C7 11 11 9 14 9C17 9 21 11 24 14"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap="round"
      />
      <path
        d="M8 18C9.5 16.5 11.5 15.5 14 15.5C16.5 15.5 18.5 16.5 20 18"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap="round"
      />
      <circle cx="14" cy="21" r="1.5" fill={color} />
      <path d="M5 5L23 23" stroke={color} strokeWidth={SW} strokeLinecap="round" />
    </IconShell>
  );
}

export function SettingsIcon({ size = 24, color = "currentColor" }: SvgIconProps) {
  return (
    <IconShell size={size}>
      <circle cx="14" cy="14" r="4" stroke={color} strokeWidth={SW} />
      <path
        d="M14 3V6M14 22V25M3 14H6M22 14H25M6.5 6.5L8.5 8.5M19.5 19.5L21.5 21.5M21.5 6.5L19.5 8.5M8.5 19.5L6.5 21.5"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap="round"
      />
    </IconShell>
  );
}

export function ChartIcon({ size = 24, color = "currentColor" }: SvgIconProps) {
  return (
    <IconShell size={size}>
      <path
        d="M6 22V14M12 22V8M18 22V11M24 22V5"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap="round"
      />
    </IconShell>
  );
}

export function BroadcastIcon({ size = 24, color = "currentColor" }: SvgIconProps) {
  return (
    <IconShell size={size}>
      <circle cx="14" cy="20" r="2" stroke={color} strokeWidth={SW} />
      <path
        d="M14 18V10M10 6L14 10L18 6"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 12C8 10 10 9 14 9C18 9 20 10 22 12"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap="round"
      />
    </IconShell>
  );
}

export function LanternIcon({ size = 24, color = "currentColor" }: SvgIconProps) {
  return (
    <IconShell size={size}>
      <path
        d="M10 4H18V8C18 12 16 14 14 14C12 14 10 12 10 8V4Z"
        stroke={color}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <path d="M14 14V18" stroke={color} strokeWidth={SW} strokeLinecap="round" />
      <path d="M11 22H17" stroke={color} strokeWidth={SW} strokeLinecap="round" />
    </IconShell>
  );
}

export function UtensilsIcon({ size = 24, color = "currentColor" }: SvgIconProps) {
  return (
    <IconShell size={size}>
      <path
        d="M8 4V12C8 14 9 15 10 15M8 4C8 8 6 9 5 9V15M20 4V24M20 4C20 8 22 9 23 9V12"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconShell>
  );
}

export function CoffeeIcon({ size = 24, color = "currentColor" }: SvgIconProps) {
  return (
    <IconShell size={size}>
      <path
        d="M6 10H18V18C18 20 16 22 14 22H10C8 22 6 20 6 18V10Z"
        stroke={color}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <path d="M18 12H20C21 12 22 13 22 14V15" stroke={color} strokeWidth={SW} strokeLinecap="round" />
      <path d="M8 6H16" stroke={color} strokeWidth={SW} strokeLinecap="round" />
    </IconShell>
  );
}

export function CocktailIcon({ size = 24, color = "currentColor" }: SvgIconProps) {
  return (
    <IconShell size={size}>
      <path
        d="M8 5H20L14 15V22M10 22H18"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconShell>
  );
}

export function NoteIcon({ size = 24, color = "currentColor" }: SvgIconProps) {
  return (
    <IconShell size={size}>
      <path
        d="M8 4H18L22 8V22H8V4Z"
        stroke={color}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <path d="M18 4V8H22" stroke={color} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M11 13H19M11 17H16" stroke={color} strokeWidth={SW} strokeLinecap="round" />
    </IconShell>
  );
}

export function EyeIcon({ size = 24, color = "currentColor" }: SvgIconProps) {
  return (
    <IconShell size={size}>
      <path
        d="M4 14C7 9 10 7 14 7C18 7 21 9 24 14C21 19 18 21 14 21C10 21 7 19 4 14Z"
        stroke={color}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <circle cx="14" cy="14" r="3" stroke={color} strokeWidth={SW} />
    </IconShell>
  );
}

export function EyeOffIcon({ size = 24, color = "currentColor" }: SvgIconProps) {
  return (
    <IconShell size={size}>
      <path
        d="M4 14C7 9 10 7 14 7C18 7 21 9 24 14"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap="round"
      />
      <path d="M5 5L23 23" stroke={color} strokeWidth={SW} strokeLinecap="round" />
    </IconShell>
  );
}

export function CheckinIcon({ size = 24, color = "currentColor" }: SvgIconProps) {
  return (
    <IconShell size={size}>
      <circle cx="14" cy="11" r="4" stroke={color} strokeWidth={SW} />
      <path
        d="M14 3C9.6 3 6 6.6 6 11C6 17 14 25 14 25C14 25 22 17 22 11C22 6.6 18.4 3 14 3Z"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 11L13 13L17 9"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconShell>
  );
}

export function StorefrontIcon({ size = 24, color = "currentColor" }: SvgIconProps) {
  return (
    <IconShell size={size}>
      <path
        d="M5 12V22H23V12"
        stroke={color}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <path
        d="M5 12L7 6H21L23 12"
        stroke={color}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <path d="M11 22V16H17V22" stroke={color} strokeWidth={SW} strokeLinejoin="round" />
    </IconShell>
  );
}

export function PhoneIcon({ size = 24, color = "currentColor" }: SvgIconProps) {
  return (
    <IconShell size={size}>
      <rect
        x="9"
        y="4"
        width="10"
        height="20"
        rx="2"
        stroke={color}
        strokeWidth={SW}
      />
      <path d="M12 21H16" stroke={color} strokeWidth={SW} strokeLinecap="round" />
    </IconShell>
  );
}
