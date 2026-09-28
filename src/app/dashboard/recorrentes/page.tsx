import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { alternarRecorrente } from "./actions";

export default async function RecorrentesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const empresa = await prisma.empresa.findFirst({
    where: { userId: session.user.id },
  });
  if (!empresa) redirect("/dashboard/empresa");

  const recorrentes = await prisma.notaRecorrente.findMany({
    where: { empresaId: empresa.id },
    include: { cliente: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Notas recorrentes</h1>
        <Link
          href="/dashboard/recorrentes/nova"
          className="rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white"
        >
          + Nova recorrência
        </Link>
      </div>

      <p className="mb-4 text-sm text-gray-500">
        Configure um serviço que você presta todo mês pro mesmo cliente e o
        Notarium emite a nota automaticamente todo mês, no dia que você
        escolher — pelo número de meses que você definir, ou indefinidamente.
      </p>

      {recorrentes.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhuma nota recorrente configurada ainda.</p>
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
                  Dia
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                  Restam
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                  Última emissão
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recorrentes.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">{r.cliente.nome}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{r.descricaoServico}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {Number(r.valor).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">Dia {r.diaDoMes}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {r.mesesRestantes === null ? "Sem prazo" : `${r.mesesRestantes} mês(es)`}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {r.ultimaExecucao
                      ? new Date(r.ultimaExecucao).toLocaleDateString("pt-BR")
                      : "—"}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        r.ativo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {r.ativo ? "Ativa" : "Inativa"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <form action={alternarRecorrente}>
                      <input type="hidden" name="id" value={r.id} />
                      <button type="submit" className="text-brand-brown hover:underline">
                        {r.ativo ? "Desativar" : "Ativar"}
                      </button>
                    </form>
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
