"use client";

import { useActionState } from "react";
import { criarRecorrente, type RecorrenteState } from "../actions";

interface RecorrenteFormProps {
  clientes: { id: string; nome: string; documento: string }[];
  ehMei: boolean;
}

const initialState: RecorrenteState = {};

export function RecorrenteForm({ clientes, ehMei }: RecorrenteFormProps) {
  const [state, formAction, pending] = useActionState(criarRecorrente, initialState);

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Cliente *</label>
        <select
          name="clienteId"
          required
          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Selecione o cliente</option>
          {clientes.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nome} — {cliente.documento}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Descrição do serviço *
        </label>
        <textarea
          name="descricaoServico"
          required
          rows={3}
          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Valor (R$) *</label>
          <input
            name="valor"
            required
            inputMode="decimal"
            placeholder="0,00"
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Dia do mês *</label>
          <input
            name="diaDoMes"
            type="number"
            min={1}
            max={31}
            required
            placeholder="ex: 5"
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Repetir por quantos meses?
        </label>
        <input
          name="quantidadeMeses"
          type="number"
          min={1}
          placeholder="Deixe em branco para repetir sem prazo definido"
          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">
          Ex: 12 para emitir todo mês pelos próximos 12 meses e desativar
          sozinho depois. Deixe em branco pra repetir indefinidamente, até você
          desativar manualmente.
        </p>
      </div>

      {ehMei && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Código de tributação nacional do ISS *
          </label>
          <input
            name="codigoTributacaoNacionalIss"
            required
            placeholder="ex: 010701"
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">
            Exigido pela NFS-e Nacional em toda emissão para empresas MEI.
          </p>
        </div>
      )}

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Salvando..." : "Criar recorrência"}
      </button>
    </form>
  );
}
