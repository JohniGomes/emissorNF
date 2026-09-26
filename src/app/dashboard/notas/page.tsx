import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

const statusLabel: Record<string, string> = {
  PENDENTE: "Pendente",
  PROCESSANDO: "Processando",
  AUTORIZADA: "Autorizada",
  ERRO: "Erro",
  CANCELADA: "Cancelada",
};

const statusColor: Record<string, string> = {
  PENDENTE: "bg-gray-100 text-gray-700",
  PROCESSANDO: "bg-yellow-100 text-yellow-700",
  AUTORIZADA: "bg-green-100 text-green-700",
  ERRO: "bg-red-100 text-red-700",
  CANCELADA: "bg-gray-100 text-gray-500",
};

export default async function NotasPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const empresa = await prisma.empresa.findFirst({
    where: { userId: session.user.id },
  });
  if (!empresa) redirect("/dashboard/empresa");

  const notas = await prisma.nota.findMany({
    where: { empresaId: empresa.id },
    include: { cliente: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Notas emitidas</h1>
        <Link
          href="/dashboard/notas/nova"
          className="rounded-md bg-brand-dark px-4 py-2 text-sm font-medium text-white hover:bg-brand-brown"
        >
          + Emitir nota
        </Link>
      </div>

      {notas.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhuma nota emitida ainda.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                  Cliente
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                  Descrição
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                  Valor
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                  Nota
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {notas.map((nota) => (
                <tr key={nota.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">{nota.cliente.nome}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {nota.descricaoServico}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {Number(nota.valor).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${statusColor[nota.status]}`}
                    >
                      {statusLabel[nota.status]}
                    </span>
                    {nota.erro && (
                      <p className="mt-1 text-xs text-red-600">{nota.erro}</p>
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {nota.linkPdf ? (
                      <a
                        href={nota.linkPdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-brown hover:underline"
                      >
                        Ver PDF
                      </a>
                    ) : (
                      nota.numero || "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
