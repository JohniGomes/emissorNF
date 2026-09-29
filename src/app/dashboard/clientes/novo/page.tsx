"use client";

import { useActionState, useState } from "react";
import {
  criarCliente,
  buscarCnpjClienteAction,
  buscarCepClienteAction,
  type ClienteState,
  type BuscarCnpjClienteState,
  type BuscarCepClienteState,
} from "../actions";

const initialState: ClienteState = {};
const initialBuscaCnpjState: BuscarCnpjClienteState = {};
const initialBuscaCepState: BuscarCepClienteState = {};

export default function NovoClientePage() {
  const [state, formAction, pending] = useActionState(criarCliente, initialState);

  const [documento, setDocumento] = useState("");
  const [nome, setNome] = useState("");
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [municipioCodigoIbge, setMunicipioCodigoIbge] = useState("");
  const [uf, setUf] = useState("");
  const [cep, setCep] = useState("");
  const [mostrarFiscalAvancado, setMostrarFiscalAvancado] = useState(false);

  const [buscaCnpjState, setBuscaCnpjState] = useState<BuscarCnpjClienteState>(
    initialBuscaCnpjState,
  );
  const [buscandoCnpj, setBuscandoCnpj] = useState(false);
  const [buscaCepState, setBuscaCepState] = useState<BuscarCepClienteState>(
    initialBuscaCepState,
  );
  const [buscandoCep, setBuscandoCep] = useState(false);

  const somenteDigitos = documento.replace(/\D/g, "");
  const pareceCnpj = somenteDigitos.length === 14;
  const pareceCpf = somenteDigitos.length === 11;
  const tipoPessoa = pareceCnpj ? "Pessoa Jurídica" : pareceCpf ? "Pessoa Física" : null;

  async function handleBuscarCnpj() {
    setBuscandoCnpj(true);
    setBuscaCnpjState(initialBuscaCnpjState);

    const formData = new FormData();
    formData.set("documento", documento);
    const resultado = await buscarCnpjClienteAction(initialBuscaCnpjState, formData);
    setBuscaCnpjState(resultado);
    setBuscandoCnpj(false);

    if (resultado.dados) {
      const d = resultado.dados;
      setNome(d.razaoSocial);
      setNomeFantasia(d.nomeFantasia ?? "");
      setLogradouro(d.logradouro ?? "");
      setNumero(d.numero ?? "");
      setBairro(d.bairro ?? "");
      setMunicipio(d.municipio ?? "");
      setUf(d.uf ?? "");
      setCep(d.cep ?? "");
      setMunicipioCodigoIbge(d.codigoMunicipioIbge ?? "");
    }
  }

  async function handleBuscarCep() {
    setBuscandoCep(true);
    setBuscaCepState(initialBuscaCepState);

    const formData = new FormData();
    formData.set("cep", cep);
    const resultado = await buscarCepClienteAction(initialBuscaCepState, formData);
    setBuscaCepState(resultado);
    setBuscandoCep(false);

    if (resultado.dados) {
      const d = resultado.dados;
      setLogradouro(d.logradouro ?? "");
      setBairro(d.bairro ?? "");
      setMunicipio(d.municipio ?? "");
      setUf(d.uf ?? "");
      if (d.codigoMunicipioIbge) setMunicipioCodigoIbge(d.codigoMunicipioIbge);
    }
  }

  const cepSomenteDigitos = cep.replace(/\D/g, "");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Novo cliente</h1>

      <form action={formAction} className="max-w-xl space-y-4">
        <input type="hidden" name="municipioCodigoIbge" value={municipioCodigoIbge} />

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
                  disabled={buscandoCnpj}
                  className="whitespace-nowrap rounded-md border border-brand-tan bg-brand-cream px-3 py-2 text-sm font-medium text-brand-dark hover:bg-brand-cream disabled:opacity-50"
                >
                  {buscandoCnpj ? "Buscando..." : "Buscar dados"}
                </button>
              )}
            </div>
            {tipoPessoa && (
              <p className="mt-1 text-xs font-medium text-gray-500">{tipoPessoa}</p>
            )}
            {buscaCnpjState.error && (
              <p className="mt-1 text-sm text-red-600">{buscaCnpjState.error}</p>
            )}
            {buscaCnpjState.dados && (
              <p className="mt-1 text-sm text-green-600">
                Dados encontrados! Confira e complete abaixo.
              </p>
            )}
            {pareceCpf && (
              <p className="mt-1 text-xs text-gray-500">
                Não é possível autopreencher dados a partir de CPF. Preencha manualmente.
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
            <label className="block text-sm font-medium text-gray-700">Nome/Razão social *</label>
            <input
              name="nome"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            />
          </div>

          {pareceCnpj && (
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Nome fantasia</label>
              <input
                name="nomeFantasia"
                value={nomeFantasia}
                onChange={(e) => setNomeFantasia(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Telefone</label>
            <input
              name="telefone"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
            <input
              name="whatsapp"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">CEP</label>
            <div className="mt-1 flex gap-2">
              <input
                name="cep"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              />
              {cepSomenteDigitos.length === 8 && (
                <button
                  type="button"
                  onClick={handleBuscarCep}
                  disabled={buscandoCep}
                  className="whitespace-nowrap rounded-md border border-brand-tan bg-brand-cream px-3 py-2 text-sm font-medium text-brand-dark hover:bg-brand-cream disabled:opacity-50"
                >
                  {buscandoCep ? "Buscando..." : "Buscar"}
                </button>
              )}
            </div>
            {buscaCepState.error && (
              <p className="mt-1 text-sm text-red-600">{buscaCepState.error}</p>
            )}
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
            <label className="block text-sm font-medium text-gray-700">Complemento</label>
            <input
              name="complemento"
              value={complemento}
              onChange={(e) => setComplemento(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Bairro</label>
            <input
              name="bairro"
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Município</label>
            <input
              name="municipio"
              value={municipio}
              onChange={(e) => setMunicipio(e.target.value)}
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
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Inscrição Estadual
                </label>
                <input
                  name="inscricaoEstadual"
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
          {pending ? "Salvando..." : "Salvar cliente"}
        </button>
      </form>
    </div>
  );
}
