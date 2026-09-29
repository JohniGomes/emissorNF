"use client";

import { useActionState } from "react";
import type { Cliente } from "@prisma/client";
import { atualizarCliente, type ClienteState } from "../../actions";

const initialState: ClienteState = {};

export function EditarClienteForm({ cliente }: { cliente: Cliente }) {
  const [state, formAction, pending] = useActionState(
    atualizarCliente.bind(null, cliente.id),
    initialState,
  );

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Nome *</label>
          <input
            name="nome"
            required
            defaultValue={cliente.nome}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">CPF/CNPJ *</label>
          <input
            name="documento"
            required
            defaultValue={cliente.documento}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">E-mail</label>
          <input
            name="email"
            type="email"
            defaultValue={cliente.email ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Logradouro</label>
          <input
            name="logradouro"
            defaultValue={cliente.logradouro ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Número</label>
          <input
            name="numero"
            defaultValue={cliente.numero ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Bairro</label>
          <input
            name="bairro"
            defaultValue={cliente.bairro ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Município</label>
          <input
            name="municipio"
            defaultValue={cliente.municipio ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">UF</label>
          <input
            name="uf"
            maxLength={2}
            defaultValue={cliente.uf ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm uppercase"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">CEP</label>
          <input
            name="cep"
            defaultValue={cliente.cep ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Salvando..." : "Salvar alterações"}
      </button>
    </form>
  );
}
