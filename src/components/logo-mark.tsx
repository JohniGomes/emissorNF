export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="notariumLogoGradient" x1="8" y1="12" x2="92" y2="88">
          <stop offset="0%" stopColor="#8eb69b" />
          <stop offset="50%" stopColor="#235347" />
          <stop offset="100%" stopColor="#0b2b26" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="96" height="96" rx="22" fill="#051f20" />
      <path
        d="M20 74 L38 26 L50 58 L62 30 L74 62 L80 48"
        stroke="url(#notariumLogoGradient)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
