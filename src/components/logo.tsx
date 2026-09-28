interface LogoProps {
  size?: number;
  withTagline?: boolean;
}

export function Logo({ size = 48, withTagline = false }: LogoProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <p
        className="bg-gradient-to-br from-[#8eb69b] via-[#235347] to-[#0b2b26] bg-clip-text leading-none tracking-wide text-transparent"
        style={{ fontFamily: "var(--font-amatic)", fontSize: size }}
      >
        Notarium
      </p>
      {withTagline && (
        <p className="text-xs text-gray-500">Sistema de emissão de Nota Fiscal</p>
      )}
    </div>
  );
}
