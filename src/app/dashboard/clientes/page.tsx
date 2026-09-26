import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ClientesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const empresa = await prisma.empresa.findFirst({
    where: { userId: session.user.id },
  });
  if (!empresa) redirect("/dashboard/empresa");

  const clientes = await prisma.cliente.findMany({
    where: { empresaId: empresa.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Clientes</h1>
        <Link
          href="/dashboard/clientes/novo"
          className="rounded-md bg-brand-dark px-4 py-2 text-sm font-medium text-white hover:bg-brand-brown"
        >
          + Novo cliente
        </Link>
      </div>

      {clientes.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhum cliente cadastrado ainda.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                  Nome
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                  Documento
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                  E-mail
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">{cliente.nome}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{cliente.documento}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{cliente.email ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
