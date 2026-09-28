"use client";

import { useActionState } from "react";
import { enviarCertificadoDigital, type CertificadoState } from "./actions";

const initialState: CertificadoState = {};

interface CertificadoDigitalFormProps {
  regimeTributario: string;
  jaConfigurado: boolean;
}

export function CertificadoDigitalForm({
  regimeTributario,
  jaConfigurado,
}: CertificadoDigitalFormProps) {
  const [state, formAction, pending] = useActionState(
    enviarCertificadoDigital,
    initialState,
  );

  const ehMei = regimeTributario === "MEI";

  return (
    <div className="mt-8 max-w-xl rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-gray-900">Certificado digital</h2>

      {ehMei ? (
        <p className="mt-2 text-sm text-gray-500">
          Empresas MEI emitem pela NFS-e Nacional e não precisam de certificado
          digital A1 aqui — esse envio é só para os demais regimes tributários.
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm text-gray-500">
            Alguns municípios exigem um certificado digital A1 (.pfx/.p12) para
            autorizar a emissão de notas.{" "}
            {jaConfigurado
              ? "Já existe um certificado configurado — enviar um novo substitui o atual."
              : "Envie o seu abaixo se a prefeitura da sua empresa exigir."}
          </p>

          <form action={formAction} className="mt-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Arquivo do certificado (.pfx ou .p12) *
              </label>
              <input
                type="file"
                name="certificado"
                accept=".pfx,.p12"
                required
                className="mt-1 w-full text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Senha do certificado *
              </label>
              <input
                type="password"
                name="senha"
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            {state.error && <p className="text-sm text-red-600">{state.error}</p>}
            {state.success && (
              <p className="text-sm text-green-600">Certificado enviado com sucesso.</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {pending ? "Enviando..." : jaConfigurado ? "Substituir certificado" : "Adicionar certificado digital"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
