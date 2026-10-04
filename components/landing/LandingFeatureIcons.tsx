const stroke = "#ff3d00";
const sw = 1.8;

export function PostFeatureIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 28 28" fill="none" aria-hidden>
      <rect x="2" y="8" width="24" height="17" rx="3" stroke={stroke} strokeWidth={sw} />
      <circle cx="14" cy="16" r="4" stroke={stroke} strokeWidth={sw} />
      <path
        d="M10 8L11.5 5H16.5L18 8"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MapFeatureIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 28 28" fill="none" aria-hidden>
      <path
        d="M10 4L4 7V24L10 21L18 24L24 21V4L18 7L10 4Z"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 4V21" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <path d="M18 7V24" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    </svg>
  );
}

export function BookmarkFeatureIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 28 28" fill="none" aria-hidden>
      <path
        d="M8 4H20V24L14 20L8 24V4Z"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SparkFeatureIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 28 28" fill="none" aria-hidden>
      <path
        d="M14 3L16 11H24L17.5 15.5L19.5 24L14 19L8.5 24L10.5 15.5L4 11H12L14 3Z"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
    </svg>
  );
}
