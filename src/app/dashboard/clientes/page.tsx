import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ExcluirClienteButton } from "./excluir-cliente-button";

const POR_PAGINA = 20;

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const empresa = await prisma.empresa.findFirst({
    where: { userId: session.user.id },
  });
  if (!empresa) redirect("/dashboard/empresa");

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [clientes, total] = await Promise.all([
    prisma.cliente.findMany({
      where: { empresaId: empresa.id },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * POR_PAGINA,
      take: POR_PAGINA,
      include: { _count: { select: { notas: true } } },
    }),
    prisma.cliente.count({ where: { empresaId: empresa.id } }),
  ]);

  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Clientes</h1>
        <Link
          href="/dashboard/clientes/novo"
          className="rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white"
        >
          + Novo cliente
        </Link>
      </div>

      {clientes.length === 0 ? (
        <p className="text-sm text-gray-500">
          {page > 1 ? "Nenhum cliente nesta página." : "Nenhum cliente cadastrado ainda."}
        </p>
      ) : (
        <>
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
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    Notas
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {clientes.map((cliente) => (
                  <tr key={cliente.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">{cliente.nome}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{cliente.documento}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{cliente.email ?? "—"}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{cliente._count.notas}</td>
                    <td className="px-4 py-2 text-sm space-x-3">
                      <Link
                        href={`/dashboard/clientes/${cliente.id}/editar`}
                        className="text-brand-brown hover:underline"
                      >
                        Editar
                      </Link>
                      <ExcluirClienteButton clienteId={cliente.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPaginas > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <Link
                href={`/dashboard/clientes?page=${page - 1}`}
                aria-disabled={page <= 1}
                className={`rounded-md border border-gray-300 px-3 py-1.5 ${
                  page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-gray-50"
                }`}
              >
                Anterior
              </Link>
              <span>
                Página {page} de {totalPaginas}
              </span>
              <Link
                href={`/dashboard/clientes?page=${page + 1}`}
                aria-disabled={page >= totalPaginas}
                className={`rounded-md border border-gray-300 px-3 py-1.5 ${
                  page >= totalPaginas ? "pointer-events-none opacity-40" : "hover:bg-gray-50"
                }`}
              >
                Próxima
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
