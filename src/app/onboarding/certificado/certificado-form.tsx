"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { enviarCertificadoDigital, type CertificadoState } from "@/app/dashboard/empresa/actions";

const initialState: CertificadoState = {};

export function CertificadoOnboardingForm({ jaConfigurado }: { jaConfigurado: boolean }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(enviarCertificadoDigital, initialState);

  useEffect(() => {
    if (state.success) {
      router.push("/onboarding/plano");
    }
  }, [state.success, router]);

  return (
    <div className="mx-auto max-w-md">
      <form action={formAction} className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Arquivo do certificado (.pfx ou .p12)
          </label>
          <input
            type="file"
            name="certificado"
            accept=".pfx,.p12"
            className="mt-1 w-full text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Senha do certificado</label>
          <input
            type="password"
            name="senha"
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        {jaConfigurado && !state.error && (
          <p className="text-sm text-green-600">Você já tem um certificado configurado.</p>
        )}

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/onboarding/plano")}
            className="text-sm font-medium text-gray-500 hover:underline"
          >
            Pular por enquanto
          </button>
          <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-2 rounded-full btn-gradient px-6 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {pending ? "Enviando..." : "Enviar e continuar →"}
          </button>
        </div>
      </form>
    </div>
  );
}
