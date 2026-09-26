"use client";

import { useActionState, useState } from "react";
import {
  salvarEmpresaOnboarding,
  buscarDadosCnpjAction,
  type EmpresaOnboardingState,
  type BuscarCnpjState,
} from "./actions";

const initialState: EmpresaOnboardingState = {};
const initialCnpjState: BuscarCnpjState = {};

export function OnboardingEmpresaForm() {
  const [state, formAction, pending] = useActionState(
    salvarEmpresaOnboarding,
    initialState,
  );

  const [cnpj, setCnpj] = useState("");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [telefone, setTelefone] = useState("");
  const [celular, setCelular] = useState("");
  const [cep, setCep] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [uf, setUf] = useState("");
  const [municipioCodigoIbge, setMunicipioCodigoIbge] = useState("");
  const [regimeTributario, setRegimeTributario] = useState("");
  const [inscricaoMunicipal, setInscricaoMunicipal] = useState("");

  const [buscaState, setBuscaState] = useState<BuscarCnpjState>(initialCnpjState);
  const [buscando, setBuscando] = useState(false);

  async function handleBuscarCnpj() {
    setBuscando(true);
    setBuscaState(initialCnpjState);

    const formData = new FormData();
    formData.set("cnpj", cnpj);
    const resultado = await buscarDadosCnpjAction(initialCnpjState, formData);
    setBuscaState(resultado);
    setBuscando(false);

    if (resultado.dados) {
      const d = resultado.dados;
      setRazaoSocial(d.razaoSocial);
      setNomeFantasia(d.nomeFantasia ?? "");
      setLogradouro(d.logradouro ?? "");
      setNumero(d.numero ?? "");
      setBairro(d.bairro ?? "");
      setMunicipio(d.municipio ?? "");
      setCep(d.cep ?? "");
      setUf(d.uf ?? "");
      setMunicipioCodigoIbge(d.codigoMunicipioIbge ?? "");
      if (d.regimeTributarioSugerido) {
        setRegimeTributario(d.regimeTributarioSugerido);
      }
    }
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">CNPJ *</label>
        <div className="mt-1 flex gap-2">
          <input
            name="cnpj"
            required
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
            placeholder="00.000.000/0000-00"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={handleBuscarCnpj}
            disabled={buscando || !cnpj}
            className="whitespace-nowrap rounded-md border border-brand-tan bg-brand-cream px-4 py-2 text-sm font-medium text-brand-dark hover:bg-brand-cream disabled:opacity-50"
          >
            {buscando ? "Buscando..." : "Buscar dados"}
          </button>
        </div>
        {buscaState.error && (
          <p className="mt-1 text-sm text-red-600">{buscaState.error}</p>
        )}
        {buscaState.dados && (
          <p className="mt-1 text-sm text-green-600">
            Dados encontrados! Confira e complete abaixo.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Razão social *
          </label>
          <input
            name="razaoSocial"
            required
            value={razaoSocial}
            onChange={(e) => setRazaoSocial(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nome fantasia
          </label>
          <input
            name="nomeFantasia"
            value={nomeFantasia}
            onChange={(e) => setNomeFantasia(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Telefone</label>
          <input
            name="telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Celular</label>
          <input
            name="celular"
            value={celular}
            onChange={(e) => setCelular(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <hr className="border-gray-100" />
      <p className="text-sm font-medium text-gray-700">Endereço</p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">CEP *</label>
          <input
            name="cep"
            required
            value={cep}
            onChange={(e) => setCep(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Logradouro *
          </label>
          <input
            name="logradouro"
            required
            value={logradouro}
            onChange={(e) => setLogradouro(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Número *</label>
          <input
            name="numero"
            required
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Complemento
          </label>
          <input
            name="complemento"
            value={complemento}
            onChange={(e) => setComplemento(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Bairro *</label>
          <input
            name="bairro"
            required
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Cidade *
          </label>
          <input
            name="municipio"
            required
            value={municipio}
            onChange={(e) => setMunicipio(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Estado *</label>
          <input
            name="uf"
            required
            maxLength={2}
            value={uf}
            onChange={(e) => setUf(e.target.value.toUpperCase())}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm uppercase"
          />
        </div>

        <input type="hidden" name="municipioCodigoIbge" value={municipioCodigoIbge} />
      </div>

      <hr className="border-gray-100" />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Regime tributário *
          </label>
          <select
            name="regimeTributario"
            required
            value={regimeTributario}
            onChange={(e) => setRegimeTributario(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Selecione</option>
            <option value="MEI">MEI</option>
            <option value="SIMPLES_NACIONAL">Simples Nacional</option>
            <option value="LUCRO_PRESUMIDO">Lucro Presumido</option>
            <option value="LUCRO_REAL">Lucro Real</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Inscrição municipal
          </label>
          <input
            name="inscricaoMunicipal"
            value={inscricaoMunicipal}
            onChange={(e) => setInscricaoMunicipal(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {!municipioCodigoIbge && (
        <p className="text-xs text-gray-500">
          Use "Buscar dados" pra preencher o código IBGE do município automaticamente.
        </p>
      )}

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending || !municipioCodigoIbge}
          className="flex items-center gap-2 rounded-full bg-brand-dark px-6 py-2 text-sm font-medium text-white hover:bg-brand-brown disabled:opacity-50"
        >
          {pending ? "Salvando..." : "Avançar →"}
        </button>
      </div>
    </form>
  );
}
