"use client";

import { useState } from "react";
import Link from "next/link";
import { confirmarPagamento } from "./actions";

interface PagamentoFormProps {
  ciclo: "mensal" | "anual";
}

export function PagamentoForm({ ciclo }: PagamentoFormProps) {
  const [metodo, setMetodo] = useState<"cartao" | "pix">("cartao");
  const [pending, setPending] = useState(false);

  return (
    <form
      action={async () => {
        setPending(true);
        await confirmarPagamento();
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <label className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm">
          <input
            type="radio"
            name="metodo"
            checked={metodo === "cartao"}
            onChange={() => setMetodo("cartao")}
          />
          Cartão de crédito
        </label>

        {ciclo === "anual" && (
          <label className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm">
            <input
              type="radio"
              name="metodo"
              checked={metodo === "pix"}
              onChange={() => setMetodo("pix")}
            />
            Pix
          </label>
        )}
      </div>

      {metodo === "cartao" ? (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Número do cartão
            </label>
            <input
              required
              placeholder="0000 0000 0000 0000"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nome do titular
            </label>
            <input
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Validade
              </label>
              <input
                required
                placeholder="MM/AAAA"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Código de segurança
              </label>
              <input
                required
                placeholder="CVV"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      ) : (
        <p className="rounded-md bg-brand-cream px-3 py-4 text-sm text-brand-dark">
          Ao confirmar, você receberá o QR Code / código Pix para pagamento.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full btn-gradient px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Confirmando..." : "Confirmar pagamento"}
      </button>

      <div className="flex justify-center">
        <Link
          href="/onboarding/plano"
          className="text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          ← Voltar
        </Link>
      </div>
    </form>
  );
}
