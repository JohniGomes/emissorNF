"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import { SeletorCodigoTributacao } from "@/components/seletor-codigo-tributacao";
import { buscarNbsPorItem } from "@/lib/nbs";
import type { ServicoState } from "./actions";

interface ServicoFormProps {
  action: (state: ServicoState, formData: FormData) => Promise<ServicoState>;
  defaultValues?: {
    nome: string;
    descricao: string;
    valor: number;
    codigoTributacaoNacional?: string | null;
    codigoNbs?: string | null;
  };
  textoBotao: string;
}

const initialState: ServicoState = {};

export function ServicoForm({ action, defaultValues, textoBotao }: ServicoFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [codigoTributacaoNacional, setCodigoTributacaoNacional] = useState(
    defaultValues?.codigoTributacaoNacional ?? "",
  );
  const [codigoNbs, setCodigoNbs] = useState(defaultValues?.codigoNbs ?? "");

  const nbsCorrelacionados = useMemo(
    () => buscarNbsPorItem(codigoTributacaoNacional.slice(0, 4)),
    [codigoTributacaoNacional],
  );

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Código de tributação nacional
        </label>
        <input type="hidden" name="codigoTributacaoNacional" value={codigoTributacaoNacional} />
        <SeletorCodigoTributacao
          value={codigoTributacaoNacional}
          onChange={(codigo) => {
            setCodigoTributacaoNacional(codigo);
            setCodigoNbs("");
          }}
          formato="nacional"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Código NBS</label>
        <input type="hidden" name="codigoNbs" value={codigoNbs} />
        {nbsCorrelacionados.length > 0 ? (
          <select
            value={codigoNbs}
            onChange={(e) => setCodigoNbs(e.target.value)}
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
            {codigoTributacaoNacional
              ? "Nenhum NBS oficialmente correlacionado a este item."
              : "Escolha o código de tributação nacional acima pra ver as opções de NBS."}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Nome do serviço *</label>
        <input
          name="nome"
          required
          defaultValue={defaultValues?.nome}
          placeholder="ex: Consultoria empresarial"
          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Descrição padrão *
        </label>
        <textarea
          name="descricao"
          required
          rows={3}
          defaultValue={defaultValues?.descricao}
          placeholder="Vai preencher a descrição da nota automaticamente - você pode editar depois."
          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Valor padrão (R$)
        </label>
        <input
          name="valor"
          inputMode="decimal"
          placeholder="0,00"
          defaultValue={defaultValues?.valor?.toFixed(2).replace(".", ",")}
          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">
          Opcional - deixe 0 se o valor variar por cliente. Você sempre pode
          ajustar na hora de emitir.
        </p>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Salvando..." : textoBotao}
      </button>
    </form>
  );
}
