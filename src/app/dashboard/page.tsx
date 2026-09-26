import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const empresa = await prisma.empresa.findFirst({
    where: { userId: session.user.id },
  });

  if (!empresa) redirect("/dashboard/empresa");

  const [totalClientes, totalNotas] = await Promise.all([
    prisma.cliente.count({ where: { empresaId: empresa.id } }),
    prisma.nota.count({ where: { empresaId: empresa.id } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-gray-900">
        Olá, {empresa.razaoSocial}
      </h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Link
          href="/dashboard/clientes"
          className="rounded-lg border border-gray-200 bg-white p-6 hover:border-indigo-300"
        >
          <p className="text-2xl font-semibold text-gray-900">{totalClientes}</p>
          <p className="text-sm text-gray-500">Clientes cadastrados</p>
        </Link>

        <Link
          href="/dashboard/notas"
          className="rounded-lg border border-gray-200 bg-white p-6 hover:border-indigo-300"
        >
          <p className="text-2xl font-semibold text-gray-900">{totalNotas}</p>
          <p className="text-sm text-gray-500">Notas emitidas</p>
        </Link>

        <Link
          href="/dashboard/notas/nova"
          className="flex items-center justify-center rounded-lg border border-dashed border-indigo-300 bg-indigo-50 p-6 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
        >
          + Emitir nova nota
        </Link>
      </div>
    </div>
  );
}
