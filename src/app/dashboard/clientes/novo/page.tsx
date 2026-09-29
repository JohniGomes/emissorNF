"use client";

import { useActionState, useState } from "react";
import {
  criarCliente,
  buscarCnpjClienteAction,
  type ClienteState,
  type BuscarCnpjClienteState,
} from "../actions";

const initialState: ClienteState = {};
const initialBuscaState: BuscarCnpjClienteState = {};

export default function NovoClientePage() {
  const [state, formAction, pending] = useActionState(criarCliente, initialState);

  const [documento, setDocumento] = useState("");
  const [nome, setNome] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [uf, setUf] = useState("");
  const [cep, setCep] = useState("");

  const [buscaState, setBuscaState] = useState<BuscarCnpjClienteState>(initialBuscaState);
  const [buscando, setBuscando] = useState(false);

  const somenteDigitos = documento.replace(/\D/g, "");
  const pareceCnpj = somenteDigitos.length === 14;
  const pareceCpf = somenteDigitos.length === 11;

  async function handleBuscarCnpj() {
    setBuscando(true);
    setBuscaState(initialBuscaState);

    const formData = new FormData();
    formData.set("documento", documento);
    const resultado = await buscarCnpjClienteAction(initialBuscaState, formData);
    setBuscaState(resultado);
    setBuscando(false);

    if (resultado.dados) {
      const d = resultado.dados;
      setNome(d.razaoSocial);
      setLogradouro(d.logradouro ?? "");
      setNumero(d.numero ?? "");
      setBairro(d.bairro ?? "");
      setMunicipio(d.municipio ?? "");
      setUf(d.uf ?? "");
      setCep(d.cep ?? "");
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Novo cliente</h1>

      <form action={formAction} className="max-w-xl space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">CPF/CNPJ *</label>
            <div className="mt-1 flex gap-2">
              <input
                name="documento"
                required
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                placeholder="Só números"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              />
              {pareceCnpj && (
                <button
                  type="button"
                  onClick={handleBuscarCnpj}
                  disabled={buscando}
                  className="whitespace-nowrap rounded-md border border-brand-tan bg-brand-cream px-3 py-2 text-sm font-medium text-brand-dark hover:bg-brand-cream disabled:opacity-50"
                >
                  {buscando ? "Buscando..." : "Buscar dados"}
                </button>
              )}
            </div>
            {buscaState.error && (
              <p className="mt-1 text-sm text-red-600">{buscaState.error}</p>
            )}
            {buscaState.dados && (
              <p className="mt-1 text-sm text-green-600">
                Dados encontrados! Confira e complete abaixo.
              </p>
            )}
            {pareceCpf && (
              <p className="mt-1 text-xs text-gray-500">
                Não é possível autopreencher dados a partir de CPF — preencha manualmente.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">E-mail</label>
            <input
              name="email"
              type="email"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Nome *</label>
            <input
              name="nome"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Logradouro</label>
            <input
              name="logradouro"
              value={logradouro}
              onChange={(e) => setLogradouro(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Número</label>
            <input
              name="numero"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Bairro</label>
            <input
              name="bairro"
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Município</label>
            <input
              name="municipio"
              value={municipio}
              onChange={(e) => setMunicipio(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">UF</label>
            <input
              name="uf"
              maxLength={2}
              value={uf}
              onChange={(e) => setUf(e.target.value.toUpperCase())}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm uppercase"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">CEP</label>
            <input
              name="cep"
              value={cep}
              onChange={(e) => setCep(e.target.value)}
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
          {pending ? "Salvando..." : "Salvar cliente"}
        </button>
      </form>
    </div>
  );
}
