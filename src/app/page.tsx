import Link from "next/link";
import { LogoMark } from "@/components/logo-mark";

export default function Home() {
  return (
    <main className="bg-brand-sidebar flex flex-1 flex-col items-center justify-between px-4 py-12 text-center text-white">
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <p
          className="text-6xl leading-none tracking-wide text-white"
          style={{ fontFamily: "var(--font-amatic)" }}
        >
          Notarium
        </p>
        <p className="text-xs uppercase tracking-wide text-brand-tan">
          Simplificando a emissão das suas Notas Fiscais
        </p>
        <p className="max-w-md text-brand-cream/80">
          Emita notas fiscais de serviço sem burocracia. Cadastre sua empresa, seus
          clientes, e emita notas em segundos.
        </p>
        <div className="flex gap-3">
          <Link
            href="/register"
            className="rounded-md btn-gradient px-5 py-2 text-sm font-medium text-white"
          >
            Criar conta
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-white/30 px-5 py-2 text-sm font-medium text-white hover:bg-white/10"
          >
            Entrar
          </Link>
        </div>
      </div>

      <LogoMark size={56} />
    </main>
  );
}
