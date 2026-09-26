"use client";

import { useState } from "react";
import { escolherPlano } from "./actions";
import type { Plano } from "@/lib/planos";

function formatarPreco(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function PlanoSelector({ planos }: { planos: Plano[] }) {
  const [ciclo, setCiclo] = useState<"mensal" | "anual">("mensal");

  return (
    <div>
      <div className="mb-8 flex items-center justify-center gap-3">
        <span
          className={`text-sm ${ciclo === "mensal" ? "font-semibold text-gray-900" : "text-gray-500"}`}
        >
          Mensal
        </span>
        <button
          type="button"
          onClick={() => setCiclo(ciclo === "mensal" ? "anual" : "mensal")}
          className="relative h-6 w-11 rounded-full bg-brand-dark transition-colors"
          aria-label="Alternar ciclo de cobrança"
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
              ciclo === "anual" ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
        <span
          className={`text-sm ${ciclo === "anual" ? "font-semibold text-gray-900" : "text-gray-500"}`}
        >
          Anual
        </span>
      </div>

      <div className="flex flex-wrap justify-center gap-6">
        {planos.map((plano) => (
          <div
            key={plano.id}
            className="w-full max-w-xs rounded-lg border border-brand-tan bg-white p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900">{plano.nome}</h2>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {formatarPreco(ciclo === "mensal" ? plano.precoMensal : plano.precoAnual)}
              <span className="text-sm font-normal text-gray-500">
                {ciclo === "mensal" ? "/mês" : "/ano"}
              </span>
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {plano.notasIncluidas} notas incluídas
            </p>

            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              {plano.destaques.map((destaque) => (
                <li key={destaque}>• {destaque}</li>
              ))}
            </ul>

            <form action={escolherPlano} className="mt-6">
              <input type="hidden" name="planoId" value={plano.id} />
              <input type="hidden" name="cicloCobranca" value={ciclo} />
              <button
                type="submit"
                className="w-full rounded-full bg-brand-dark px-4 py-2 text-sm font-medium text-white hover:bg-brand-brown"
              >
                Assinar
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
