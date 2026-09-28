"use client";

import { useState } from "react";
import { useActionState } from "react";
import { emitirNota, type NotaState } from "../actions";

interface NotaFormProps {
  clientes: { id: string; nome: string; documento: string }[];
}

const initialState: NotaState = {};
const CLIENTE_MANUAL = "__manual__";

export function NotaForm({ clientes }: NotaFormProps) {
  const [state, formAction, pending] = useActionState(emitirNota, initialState);
  const [clienteId, setClienteId] = useState("");
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  const clienteManualSelecionado = clienteId === CLIENTE_MANUAL;

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />

      <div>
        <label className="block text-sm font-medium text-gray-700">Cliente *</label>
        <select
          name="clienteId"
          required
          value={clienteId}
          onChange={(e) => setClienteId(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Selecione o cliente</option>
          {clientes.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nome} — {cliente.documento}
            </option>
          ))}
          <option value={CLIENTE_MANUAL}>Cliente não cadastrado (inserir dados)</option>
        </select>
      </div>

      {clienteManualSelecionado && (
        <div className="space-y-3 rounded-md border border-dashed border-gray-300 p-3">
          <p className="text-xs text-gray-500">
            Esses dados serão salvos como um novo cliente da sua carteira.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome/Razão social *</label>
            <input
              name="clienteManualNome"
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">CPF/CNPJ *</label>
            <input
              name="clienteManualDocumento"
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">E-mail</label>
            <input
              name="clienteManualEmail"
              type="email"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      )}

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

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Emitindo..." : "Emitir nota"}
      </button>
    </form>
  );
}
