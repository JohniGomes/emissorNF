"use client";

import { useActionState, useState } from "react";
import {
  salvarEmpresaOnboarding,
  buscarDadosCnpjAction,
  type EmpresaOnboardingState,
  type BuscarCnpjState,
} from "./actions";
import { formatarCep, formatarCpfCnpj } from "@/lib/formatters";
import { SeletorMunicipio } from "@/components/seletor-municipio";

export interface OnboardingEmpresaDefaultValues {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  telefone: string | null;
  celular: string | null;
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  municipio: string | null;
  uf: string;
  municipioCodigoIbge: string;
  regimeTributario: string | null;
  inscricaoMunicipal: string | null;
}

interface OnboardingEmpresaFormProps {
  defaultValues?: OnboardingEmpresaDefaultValues;
}

const initialState: EmpresaOnboardingState = {};
const initialCnpjState: BuscarCnpjState = {};

export function OnboardingEmpresaForm({ defaultValues }: OnboardingEmpresaFormProps) {
  const [state, formAction, pending] = useActionState(
    salvarEmpresaOnboarding,
    initialState,
  );

  const jaExiste = !!defaultValues;

  const [cnpj, setCnpj] = useState(
    defaultValues?.cnpj ? formatarCpfCnpj(defaultValues.cnpj) : "",
  );
  const [razaoSocial, setRazaoSocial] = useState(defaultValues?.razaoSocial ?? "");
  const [nomeFantasia, setNomeFantasia] = useState(defaultValues?.nomeFantasia ?? "");
  const [telefone, setTelefone] = useState(defaultValues?.telefone ?? "");
  const [celular, setCelular] = useState(defaultValues?.celular ?? "");
  const [cep, setCep] = useState(defaultValues?.cep ? formatarCep(defaultValues.cep) : "");
  const [logradouro, setLogradouro] = useState(defaultValues?.logradouro ?? "");
  const [numero, setNumero] = useState(defaultValues?.numero ?? "");
  const [complemento, setComplemento] = useState(defaultValues?.complemento ?? "");
  const [bairro, setBairro] = useState(defaultValues?.bairro ?? "");
  const [municipio, setMunicipio] = useState(defaultValues?.municipio ?? "");
  const [uf, setUf] = useState(defaultValues?.uf ?? "");
  const [municipioCodigoIbge, setMunicipioCodigoIbge] = useState(
    defaultValues?.municipioCodigoIbge ?? "",
  );
  // Nunca mostrados nesta tela - inferidos pelo CNPJ (regime) ou preenchidos
  // depois em "Sua empresa" quando não for possível identificar automaticamente.
  const [regimeTributario, setRegimeTributario] = useState(
    defaultValues?.regimeTributario ?? "",
  );
  const [inscricaoMunicipal] = useState(defaultValues?.inscricaoMunicipal ?? "");

  const [buscaState, setBuscaState] = useState<BuscarCnpjState>(initialCnpjState);
  const [buscando, setBuscando] = useState(false);

  async function handleBuscarCnpj() {
    const digitos = cnpj.replace(/\D/g, "");
    if (digitos.length !== 14 || jaExiste) return;

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
      // Nome fantasia fica de fora de propósito - o usuário escolhe o dele.
      setLogradouro(d.logradouro ?? "");
      setNumero(d.numero ?? "");
      setBairro(d.bairro ?? "");
      setMunicipio(d.municipio ?? "");
      setCep(d.cep ? formatarCep(d.cep) : "");
      setUf(d.uf ?? "");
      setMunicipioCodigoIbge(d.codigoMunicipioIbge ?? "");
      if (d.regimeTributarioSugerido) {
        setRegimeTributario(d.regimeTributarioSugerido);
      }
    }
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="regimeTributario" value={regimeTributario} />
      <input type="hidden" name="inscricaoMunicipal" value={inscricaoMunicipal} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">CNPJ *</label>
          <input
            name="cnpj"
            required
            readOnly={jaExiste}
            value={cnpj}
            onChange={(e) => setCnpj(formatarCpfCnpj(e.target.value))}
            onBlur={handleBuscarCnpj}
            placeholder="00.000.000/0000-00"
            className={`mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ${jaExiste ? "bg-gray-100" : ""}`}
          />
          {buscando && <p className="mt-1 text-xs text-gray-500">Buscando dados do CNPJ...</p>}
          {buscaState.error && (
            <p className="mt-1 text-xs text-red-600">
              {buscaState.error} Preencha os campos manualmente.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Razão Social *</label>
          <input
            name="razaoSocial"
            required
            value={razaoSocial}
            onChange={(e) => setRazaoSocial(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Nome fantasia *</label>
          <input
            name="nomeFantasia"
            required
            value={nomeFantasia}
            onChange={(e) => setNomeFantasia(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Telefone</label>
          <input
            name="telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Celular</label>
          <input
            name="celular"
            value={celular}
            onChange={(e) => setCelular(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
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
            onChange={(e) => setCep(formatarCep(e.target.value))}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Logradouro *</label>
          <input
            name="logradouro"
            required
            value={logradouro}
            onChange={(e) => setLogradouro(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Número *</label>
          <input
            name="numero"
            required
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

        <div>
          <label className="block text-sm font-medium text-gray-700">Bairro *</label>
          <input
            name="bairro"
            required
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Cidade/Estado *</label>
          <input type="hidden" name="municipio" value={municipio} />
          <input type="hidden" name="uf" value={uf} />
          <input type="hidden" name="municipioCodigoIbge" value={municipioCodigoIbge} />
          <SeletorMunicipio
            codigoIbge={municipioCodigoIbge}
            municipioNome={municipio}
            uf={uf}
            onSelecionar={(m) => {
              setMunicipio(m.nome);
              setUf(m.uf);
              setMunicipioCodigoIbge(m.codigo);
            }}
          />
        </div>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending || !municipioCodigoIbge}
          className="flex items-center gap-2 rounded-full btn-gradient px-6 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Salvando..." : "Avançar →"}
        </button>
      </div>
    </form>
  );
}
