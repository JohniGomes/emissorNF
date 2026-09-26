"use client";

import { useActionState } from "react";
import { criarNotaRecorrente, type NotaRecorrenteState } from "./actions";

interface RecorrenteFormProps {
  clientes: { id: string; nome: string; documento: string }[];
}

const initialState: NotaRecorrenteState = {};

export function RecorrenteForm({ clientes }: RecorrenteFormProps) {
  const [state, formAction, pending] = useActionState(criarNotaRecorrente, initialState);

  if (clientes.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        Cadastre pelo menos um cliente antes de criar uma nota recorrente.
      </p>
    );
  }

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Cliente *</label>
        <select
          name="clienteId"
          required
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Selecione</option>
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
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
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
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Dia do mês *
          </label>
          <input
            name="diaDoMes"
            type="number"
            min={1}
            max={31}
            required
            placeholder="Ex: 5"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {pending ? "Salvando..." : "Criar recorrência"}
      </button>
    </form>
  );
}
