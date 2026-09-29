"use client";

import { useState } from "react";

interface DetalhesFiscaisProps {
  respostaApi: unknown;
}

/** Achata um objeto JSON em pares "chave.aninhada": valor, um nível de profundidade. */
function achatar(obj: Record<string, unknown>, prefixo = ""): Array<[string, string]> {
  const pares: Array<[string, string]> = [];
  for (const [chave, valor] of Object.entries(obj)) {
    const chaveCompleta = prefixo ? `${prefixo}.${chave}` : chave;
    if (valor === null || valor === undefined || valor === "") continue;
    if (typeof valor === "object" && !Array.isArray(valor)) {
      pares.push(...achatar(valor as Record<string, unknown>, chaveCompleta));
    } else if (Array.isArray(valor)) {
      if (valor.length === 0) continue;
      pares.push([chaveCompleta, JSON.stringify(valor)]);
    } else {
      pares.push([chaveCompleta, String(valor)]);
    }
  }
  return pares;
}

// Campos técnicos que não interessam ao usuário final nesta seção - ele já
// vê status/número/link em outro lugar da tela.
const CAMPOS_OCULTOS = new Set([
  "status",
  "numero",
  "codigo_verificacao",
  "url",
  "erros",
  "cnpj_prestador",
  "ref",
]);

export function DetalhesFiscais({ respostaApi }: DetalhesFiscaisProps) {
  const [aberto, setAberto] = useState(false);

  if (!respostaApi || typeof respostaApi !== "object") return null;

  const pares = achatar(respostaApi as Record<string, unknown>).filter(
    ([chave]) => !CAMPOS_OCULTOS.has(chave.split(".").pop() ?? chave),
  );

  if (pares.length === 0) return null;

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="text-xs font-medium text-brand-brown hover:underline"
      >
        {aberto ? "▾" : "▸"} Detalhes fiscais
      </button>
      {aberto && (
        <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 rounded-md border border-gray-200 bg-gray-50 p-3 text-xs sm:grid-cols-2">
          {pares.map(([chave, valor]) => (
            <div key={chave} className="flex justify-between gap-2">
              <dt className="text-gray-500">{chave}</dt>
              <dd className="text-right font-medium text-gray-900">{valor}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
