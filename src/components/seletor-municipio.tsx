"use client";

import { useMemo, useState } from "react";
import { buscarMunicipio, buscarMunicipioPorCodigo, type Municipio } from "@/lib/municipios";

interface SeletorMunicipioProps {
  codigoIbge: string;
  municipioNome: string;
  uf: string;
  onSelecionar: (municipio: Municipio) => void;
}

/**
 * Busca o município oficial (tabela IBGE embutida, não depende de API
 * externa) e preenche nome/UF/código IBGE juntos - a única forma correta
 * de garantir que o código bate com o nome escolhido.
 */
export function SeletorMunicipio({
  codigoIbge,
  municipioNome,
  uf,
  onSelecionar,
}: SeletorMunicipioProps) {
  const [termo, setTermo] = useState("");
  const [aberto, setAberto] = useState(false);

  const resultados = useMemo(() => buscarMunicipio(termo), [termo]);
  const selecionado = useMemo(
    () => (codigoIbge ? buscarMunicipioPorCodigo(codigoIbge) : undefined),
    [codigoIbge],
  );

  const temSelecaoValida = selecionado && !aberto;

  return (
    <div className="relative">
      {temSelecaoValida ? (
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="mt-1 flex w-full items-center justify-between gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-sm"
        >
          <span className="text-gray-900">
            {selecionado.nome} / {selecionado.uf}
          </span>
          <span className="shrink-0 text-xs text-brand-brown">trocar</span>
        </button>
      ) : (
        <>
          <input
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            onFocus={() => setAberto(true)}
            placeholder={
              municipioNome ? `${municipioNome}${uf ? ` / ${uf}` : ""} (confirme o município)` : "Digite o nome do município"
            }
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          />
          {aberto && termo.trim() && (
            <div className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
              {resultados.length === 0 ? (
                <p className="px-3 py-2 text-sm text-gray-500">Nenhum município encontrado.</p>
              ) : (
                resultados.map((m) => (
                  <button
                    key={m.codigo}
                    type="button"
                    onClick={() => {
                      onSelecionar(m);
                      setTermo("");
                      setAberto(false);
                    }}
                    className="block w-full border-b border-gray-100 px-3 py-2 text-left text-sm last:border-0 hover:bg-brand-cream"
                  >
                    {m.nome} / {m.uf}
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
