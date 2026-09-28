import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, FileText, Plus, AlertTriangle, TrendingUp } from "lucide-react";

interface FaturamentoMensal {
  mes: Date;
  quantidade: bigint;
  total: number | null;
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const empresa = await prisma.empresa.findFirst({
    where: { userId: session.user.id },
  });

  if (!empresa) redirect("/onboarding");

  const [totalClientes, totalNotas, notasComErro, faturamentoMes, faturamentoMensal] =
    await Promise.all([
      prisma.cliente.count({ where: { empresaId: empresa.id } }),
      prisma.nota.count({ where: { empresaId: empresa.id } }),
      prisma.nota.findMany({
        where: { empresaId: empresa.id, status: "ERRO" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, descricaoServico: true, erro: true, createdAt: true },
      }),
      prisma.nota.aggregate({
        where: {
          empresaId: empresa.id,
          status: "AUTORIZADA",
          createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
        _sum: { valor: true },
      }),
      prisma.$queryRaw<FaturamentoMensal[]>`
        SELECT date_trunc('month', "createdAt") AS mes,
               COUNT(*) AS quantidade,
               SUM("valor")::float AS total
        FROM "Nota"
        WHERE "empresaId" = ${empresa.id} AND "status" = 'AUTORIZADA'
        GROUP BY mes
        ORDER BY mes DESC
        LIMIT 6
      `,
    ]);

  const pendencias = [
    ...(!empresa.focusNfeTokenEncrypted
      ? [
          {
            id: "config-fiscal",
            titulo: "Configuração fiscal pendente",
            descricao:
              "Sua empresa ainda não está habilitada para emitir notas. Revise os dados em Empresa.",
            href: "/dashboard/empresa",
          },
        ]
      : []),
    ...notasComErro.map((nota) => ({
      id: nota.id,
      titulo: `Nota rejeitada — ${nota.descricaoServico}`,
      descricao: nota.erro || "A emissão retornou um erro. Revise os dados e tente novamente.",
      href: "/dashboard/notas",
    })),
  ];

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold text-gray-900">
        Olá, {empresa.razaoSocial}
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Aqui está um resumo da sua conta.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

        <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-cream text-brand-dark">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-2xl font-semibold text-gray-900">
              {Number(faturamentoMes._sum.valor ?? 0).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
            <p className="text-sm text-gray-500">Faturado neste mês</p>
          </div>
        </div>
      </div>

      <Link
        href="/dashboard/notas/nova"
        className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-dashed border-brand-tan bg-white p-6 text-sm font-medium text-brand-dark hover:bg-brand-cream"
      >
        <Plus size={16} />
        Emitir nova nota
      </Link>

      {pendencias.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">
            Você precisa resolver
          </h2>
          <div className="space-y-2">
            {pendencias.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 transition-colors hover:border-amber-300"
              >
                <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.titulo}</p>
                  <p className="text-sm text-gray-600">{item.descricao}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {faturamentoMensal.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">
            Faturamento por mês (notas autorizadas)
          </h2>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    Mês
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    Notas
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    Faturado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {faturamentoMensal.map((linha) => (
                  <tr key={linha.mes.toString()}>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {(() => {
                        const texto = new Date(linha.mes).toLocaleDateString("pt-BR", {
                          month: "long",
                          year: "numeric",
                          timeZone: "UTC",
                        });
                        return texto.charAt(0).toUpperCase() + texto.slice(1);
                      })()}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {Number(linha.quantidade)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {Number(linha.total ?? 0).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
