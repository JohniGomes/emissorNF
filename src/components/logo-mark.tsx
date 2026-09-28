export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/notarium-mark.webp"
      alt="Notarium"
      style={{ height: size, width: "auto" }}
    />
  );
}
