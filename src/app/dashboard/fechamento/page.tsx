import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const statusLabel: Record<string, string> = {
  PENDENTE: "Pendente",
  PROCESSANDO: "Processando",
  AUTORIZADA: "Autorizada",
  ERRO: "Erro",
  CANCELADA: "Cancelada",
};

export default async function FechamentoPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const empresa = await prisma.empresa.findFirst({
    where: { userId: session.user.id },
  });
  if (!empresa) redirect("/dashboard/empresa");

  const notas = await prisma.nota.findMany({
    where: { empresaId: empresa.id },
    select: { valor: true, status: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const meses = new Map<
    string,
    { total: number; quantidade: number; porStatus: Record<string, number> }
  >();

  for (const nota of notas) {
    const chave = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
    }).format(nota.createdAt);

    if (!meses.has(chave)) {
      meses.set(chave, { total: 0, quantidade: 0, porStatus: {} });
    }

    const mes = meses.get(chave)!;
    mes.total += Number(nota.valor);
    mes.quantidade += 1;
    mes.porStatus[nota.status] = (mes.porStatus[nota.status] ?? 0) + 1;
  }

  const mesesOrdenados = Array.from(meses.entries()).sort((a, b) =>
    b[0].localeCompare(a[0]),
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Fechamento</h1>
        <p className="mt-1 text-sm text-gray-500">
          Resumo mensal das notas emitidas — útil para conferência e envio ao
          contador.
        </p>
      </div>

      {mesesOrdenados.length === 0 ? (
        <div className="rounded-lg border border-dashed border-brand-tan bg-white p-8 text-center text-sm text-gray-500">
          Nenhuma nota emitida ainda.
        </div>
      ) : (
        <div className="space-y-4">
          {mesesOrdenados.map(([mes, dados]) => (
            <div
              key={mes}
              className="rounded-lg border border-gray-200 bg-white p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-lg font-medium text-gray-900">{mes}</h2>
                <div className="flex gap-6 text-sm">
                  <div>
                    <p className="text-gray-500">Notas emitidas</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {dados.quantidade}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {dados.total.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {Object.entries(dados.porStatus).map(([status, qtd]) => (
                  <span
                    key={status}
                    className="rounded-full bg-brand-cream px-3 py-1 text-xs font-medium text-brand-dark"
                  >
                    {statusLabel[status] ?? status}: {qtd}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
