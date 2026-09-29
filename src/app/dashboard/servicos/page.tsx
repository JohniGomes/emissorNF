import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { alternarServico } from "./actions";

export default async function ServicosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const empresa = await prisma.empresa.findFirst({
    where: { userId: session.user.id },
  });
  if (!empresa) redirect("/dashboard/empresa");

  const servicos = await prisma.servico.findMany({
    where: { empresaId: empresa.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Meus serviços</h1>
        <Link
          href="/dashboard/servicos/novo"
          className="rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white"
        >
          + Novo serviço
        </Link>
      </div>

      <p className="mb-4 text-sm text-gray-500">
        Cadastre os serviços que você presta pelo código de tributação nacional —
        descrição e NBS vêm da tabela oficial — pra selecionar rapidamente na hora
        de emitir uma nota.
      </p>

      {servicos.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhum serviço cadastrado ainda.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                  Descrição
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                  Código nacional
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                  NBS
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                  Valor padrão
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
              {servicos.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">{s.descricao}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {s.codigoTributacaoNacional || "—"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">{s.codigoNbs || "—"}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {Number(s.valor).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        s.ativo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {s.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm space-x-3">
                    <Link
                      href={`/dashboard/servicos/${s.id}/editar`}
                      className="text-brand-brown hover:underline"
                    >
                      Editar
                    </Link>
                    <form action={alternarServico} className="inline">
                      <input type="hidden" name="id" value={s.id} />
                      <button type="submit" className="text-brand-brown hover:underline">
                        {s.ativo ? "Desativar" : "Ativar"}
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
