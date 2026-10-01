/** Parser simples de CSV (RFC 4180): lida com vírgula ou ponto-e-vírgula, aspas e aspas escapadas (""). */
export function parseCsv(texto: string): { headers: string[]; linhas: string[][] } {
  const linhasBrutas = texto
    .replace(/^﻿/, "") // remove BOM do Excel
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((l) => l.trim() !== "");

  if (linhasBrutas.length === 0) return { headers: [], linhas: [] };

  // Detecta o separador uma vez, pela primeira linha (cabeçalho) - relatórios
  // em pt-BR (Excel) costumam usar ; em vez de ,.
  const primeiraLinha = linhasBrutas[0];
  const delimitador = (primeiraLinha.match(/;/g)?.length ?? 0) > (primeiraLinha.match(/,/g)?.length ?? 0) ? ";" : ",";

  function parseLinha(linha: string): string[] {
    const campos: string[] = [];
    let atual = "";
    let dentroDeAspas = false;

    for (let i = 0; i < linha.length; i++) {
      const char = linha[i];

      if (dentroDeAspas) {
        if (char === '"') {
          if (linha[i + 1] === '"') {
            atual += '"';
            i++;
          } else {
            dentroDeAspas = false;
          }
        } else {
          atual += char;
        }
      } else if (char === '"') {
        dentroDeAspas = true;
      } else if (char === delimitador) {
        campos.push(atual.trim());
        atual = "";
      } else {
        atual += char;
      }
    }
    campos.push(atual.trim());
    return campos;
  }

  const [headers, ...linhas] = linhasBrutas.map(parseLinha);
  return { headers, linhas };
}
