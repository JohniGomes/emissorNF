export interface DadosCnpj {
  razaoSocial: string;
  nomeFantasia: string | null;
  logradouro: string | null;
  numero: string | null;
  bairro: string | null;
  municipio: string | null;
  uf: string | null;
  cep: string | null;
  codigoMunicipioIbge: string | null;
  regimeTributarioSugerido: "MEI" | "SIMPLES_NACIONAL" | null;
}

/** Busca dados públicos de uma empresa a partir do CNPJ via BrasilAPI (gratuita, sem autenticação). */
export async function buscarDadosCnpj(cnpj: string): Promise<DadosCnpj> {
  const cnpjLimpo = cnpj.replace(/\D/g, "");

  if (cnpjLimpo.length !== 14) {
    throw new Error("CNPJ inválido.");
  }

  const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; EmissorNFs/1.0)",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      response.status === 404 ? "CNPJ não encontrado." : "Não foi possível consultar o CNPJ agora.",
    );
  }

  const data = await response.json();

  return {
    razaoSocial: data.razao_social,
    nomeFantasia: data.nome_fantasia || null,
    logradouro: data.logradouro || null,
    numero: data.numero || null,
    bairro: data.bairro || null,
    municipio: data.municipio || null,
    uf: data.uf || null,
    cep: data.cep ? String(data.cep) : null,
    codigoMunicipioIbge: data.codigo_municipio_ibge ? String(data.codigo_municipio_ibge) : null,
    regimeTributarioSugerido: data.opcao_pelo_mei
      ? "MEI"
      : data.opcao_pelo_simples
        ? "SIMPLES_NACIONAL"
        : null,
  };
}
