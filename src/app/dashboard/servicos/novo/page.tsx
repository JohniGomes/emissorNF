"use client";

import { useActionState } from "react";
import { criarServico, type ServicoState } from "../actions";

const initialState: ServicoState = {};

export default function NovoServicoPage() {
  const [state, formAction, pending] = useActionState(criarServico, initialState);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Novo serviço</h1>

      <form action={formAction} className="max-w-lg space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Descrição *</label>
          <textarea
            name="descricao"
            required
            rows={3}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Valor padrão (R$) *
          </label>
          <input
            name="valor"
            required
            inputMode="decimal"
            placeholder="0,00"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-brand-dark px-4 py-2 text-sm font-medium text-white hover:bg-brand-brown disabled:opacity-50"
        >
          {pending ? "Salvando..." : "Salvar serviço"}
        </button>
      </form>
    </div>
  );
}
