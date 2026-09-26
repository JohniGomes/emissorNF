import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-gray-50 px-4 text-center">
      <h1 className="text-3xl font-bold text-gray-900">Emissor NFs</h1>
      <p className="max-w-md text-gray-600">
        Emita notas fiscais de serviço sem burocracia. Cadastre sua empresa, seus
        clientes, e emita notas em segundos.
      </p>
      <div className="flex gap-3">
        <Link
          href="/register"
          className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500"
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
