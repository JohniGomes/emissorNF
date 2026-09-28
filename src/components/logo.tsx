import { LogoMark } from "./logo-mark";

interface LogoProps {
  size?: number;
  withTagline?: boolean;
}

export function Logo({ size = 48, withTagline = false }: LogoProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <LogoMark size={size} />
      <div className="text-center">
        <p
          className="text-4xl leading-none tracking-wide text-gray-900"
          style={{ fontFamily: "var(--font-amatic)" }}
        >
          NOTARIUM
        </p>
        {withTagline && (
          <p className="text-xs text-gray-500">Sistema de emissão de Nota Fiscal</p>
        )}
      </div>
    </div>
  );
}
