import correlacao from "./data/correlacao-lc116-nbs.json";

export interface CorrelacaoNbs {
  nbs: string;
  descricao: string;
}

/**
 * Correlação oficial entre item da lista de serviços (LC 116/2003) e código
 * NBS, extraída do Anexo VIII do emissor nacional (gov.br/nfse) - mesma
 * fonte usada pelo layout da Reforma Tributária. Nem todo item tem NBS
 * mapeado (a tabela cobre 200 dos ~340 subitens); quando não houver
 * correspondência, o usuário informa manualmente.
 */
const CORRELACAO_LC116_NBS: Record<string, CorrelacaoNbs[]> = correlacao;

/** item no formato "1701" (item.subitem sem ponto, 4 dígitos). */
export function buscarNbsPorItem(item: string): CorrelacaoNbs[] {
  return CORRELACAO_LC116_NBS[item] ?? [];
}
