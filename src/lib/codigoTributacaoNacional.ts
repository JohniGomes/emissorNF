import dados from "./data/codigo-tributacao-nacional.json";

/**
 * Tabela nacional de códigos de tributação (cTribNac), usada tanto no campo
 * "Código de tributação nacional do ISS" (NFS-e Nacional/DPS, obrigatório
 * para MEI) quanto no "Item da lista de serviços" da NFS-e clássica - é a
 * mesma tabela oficial (Anexo do emissor nacional gov.br/nfse, derivada da
 * lista de serviços da LC 116/2003), só muda o formato do código.
 *
 * Fonte: github.com/transformax2205-droid/codigo-tributacao-nacional-nfse
 * (CC BY 4.0 - dados públicos do gov.br/nfse e da LC 116/2003).
 */
export interface CodigoTributacaoNacional {
  codigo: string; // ex: "170101"
  codigoFormatado: string; // ex: "17.01.01"
  descricao: string;
}

export const CODIGOS_TRIBUTACAO_NACIONAL: CodigoTributacaoNacional[] = dados;

/** Filtra por prefixo do código (com ou sem pontos) ou por trecho da descrição. */
export function buscarCodigoTributacaoNacional(
  termo: string,
  limite = 20,
): CodigoTributacaoNacional[] {
  const termoLimpo = termo.trim().toLowerCase();
  if (!termoLimpo) return [];

  const termoComoCodigo = termoLimpo.replace(/\D/g, "");

  const resultados = CODIGOS_TRIBUTACAO_NACIONAL.filter((item) => {
    if (termoComoCodigo && item.codigo.startsWith(termoComoCodigo)) return true;
    return item.descricao.toLowerCase().includes(termoLimpo);
  });

  return resultados.slice(0, limite);
}
