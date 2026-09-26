"use client";

import { useActionState, useState } from "react";
import { emitirNota, type NotaState } from "../actions";

interface NotaFormProps {
  clientes: { id: string; nome: string; documento: string }[];
  servicos: { id: string; descricao: string; valor: number }[];
}

const initialState: NotaState = {};

export function NotaForm({ clientes, servicos }: NotaFormProps) {
  const [state, formAction, pending] = useActionState(emitirNota, initialState);
  const [descricaoServico, setDescricaoServico] = useState("");
  const [valor, setValor] = useState("");

  function handleUsarServico(servicoId: string) {
    const servico = servicos.find((s) => s.id === servicoId);
    if (!servico) return;
    setDescricaoServico(servico.descricao);
    setValor(servico.valor.toFixed(2).replace(".", ","));
  }

  if (clientes.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        Cadastre pelo menos um cliente antes de emitir uma nota.
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

      {servicos.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Usar serviço salvo
          </label>
          <select
            onChange={(e) => handleUsarServico(e.target.value)}
            defaultValue=""
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Preencher manualmente</option>
            {servicos.map((servico) => (
              <option key={servico.id} value={servico.id}>
                {servico.descricao} —{" "}
                {servico.valor.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </option>
            ))}
          </select>
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
          value={descricaoServico}
          onChange={(e) => setDescricaoServico(e.target.value)}
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
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brand-dark px-4 py-2 text-sm font-medium text-white hover:bg-brand-brown disabled:opacity-50"
      >
        {pending ? "Emitindo..." : "Emitir nota"}
      </button>
    </form>
  );
}
