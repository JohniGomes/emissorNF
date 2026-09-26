import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { alternarNotaRecorrente } from "./actions";

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
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          + Nova recorrência
        </Link>
      </div>

      {recorrentes.length === 0 ? (
        <p className="text-sm text-gray-500">
          Nenhuma nota recorrente cadastrada ainda. Configure uma para não precisar
          emitir a mesma nota todo mês manualmente.
        </p>
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
                  Dia do mês
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                  Última execução
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recorrentes.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">{r.cliente.nome}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {r.descricaoServico}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {Number(r.valor).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">Dia {r.diaDoMes}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {r.ultimaExecucao
                      ? new Date(r.ultimaExecucao).toLocaleDateString("pt-BR")
                      : "Nunca"}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <form
                      action={async () => {
                        "use server";
                        await alternarNotaRecorrente(r.id);
                      }}
                    >
                      <button
                        type="submit"
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          r.ativo
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {r.ativo ? "Ativa" : "Inativa"}
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
