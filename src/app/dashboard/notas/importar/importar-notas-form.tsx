"use client";

import { useMemo, useState } from "react";
import { parseCsv } from "@/lib/csv";
import { formatarCpfCnpj, formatarValorMonetarioInput, paraNumero } from "@/lib/formatters";
import { importarLoteNotas, type ResultadoItemImportacao } from "./actions";

interface Servico {
  id: string;
  nome: string;
  descricao: string;
  codigoTributacaoNacional: string | null;
}

interface ImportarNotasFormProps {
  servicos: Servico[];
  ehMei: boolean;
}

interface ItemPreview {
  idempotencyKey: string;
  linha: number;
  nomeCliente: string;
  documentoCliente: string;
  valor: number;
  erro?: string;
}

function hojeISO() {
  const agora = new Date();
  const offset = agora.getTimezoneOffset();
  return new Date(agora.getTime() - offset * 60 * 1000).toISOString().slice(0, 10);
}

function fatiarEmLotes<T>(itens: T[], tamanho: number): T[][] {
  const lotes: T[][] = [];
  for (let i = 0; i < itens.length; i += tamanho) {
    lotes.push(itens.slice(i, i + tamanho));
  }
  return lotes;
}

const TAMANHO_LOTE = 15;

export function ImportarNotasForm({ servicos, ehMei }: ImportarNotasFormProps) {
  const [etapa, setEtapa] = useState<"upload" | "mapear" | "revisao" | "resultado">("upload");
  const [erroArquivo, setErroArquivo] = useState<string | undefined>();

  const [headers, setHeaders] = useState<string[]>([]);
  const [linhas, setLinhas] = useState<string[][]>([]);

  const [colNome, setColNome] = useState("");
  const [colDocumento, setColDocumento] = useState("");
  const [colValor, setColValor] = useState("");

  const [servicoId, setServicoId] = useState(servicos[0]?.id ?? "");
  const [dataCompetencia, setDataCompetencia] = useState(hojeISO());

  const [itensValidos, setItensValidos] = useState<ItemPreview[]>([]);
  const [itensInvalidos, setItensInvalidos] = useState<ItemPreview[]>([]);

  const [emitindo, setEmitindo] = useState(false);
  const [processados, setProcessados] = useState(0);
  const [resultados, setResultados] = useState<Map<string, ResultadoItemImportacao>>(new Map());

  const servicoSelecionado = servicos.find((s) => s.id === servicoId);

  async function handleArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    setErroArquivo(undefined);
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    const texto = await arquivo.text();
    const { headers: h, linhas: l } = parseCsv(texto);

    if (h.length === 0 || l.length === 0) {
      setErroArquivo("Não encontramos dados nesse arquivo. Confira se é um CSV com cabeçalho.");
      return;
    }

    setHeaders(h);
    setLinhas(l);

    // Tenta adivinhar as colunas pelo nome - o usuário sempre pode corrigir.
    const acharColuna = (padroes: RegExp) => h.find((nome) => padroes.test(nome)) ?? "";
    setColNome(acharColuna(/nome|cliente|marca|raz[aã]o/i));
    setColDocumento(acharColuna(/cnpj|cpf|documento/i));
    setColValor(acharColuna(/valor|comiss[aã]o|total/i));

    setEtapa("mapear");
  }

  function handleProcessar() {
    const idxNome = headers.indexOf(colNome);
    const idxDocumento = headers.indexOf(colDocumento);
    const idxValor = headers.indexOf(colValor);

    const validos: ItemPreview[] = [];
    const invalidos: ItemPreview[] = [];

    linhas.forEach((linha, i) => {
      const nomeCliente = (linha[idxNome] ?? "").trim();
      const documentoCliente = formatarCpfCnpj(linha[idxDocumento] ?? "");
      const documentoDigitos = documentoCliente.replace(/\D/g, "");
      const valorTexto = (linha[idxValor] ?? "").trim();
      const valor = paraNumero(formatarValorMonetarioInput(valorTexto.replace(/\D/g, "")));

      const item: ItemPreview = {
        idempotencyKey: crypto.randomUUID(),
        linha: i + 2, // +1 cabeçalho, +1 base 1
        nomeCliente,
        documentoCliente,
        valor,
      };

      if (!nomeCliente) {
        invalidos.push({ ...item, erro: "Nome do cliente vazio." });
      } else if (documentoDigitos.length !== 11 && documentoDigitos.length !== 14) {
        invalidos.push({ ...item, erro: "CPF/CNPJ inválido ou ausente." });
      } else if (!valor || Number.isNaN(valor) || valor <= 0) {
        invalidos.push({ ...item, erro: "Valor inválido ou ausente." });
      } else {
        validos.push(item);
      }
    });

    setItensValidos(validos);
    setItensInvalidos(invalidos);
    setEtapa("revisao");
  }

  async function handleEmitir() {
    setEmitindo(true);
    setProcessados(0);
    setResultados(new Map());
    setEtapa("resultado");

    const lotes = fatiarEmLotes(itensValidos, TAMANHO_LOTE);
    const novosResultados = new Map<string, ResultadoItemImportacao>();

    for (const lote of lotes) {
      try {
        const resultadoLote = await importarLoteNotas(
          servicoId,
          dataCompetencia,
          lote.map((item) => ({
            idempotencyKey: item.idempotencyKey,
            nomeCliente: item.nomeCliente,
            documentoCliente: item.documentoCliente,
            valor: item.valor,
          })),
        );
        for (const r of resultadoLote) novosResultados.set(r.idempotencyKey, r);
      } catch (err) {
        for (const item of lote) {
          novosResultados.set(item.idempotencyKey, {
            idempotencyKey: item.idempotencyKey,
            ok: false,
            mensagem: err instanceof Error ? err.message : "Erro desconhecido.",
          });
        }
      }
      setProcessados((p) => p + lote.length);
      setResultados(new Map(novosResultados));
    }

    setEmitindo(false);
  }

  const totalSucesso = useMemo(
    () => Array.from(resultados.values()).filter((r) => r.ok).length,
    [resultados],
  );

  if (etapa === "upload") {
    return (
      <div className="max-w-xl space-y-4">
        <div className="rounded-md border border-dashed border-gray-300 bg-white p-6 text-center">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleArquivo}
            className="mx-auto block text-sm"
          />
          <p className="mt-2 text-xs text-gray-500">
            Arquivo CSV com cabeçalho na primeira linha (exportado do Excel/Google Sheets ou do
            relatório do programa de afiliados).
          </p>
        </div>
        {erroArquivo && <p className="text-sm text-red-600">{erroArquivo}</p>}
      </div>
    );
  }

  if (etapa === "mapear") {
    return (
      <div className="max-w-xl space-y-4">
        <div className="rounded-md border border-gray-200 bg-white p-4 space-y-4">
          <p className="text-sm text-gray-600">
            Encontramos {linhas.length} linha(s). Diga qual coluna do arquivo corresponde a cada
            informação.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Coluna com o nome do cliente *
            </label>
            <select
              value={colNome}
              onChange={(e) => setColNome(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Selecione</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Coluna com o CPF/CNPJ do cliente *
            </label>
            <select
              value={colDocumento}
              onChange={(e) => setColDocumento(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Selecione</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Obrigatório - é o documento do tomador na nota. Linhas sem um CPF/CNPJ válido
              serão marcadas como erro e não entram na emissão.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Coluna com o valor *
            </label>
            <select
              value={colValor}
              onChange={(e) => setColValor(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Selecione</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Serviço a aplicar em todas as notas *
            </label>
            <select
              value={servicoId}
              onChange={(e) => setServicoId(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              {servicos.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome || s.descricao}
                </option>
              ))}
            </select>
            {ehMei && !servicoSelecionado?.codigoTributacaoNacional && (
              <p className="mt-1 text-xs text-amber-600">
                Esse serviço não tem código de tributação nacional cadastrado - obrigatório
                para MEI. Edite o serviço antes de continuar.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Data de competência (aplicada a todas as notas)
            </label>
            <input
              type="date"
              value={dataCompetencia}
              onChange={(e) => setDataCompetencia(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setEtapa("upload")}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
          >
            ← Trocar arquivo
          </button>
          <button
            type="button"
            onClick={handleProcessar}
            disabled={!colNome || !colDocumento || !colValor || !servicoId}
            className="rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Revisar linhas →
          </button>
        </div>
      </div>
    );
  }

  if (etapa === "revisao") {
    return (
      <div className="max-w-3xl space-y-4">
        <div className="rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-600">
          <p>
            <span className="font-medium text-gray-900">{itensValidos.length}</span> linha(s)
            prontas pra emitir
            {itensInvalidos.length > 0 && (
              <>
                {" "}
                e{" "}
                <span className="font-medium text-amber-600">{itensInvalidos.length}</span>{" "}
                com erro (não serão emitidas)
              </>
            )}
            .
          </p>
        </div>

        {itensValidos.length > 0 && (
          <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    Linha
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    Cliente
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    CPF/CNPJ
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {itensValidos.map((item) => (
                  <tr key={item.idempotencyKey}>
                    <td className="px-3 py-2 text-gray-500">{item.linha}</td>
                    <td className="px-3 py-2 text-gray-900">{item.nomeCliente}</td>
                    <td className="px-3 py-2 text-gray-500">{item.documentoCliente}</td>
                    <td className="px-3 py-2 text-gray-500">
                      {item.valor.toLocaleString("pt-BR", {
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

        {itensInvalidos.length > 0 && (
          <div className="overflow-hidden rounded-md border border-amber-200 bg-amber-50">
            <table className="min-w-full divide-y divide-amber-200 text-sm">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase text-amber-700">
                    Linha
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase text-amber-700">
                    Motivo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {itensInvalidos.map((item) => (
                  <tr key={item.idempotencyKey}>
                    <td className="px-3 py-2 text-amber-800">{item.linha}</td>
                    <td className="px-3 py-2 text-amber-800">{item.erro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setEtapa("mapear")}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
          >
            ← Voltar
          </button>
          <button
            type="button"
            onClick={handleEmitir}
            disabled={itensValidos.length === 0}
            className="rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Emitir {itensValidos.length} nota(s)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div className="rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-600">
        {emitindo ? (
          <p>
            Emitindo... {processados} de {itensValidos.length} processadas.
          </p>
        ) : (
          <p>
            Concluído: <span className="font-medium text-gray-900">{totalSucesso}</span> de{" "}
            {itensValidos.length} emitidas com sucesso.
          </p>
        )}
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full bg-brand-brown transition-all"
            style={{ width: `${(processados / Math.max(itensValidos.length, 1)) * 100}%` }}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">
                Cliente
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">
                Valor
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">
                Resultado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {itensValidos.map((item) => {
              const resultado = resultados.get(item.idempotencyKey);
              return (
                <tr key={item.idempotencyKey}>
                  <td className="px-3 py-2 text-gray-900">{item.nomeCliente}</td>
                  <td className="px-3 py-2 text-gray-500">
                    {item.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </td>
                  <td className="px-3 py-2">
                    {!resultado ? (
                      <span className="text-xs text-gray-400">Aguardando</span>
                    ) : resultado.ok ? (
                      <span className="text-xs font-medium text-green-700">
                        {resultado.mensagem}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-red-600">
                        {resultado.mensagem}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!emitindo && (
        <a
          href="/dashboard/notas"
          className="inline-block rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white"
        >
          Ver notas emitidas
        </a>
      )}
    </div>
  );
}
