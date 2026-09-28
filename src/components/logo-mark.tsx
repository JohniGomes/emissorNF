export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="notariumLogoGlow" x1="20" y1="20" x2="85" y2="85">
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>
      </defs>
      <path d="M12 14 L66 14 L88 36 L88 90 L12 90 Z" fill="#0b2b26" />
      <path
        d="M28 78 L28 26 L72 78 L72 26"
        stroke="url(#notariumLogoGlow)"
        strokeWidth="9"
        strokeLinecap="square"
        strokeLinejoin="miter"
        fill="none"
      />
      <path
        d="M45 45 L45 58 L58 58"
        stroke="#5eead4"
        strokeWidth="3"
        strokeLinecap="square"
        fill="none"
      />
      <rect x="4" y="80" width="10" height="10" fill="#5eead4" />
    </svg>
  );
}
