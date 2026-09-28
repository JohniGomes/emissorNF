export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="notariumLogoGradient" x1="8" y1="12" x2="92" y2="88">
          <stop offset="0%" stopColor="#8eb69b" />
          <stop offset="50%" stopColor="#235347" />
          <stop offset="100%" stopColor="#0b2b26" />
        </linearGradient>
      </defs>
      <path
        d="M12 80 L33 16 L50 58 L67 22 L84 54 L92 40"
        stroke="url(#notariumLogoGradient)"
        strokeWidth="13"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
