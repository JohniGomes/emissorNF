export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="notariumLogoGlow" x1="20" y1="18" x2="85" y2="88">
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>
      </defs>
      <path d="M10 8 H70 L90 28 V92 H10 Z" fill="#0b2b26" />
      <path d="M70 8 L90 28 L70 28 Z" fill="#123b36" stroke="#5eead4" strokeWidth="1.5" />
      <path
        d="M26 80 L26 24 L74 80 L74 24"
        stroke="url(#notariumLogoGlow)"
        strokeWidth="9"
        strokeLinecap="square"
        strokeLinejoin="miter"
        fill="none"
      />
      <path d="M6 84 L6 94 L16 94" stroke="#5eead4" strokeWidth="3" strokeLinecap="square" fill="none" />
      <path d="M74 14 L84 14 L84 22" stroke="#5eead4" strokeWidth="3" strokeLinecap="square" fill="none" />
    </svg>
  );
}
