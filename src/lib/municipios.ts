import dados from "./data/municipios-ibge.json";

export interface Municipio {
  codigo: string; // código IBGE de 7 dígitos
  nome: string;
  uf: string;
}

/**
 * Tabela oficial de municípios brasileiros (IBGE, servicodados.ibge.gov.br),
 * embutida no app para não depender de nenhuma API externa estar no ar na
 * hora do cadastro - diferente do autopreenchimento por CNPJ/CEP (que são
 * conveniências), encontrar o código IBGE do município é obrigatório pra
 * emitir nota, então não pode ficar refém de um serviço de terceiro.
 */
const MUNICIPIOS: Municipio[] = dados;

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/** Busca por nome (com ou sem acento) e, opcionalmente, filtra por UF. */
export function buscarMunicipio(termo: string, uf?: string, limite = 20): Municipio[] {
  const termoNormalizado = normalizar(termo.trim());
  if (!termoNormalizado) return [];

  const candidatos = uf
    ? MUNICIPIOS.filter((m) => m.uf === uf.toUpperCase())
    : MUNICIPIOS;

  return candidatos
    .filter((m) => normalizar(m.nome).includes(termoNormalizado))
    .slice(0, limite);
}

export function buscarMunicipioPorCodigo(codigo: string): Municipio | undefined {
  return MUNICIPIOS.find((m) => m.codigo === codigo);
}
