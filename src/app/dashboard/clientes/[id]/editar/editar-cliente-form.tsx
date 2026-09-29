"use client";

import { useActionState, useState } from "react";
import type { Cliente } from "@prisma/client";
import { atualizarCliente, type ClienteState } from "../../actions";

const initialState: ClienteState = {};

export function EditarClienteForm({ cliente }: { cliente: Cliente }) {
  const [state, formAction, pending] = useActionState(
    atualizarCliente.bind(null, cliente.id),
    initialState,
  );

  const [mostrarFiscalAvancado, setMostrarFiscalAvancado] = useState(
    !!(cliente.inscricaoMunicipal || cliente.inscricaoEstadual),
  );

  const documentoSomenteDigitos = cliente.documento.replace(/\D/g, "");
  const pareceCnpj = documentoSomenteDigitos.length === 14;
  const tipoPessoa = pareceCnpj
    ? "Pessoa Jurídica"
    : documentoSomenteDigitos.length === 11
      ? "Pessoa Física"
      : null;

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <input
        type="hidden"
        name="municipioCodigoIbge"
        defaultValue={cliente.municipioCodigoIbge ?? ""}
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Nome/Razão social *</label>
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
          {tipoPessoa && <p className="mt-1 text-xs font-medium text-gray-500">{tipoPessoa}</p>}
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

        {pareceCnpj && (
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Nome fantasia</label>
            <input
              name="nomeFantasia"
              defaultValue={cliente.nomeFantasia ?? ""}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Telefone</label>
          <input
            name="telefone"
            defaultValue={cliente.telefone ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
          <input
            name="whatsapp"
            defaultValue={cliente.whatsapp ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
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

        <div>
          <label className="block text-sm font-medium text-gray-700">UF</label>
          <input
            name="uf"
            maxLength={2}
            defaultValue={cliente.uf ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm uppercase"
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
          <label className="block text-sm font-medium text-gray-700">Complemento</label>
          <input
            name="complemento"
            defaultValue={cliente.complemento ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Bairro</label>
          <input
            name="bairro"
            defaultValue={cliente.bairro ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Município</label>
          <input
            name="municipio"
            defaultValue={cliente.municipio ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setMostrarFiscalAvancado((v) => !v)}
          className="text-sm font-medium text-brand-brown hover:underline"
        >
          {mostrarFiscalAvancado ? "▾" : "▸"} ⚙️ Dados fiscais avançados
        </button>

        {mostrarFiscalAvancado && (
          <div className="mt-3 grid grid-cols-2 gap-4 rounded-md border border-dashed border-gray-300 p-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Inscrição Municipal
              </label>
              <input
                name="inscricaoMunicipal"
                defaultValue={cliente.inscricaoMunicipal ?? ""}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Inscrição Estadual
              </label>
              <input
                name="inscricaoEstadual"
                defaultValue={cliente.inscricaoEstadual ?? ""}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              />
            </div>
            <p className="col-span-2 text-xs text-gray-500">
              Só necessário em municípios/regimes específicos, deixe em branco se não souber.
            </p>
          </div>
        )}
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
