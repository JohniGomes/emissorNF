import Link from "next/link";
import { Logo } from "@/components/logo";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-gray-50 px-4 text-center">
      <Logo size={64} withTagline />
      <p className="max-w-md text-gray-600">
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
          className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Entrar
        </Link>
      </div>
    </main>
  );
}
