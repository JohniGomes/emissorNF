"use client";

import { useActionState } from "react";
import { salvarEmpresa, type EmpresaState } from "./actions";

interface EmpresaFormProps {
  defaultValues?: {
    razaoSocial: string;
    nomeFantasia: string | null;
    cnpj: string;
    inscricaoMunicipal: string;
    regimeTributario: string;
    municipioCodigoIbge: string;
    uf: string;
    focusNfeAmbiente: string;
    temToken: boolean;
  };
}

const initialState: EmpresaState = {};

export function EmpresaForm({ defaultValues }: EmpresaFormProps) {
  const [state, formAction, pending] = useActionState(salvarEmpresa, initialState);

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Razão social *</label>
          <input
            name="razaoSocial"
            required
            defaultValue={defaultValues?.razaoSocial}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Nome fantasia</label>
          <input
            name="nomeFantasia"
            defaultValue={defaultValues?.nomeFantasia ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">CNPJ *</label>
          <input
            name="cnpj"
            required
            defaultValue={defaultValues?.cnpj}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Inscrição municipal *
          </label>
          <input
            name="inscricaoMunicipal"
            required
            defaultValue={defaultValues?.inscricaoMunicipal}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Regime tributário *
          </label>
          <select
            name="regimeTributario"
            required
            defaultValue={defaultValues?.regimeTributario}
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
          <label className="block text-sm font-medium text-gray-700">UF *</label>
          <input
            name="uf"
            required
            maxLength={2}
            defaultValue={defaultValues?.uf}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm uppercase"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Código IBGE do município *
          </label>
          <input
            name="municipioCodigoIbge"
            required
            defaultValue={defaultValues?.municipioCodigoIbge}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">
            Consulte em{" "}
            <a
              href="https://www.ibge.gov.br/explica/codigos-dos-municipios.php"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline"
            >
              ibge.gov.br
            </a>
          </p>
        </div>
      </div>

      <hr className="border-gray-200" />

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Token Focus NFe {defaultValues?.temToken && "(já configurado — deixe em branco para manter)"}
        </label>
        <input
          name="focusNfeToken"
          type="password"
          placeholder={defaultValues?.temToken ? "••••••••" : ""}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">
          Gerado no painel da{" "}
          <a
            href="https://focusnfe.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:underline"
          >
            Focus NFe
          </a>{" "}
          para esta empresa (use o token de homologação/sandbox por enquanto).
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Ambiente Focus NFe</label>
        <select
          name="focusNfeAmbiente"
          defaultValue={defaultValues?.focusNfeAmbiente ?? "sandbox"}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="sandbox">Sandbox (homologação)</option>
          <option value="producao">Produção</option>
        </select>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-green-600">Empresa salva com sucesso.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {pending ? "Salvando..." : "Salvar empresa"}
      </button>
    </form>
  );
}
