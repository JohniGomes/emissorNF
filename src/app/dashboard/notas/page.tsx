import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { CancelarNotaButton } from "./cancelar-nota-button";
import { DetalhesFiscais } from "./detalhes-fiscais";
import { sanitizarMensagemExibicao } from "@/lib/erros-fiscais";

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

const POR_PAGINA = 20;

interface NotasSearchParams {
  page?: string;
  cliente?: string;
  status?: string;
  de?: string;
  ate?: string;
}

export default async function NotasPage({
  searchParams,
}: {
  searchParams: Promise<NotasSearchParams>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const empresa = await prisma.empresa.findFirst({
    where: { userId: session.user.id },
  });
  if (!empresa) redirect("/dashboard/empresa");

  const { page: pageParam, cliente, status, de, ate } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const where: Prisma.NotaWhereInput = { empresaId: empresa.id };

  if (cliente) {
    where.cliente = { nome: { contains: cliente, mode: "insensitive" } };
  }
  if (status) {
    where.status = status as Prisma.NotaWhereInput["status"];
  }
  if (de || ate) {
    where.createdAt = {
      ...(de ? { gte: new Date(`${de}T00:00:00`) } : {}),
      ...(ate ? { lte: new Date(`${ate}T23:59:59`) } : {}),
    };
  }

  const [notas, total] = await Promise.all([
    prisma.nota.findMany({
      where,
      include: { cliente: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * POR_PAGINA,
      take: POR_PAGINA,
    }),
    prisma.nota.count({ where }),
  ]);

  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  const filtroAtivo = Boolean(cliente || status || de || ate);

  function paginaHref(novaPagina: number) {
    const params = new URLSearchParams();
    if (cliente) params.set("cliente", cliente);
    if (status) params.set("status", status);
    if (de) params.set("de", de);
    if (ate) params.set("ate", ate);
    params.set("page", String(novaPagina));
    return `/dashboard/notas?${params.toString()}`;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Notas emitidas</h1>
        <Link
          href="/dashboard/notas/nova"
          className="rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white"
        >
          + Emitir nota
        </Link>
      </div>

      <form
        method="get"
        className="mb-4 grid grid-cols-2 gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-4"
      >
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-xs font-medium text-gray-700">Cliente</label>
          <input
            type="text"
            name="cliente"
            defaultValue={cliente ?? ""}
            placeholder="Buscar por nome"
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">Status</label>
          <select
            name="status"
            defaultValue={status ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm"
          >
            <option value="">Todos</option>
            {Object.entries(statusLabel).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">De</label>
          <input
            type="date"
            name="de"
            defaultValue={de ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">Até</label>
          <input
            type="date"
            name="ate"
            defaultValue={ate ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm"
          />
        </div>
        <div className="col-span-2 flex items-end gap-2 sm:col-span-4">
          <button
            type="submit"
            className="rounded-md btn-gradient px-4 py-1.5 text-sm font-medium text-white"
          >
            Filtrar
          </button>
          {filtroAtivo && (
            <Link
              href="/dashboard/notas"
              className="rounded-md border border-gray-300 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              Limpar filtros
            </Link>
          )}
        </div>
      </form>

      {notas.length === 0 ? (
        <p className="text-sm text-gray-500">
          {filtroAtivo
            ? "Nenhuma nota encontrada com esses filtros."
            : page > 1
              ? "Nenhuma nota nesta página."
              : "Nenhuma nota emitida ainda."}
        </p>
      ) : (
        <>
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
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {notas.map((nota) => {
                  const paramsNovamente = new URLSearchParams({
                    clienteId: nota.clienteId,
                    descricao: nota.descricaoServico,
                    valor: Number(nota.valor).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }),
                  });

                  return (
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
                          <p className="mt-1 text-xs text-red-600">
                            {sanitizarMensagemExibicao(nota.erro)}
                          </p>
                        )}
                        {nota.status === "AUTORIZADA" && (
                          <DetalhesFiscais respostaApi={nota.respostaApi} />
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
                          nota.numero || ""
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <Link
                          href={`/dashboard/notas/nova?${paramsNovamente.toString()}`}
                          className="text-brand-brown hover:underline"
                        >
                          Emitir novamente
                        </Link>
                        {nota.status === "AUTORIZADA" && (
                          <div className="mt-1">
                            <CancelarNotaButton notaId={nota.id} />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPaginas > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <Link
                href={paginaHref(page - 1)}
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
                href={paginaHref(page + 1)}
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
