"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SeletorCodigoTributacao } from "@/components/seletor-codigo-tributacao";
import { buscarCodigoTributacaoNacional } from "@/lib/codigoTributacaoNacional";
import { buscarNbsPorItem } from "@/lib/nbs";
import { criarServicosEmLote, type ItemServicoLote } from "../actions";

interface ItemPendente extends ItemServicoLote {
  descricao: string;
  descricaoNbs?: string;
}

export function NovoServicoForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();

  const [codigoSelecionado, setCodigoSelecionado] = useState("");
  const [nbsSelecionado, setNbsSelecionado] = useState("");
  const [itens, setItens] = useState<ItemPendente[]>([]);

  const nbsCorrelacionados = useMemo(
    () => buscarNbsPorItem(codigoSelecionado.slice(0, 4)),
    [codigoSelecionado],
  );

  function handleAdicionar() {
    setError(undefined);
    if (!codigoSelecionado) {
      setError("Escolha o código de tributação nacional antes de adicionar.");
      return;
    }
    if (itens.some((i) => i.codigoTributacaoNacional === codigoSelecionado)) {
      setError("Esse serviço já está na lista.");
      return;
    }

    const encontrado = buscarCodigoTributacaoNacional(codigoSelecionado, 1)[0];
    const nbsInfo = nbsCorrelacionados.find((n) => n.nbs === nbsSelecionado);

    setItens((prev) => [
      ...prev,
      {
        codigoTributacaoNacional: codigoSelecionado,
        codigoNbs: nbsSelecionado || undefined,
        descricao: encontrado?.descricao ?? codigoSelecionado,
        descricaoNbs: nbsInfo?.descricao,
      },
    ]);
    setCodigoSelecionado("");
    setNbsSelecionado("");
  }

  function handleRemover(codigo: string) {
    setItens((prev) => prev.filter((i) => i.codigoTributacaoNacional !== codigo));
  }

  function handleSalvar() {
    setError(undefined);
    if (itens.length === 0) {
      setError("Adicione ao menos um serviço à lista.");
      return;
    }
    startTransition(async () => {
      const resultado = await criarServicosEmLote(
        itens.map(({ codigoTributacaoNacional, codigoNbs }) => ({
          codigoTributacaoNacional,
          codigoNbs,
        })),
      );
      if (resultado.error) {
        setError(resultado.error);
        return;
      }
      router.push("/dashboard/servicos");
    });
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="rounded-md border border-gray-200 bg-white p-4">
        <label className="block text-sm font-medium text-gray-700">
          Código de tributação nacional *
        </label>
        <SeletorCodigoTributacao
          value={codigoSelecionado}
          onChange={(codigo) => {
            setCodigoSelecionado(codigo);
            setNbsSelecionado("");
          }}
          formato="nacional"
        />
        <p className="mt-1 text-xs text-gray-500">
          Digite o código ou parte da descrição do serviço que você presta pra filtrar a
          tabela oficial.
        </p>

        {codigoSelecionado && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Código NBS</label>
            {nbsCorrelacionados.length > 0 ? (
              <select
                value={nbsSelecionado}
                onChange={(e) => setNbsSelecionado(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">Nenhum</option>
                {nbsCorrelacionados.map((item) => (
                  <option key={item.nbs} value={item.nbs}>
                    {item.nbs} - {item.descricao}
                  </option>
                ))}
              </select>
            ) : (
              <p className="mt-1 text-xs text-gray-500">
                Nenhum NBS oficialmente correlacionado a este item - pode deixar em branco.
              </p>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={handleAdicionar}
          disabled={!codigoSelecionado}
          className="mt-4 rounded-md border border-brand-tan bg-brand-cream px-4 py-2 text-sm font-medium text-brand-dark hover:bg-brand-cream disabled:opacity-50"
        >
          + Adicionar à lista
        </button>
      </div>

      {itens.length > 0 && (
        <div className="rounded-md border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
            Serviços a cadastrar ({itens.length})
          </div>
          <ul className="divide-y divide-gray-100">
            {itens.map((item) => (
              <li
                key={item.codigoTributacaoNacional}
                className="flex items-start justify-between gap-3 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {item.codigoTributacaoNacional} - {item.descricao}
                  </p>
                  {item.codigoNbs && (
                    <p className="text-xs text-gray-500">
                      NBS: {item.codigoNbs} - {item.descricaoNbs}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemover(item.codigoTributacaoNacional)}
                  className="shrink-0 text-xs font-medium text-red-600 hover:underline"
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handleSalvar}
        disabled={pending || itens.length === 0}
        className="rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Salvando..." : "Salvar"}
      </button>
    </div>
  );
}
