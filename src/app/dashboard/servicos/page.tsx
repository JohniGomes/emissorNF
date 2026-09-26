import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { excluirServico } from "./actions";

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
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Serviços</h1>
          <p className="mt-1 text-sm text-gray-500">
            Salve descrições e valores usados com frequência para preencher notas
            mais rápido.
          </p>
        </div>
        <Link
          href="/dashboard/servicos/novo"
          className="rounded-md bg-brand-dark px-4 py-2 text-sm font-medium text-white hover:bg-brand-brown"
        >
          + Novo serviço
        </Link>
      </div>

      {servicos.length === 0 ? (
        <div className="rounded-lg border border-dashed border-brand-tan bg-white p-8 text-center text-sm text-gray-500">
          Nenhum serviço salvo ainda.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-brand-cream/60">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                  Descrição
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                  Valor
                </th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {servicos.map((servico) => (
                <tr key={servico.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {servico.descricao}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {Number(servico.valor).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <form
                      action={async () => {
                        "use server";
                        await excluirServico(servico.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="text-sm text-gray-400 hover:text-red-600"
                      >
                        Excluir
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
