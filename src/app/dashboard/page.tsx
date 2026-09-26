import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, FileText, Plus } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const empresa = await prisma.empresa.findFirst({
    where: { userId: session.user.id },
  });

  if (!empresa) redirect("/onboarding");

  const [totalClientes, totalNotas] = await Promise.all([
    prisma.cliente.count({ where: { empresaId: empresa.id } }),
    prisma.nota.count({ where: { empresaId: empresa.id } }),
  ]);

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold text-gray-900">
        Olá, {empresa.razaoSocial}
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Aqui está um resumo da sua conta.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/clientes"
          className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-6 transition-colors hover:border-brand-tan"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-cream text-brand-dark">
            <Users size={20} />
          </div>
          <div>
            <p className="text-2xl font-semibold text-gray-900">{totalClientes}</p>
            <p className="text-sm text-gray-500">Clientes cadastrados</p>
          </div>
        </Link>

        <Link
          href="/dashboard/notas"
          className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-6 transition-colors hover:border-brand-tan"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-cream text-brand-dark">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-2xl font-semibold text-gray-900">{totalNotas}</p>
            <p className="text-sm text-gray-500">Notas emitidas</p>
          </div>
        </Link>
      </div>

      <Link
        href="/dashboard/notas/nova"
        className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-dashed border-brand-tan bg-white p-6 text-sm font-medium text-brand-dark hover:bg-brand-cream"
      >
        <Plus size={16} />
        Emitir nova nota
      </Link>
    </div>
  );
}
