"use client";

import { useState } from "react";
import Link from "next/link";
import { escolherPlano } from "./actions";
import type { Plano } from "@/lib/planos";

function formatarPreco(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function PlanoSelector({ planos }: { planos: Plano[] }) {
  const [ciclo, setCiclo] = useState<"mensal" | "anual">("mensal");

  const referencia = planos[0];
  const economiaPercentual = referencia
    ? Math.round(
        (1 - referencia.precoAnual / (referencia.precoMensal * 12)) * 100,
      )
    : 0;

  return (
    <div>
      <div className="mb-8 flex justify-center">
        <div className="inline-flex items-center rounded-full bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setCiclo("mensal")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              ciclo === "mensal"
                ? "bg-white text-brand-dark shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Mensal
          </button>
          <button
            type="button"
            onClick={() => setCiclo("anual")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              ciclo === "anual"
                ? "bg-white text-brand-dark shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Anual
            {economiaPercentual > 0 && (
              <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">
                -{economiaPercentual}%
              </span>
            )}
          </button>
        </div>
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

      <div className="mt-8 flex justify-center">
        <Link
          href="/onboarding/empresa"
          className="text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          ← Voltar
        </Link>
      </div>
    </div>
  );
}
