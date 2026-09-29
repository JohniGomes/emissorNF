"use client";

import { useMemo, useState } from "react";
import {
  buscarCodigoTributacaoNacional,
  type CodigoTributacaoNacional,
} from "@/lib/codigoTributacaoNacional";

interface SeletorCodigoTributacaoProps {
  /** Código já selecionado (formato sem pontos, ex: "170101"). */
  value: string;
  onChange: (codigo: string) => void;
  /** "nacional" mostra 170101, "lc116" mostra 17.01.01 — mesma tabela, formatos diferentes. */
  formato?: "nacional" | "lc116";
  placeholder?: string;
}

export function SeletorCodigoTributacao({
  value,
  onChange,
  formato = "nacional",
  placeholder,
}: SeletorCodigoTributacaoProps) {
  const [termo, setTermo] = useState("");
  const [aberto, setAberto] = useState(false);

  const resultados = useMemo(() => buscarCodigoTributacaoNacional(termo), [termo]);

  const selecionado = useMemo(() => {
    if (!value) return null;
    return buscarCodigoTributacaoNacional(value, 1)[0] ?? null;
  }, [value]);

  function exibirCodigo(item: CodigoTributacaoNacional) {
    return formato === "lc116" ? item.codigoFormatado : item.codigo;
  }

  function handleSelecionar(item: CodigoTributacaoNacional) {
    onChange(item.codigo);
    setTermo("");
    setAberto(false);
  }

  return (
    <div className="relative">
      {selecionado && !aberto ? (
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="mt-1 flex w-full items-start justify-between gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-sm"
        >
          <span>
            <span className="font-medium text-gray-900">{exibirCodigo(selecionado)}</span>{" "}
            <span className="text-gray-600">— {selecionado.descricao}</span>
          </span>
          <span className="shrink-0 text-xs text-brand-brown">trocar</span>
        </button>
      ) : (
        <>
          <input
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            onFocus={() => setAberto(true)}
            placeholder={placeholder ?? "Digite o código (ex: 17 ou 1701) ou parte da descrição"}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          />
          {aberto && termo.trim() && (
            <div className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
              {resultados.length === 0 ? (
                <p className="px-3 py-2 text-sm text-gray-500">Nenhum código encontrado.</p>
              ) : (
                resultados.map((item) => (
                  <button
                    key={item.codigo}
                    type="button"
                    onClick={() => handleSelecionar(item)}
                    className="block w-full border-b border-gray-100 px-3 py-2 text-left text-sm last:border-0 hover:bg-brand-cream"
                  >
                    <span className="font-medium text-gray-900">{exibirCodigo(item)}</span>{" "}
                    <span className="text-gray-600">— {item.descricao}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
