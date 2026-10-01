import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, FileText, Plus, AlertTriangle, TrendingUp, Wallet } from "lucide-react";
import { sanitizarMensagemExibicao } from "@/lib/erros-fiscais";

interface FaturamentoMensal {
  mes: Date;
  quantidade: bigint;
  total: number | null;
}

interface TopCliente {
  clienteId: string;
  nome: string;
  quantidade: bigint;
  total: number | null;
}

// Teto anual de faturamento bruto do MEI (Lei Complementar 123/2006, art. 18-A).
const LIMITE_ANUAL_MEI = 81000;

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const empresa = await prisma.empresa.findFirst({
    where: { userId: session.user.id },
  });

  if (!empresa) redirect("/onboarding");

  const inicioAno = new Date(new Date().getFullYear(), 0, 1);

  const [
    totalClientes,
    totalNotas,
    notasComErro,
    faturamentoMes,
    faturamentoAno,
    faturamentoMensal,
    topClientes,
  ] = await Promise.all([
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
    prisma.nota.aggregate({
      where: {
        empresaId: empresa.id,
        status: "AUTORIZADA",
        createdAt: { gte: inicioAno },
      },
      _sum: { valor: true },
      _count: true,
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
    prisma.$queryRaw<TopCliente[]>`
      SELECT c.id AS "clienteId",
             c.nome AS nome,
             COUNT(*) AS quantidade,
             SUM(n."valor")::float AS total
      FROM "Nota" n
      JOIN "Cliente" c ON c.id = n."clienteId"
      WHERE n."empresaId" = ${empresa.id} AND n."status" = 'AUTORIZADA'
        AND n."createdAt" >= ${inicioAno}
      GROUP BY c.id, c.nome
      ORDER BY total DESC
      LIMIT 5
    `,
  ]);

  const totalFaturadoAno = Number(faturamentoAno._sum.valor ?? 0);
  const ticketMedioAno =
    faturamentoAno._count > 0 ? totalFaturadoAno / faturamentoAno._count : 0;
  const percentualLimiteMei = (totalFaturadoAno / LIMITE_ANUAL_MEI) * 100;

  const pendencias = [
    ...(!empresa.regimeTributario
      ? [
          {
            id: "regime-tributario",
            titulo: "Regime tributário pendente",
            descricao:
              "Não conseguimos identificar seu regime tributário automaticamente pelo CNPJ. Defina em Empresa para poder emitir notas.",
            href: "/dashboard/empresa",
          },
        ]
      : []),
    ...(empresa.regimeTributario && !empresa.focusNfeTokenEncrypted
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
      titulo: `Nota rejeitada: ${nota.descricaoServico}`,
      descricao: nota.erro
        ? sanitizarMensagemExibicao(nota.erro)
        : "A emissão retornou um erro. Revise os dados e tente novamente.",
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

      {empresa.regimeTributario === "MEI" && (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Limite anual do MEI</h2>
          <div
            className={`rounded-lg border p-4 ${
              percentualLimiteMei >= 100
                ? "border-red-200 bg-red-50"
                : percentualLimiteMei >= 80
                  ? "border-amber-200 bg-amber-50"
                  : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">
                {totalFaturadoAno.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}{" "}
                de{" "}
                {LIMITE_ANUAL_MEI.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}{" "}
                faturados em {new Date().getFullYear()}
              </span>
              <span
                className={`font-semibold ${
                  percentualLimiteMei >= 100
                    ? "text-red-700"
                    : percentualLimiteMei >= 80
                      ? "text-amber-700"
                      : "text-gray-900"
                }`}
              >
                {percentualLimiteMei.toFixed(0)}%
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full ${
                  percentualLimiteMei >= 100
                    ? "bg-red-500"
                    : percentualLimiteMei >= 80
                      ? "bg-amber-500"
                      : "bg-brand-brown"
                }`}
                style={{ width: `${Math.min(percentualLimiteMei, 100)}%` }}
              />
            </div>
            {percentualLimiteMei >= 100 ? (
              <p className="mt-2 text-xs text-red-700">
                Você já ultrapassou o teto anual do MEI. Fale com seu contador sobre o
                desenquadramento e a próxima faixa do Simples Nacional.
              </p>
            ) : percentualLimiteMei >= 80 ? (
              <p className="mt-2 text-xs text-amber-700">
                Você está perto do teto anual do MEI. Vale planejar com seu contador antes de
                ultrapassar.
              </p>
            ) : null}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Painel financeiro</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-cream text-brand-dark">
              <Wallet size={20} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">
                {totalFaturadoAno.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
              <p className="text-sm text-gray-500">Faturado em {new Date().getFullYear()}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-cream text-brand-dark">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">
                {ticketMedioAno.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
              <p className="text-sm text-gray-500">Ticket médio por nota (no ano)</p>
            </div>
          </div>
        </div>

        {topClientes.length > 0 && (
          <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
              Maiores clientes no ano
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    Cliente
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
                {topClientes.map((c) => (
                  <tr key={c.clienteId}>
                    <td className="px-4 py-2 text-sm text-gray-900">{c.nome}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{Number(c.quantidade)}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {Number(c.total ?? 0).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
