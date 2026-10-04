const stroke = "#ff3d00";
const sw = 1.8;

export function PinIcon() {
  return (
    <svg width={32} height={32} viewBox="0 0 28 28" fill="none" aria-hidden>
      <circle cx="14" cy="11" r="4" stroke={stroke} strokeWidth={sw} />
      <path
        d="M14 3C9.6 3 6 6.6 6 11C6 17 14 25 14 25C14 25 22 17 22 11C22 6.6 18.4 3 14 3Z"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StepCameraIcon() {
  return (
    <svg width={32} height={32} viewBox="0 0 28 28" fill="none" aria-hidden>
      <rect x="2" y="8" width="24" height="17" rx="3" stroke={stroke} strokeWidth={sw} />
      <circle cx="14" cy="16" r="4" stroke={stroke} strokeWidth={sw} />
      <path
        d="M10 8L11.5 5H16.5L18 8"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="21" cy="12" r="1.2" fill={stroke} />
    </svg>
  );
}

export function PeopleGatherIcon() {
  return (
    <svg width={32} height={32} viewBox="0 0 28 28" fill="none" aria-hidden>
      <circle cx="14" cy="8" r="3.5" stroke={stroke} strokeWidth={sw} />
      <path
        d="M7 24C7 20.1 10.1 17 14 17C17.9 17 21 20.1 21 24"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
      />
      <circle cx="5" cy="10" r="2.5" stroke={stroke} strokeWidth={sw} />
      <path
        d="M2 24C2 21.2 3.8 19 6 19"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
      />
      <circle cx="23" cy="10" r="2.5" stroke={stroke} strokeWidth={sw} />
      <path
        d="M26 24C26 21.2 24.2 19 22 19"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CheckCircleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden>
      <circle cx="14" cy="14" r="11" stroke={stroke} strokeWidth={sw} />
      <path
        d="M8 14L12 18L20 10"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
