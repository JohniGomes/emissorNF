export interface DadosCep {
  logradouro: string | null;
  bairro: string | null;
  municipio: string | null;
  uf: string | null;
  codigoMunicipioIbge: string | null;
}

/** Busca dados públicos de endereço a partir do CEP via BrasilAPI (gratuita, sem autenticação). */
export async function buscarDadosCep(cep: string): Promise<DadosCep> {
  const cepLimpo = cep.replace(/\D/g, "");

  if (cepLimpo.length !== 8) {
    throw new Error("CEP inválido.");
  }

  const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cepLimpo}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; EmissorNFs/1.0)",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      response.status === 404 ? "CEP não encontrado." : "Não foi possível consultar o CEP agora.",
    );
  }

  const data = await response.json();

  return {
    logradouro: data.street || null,
    bairro: data.neighborhood || null,
    municipio: data.city || null,
    uf: data.state || null,
    codigoMunicipioIbge: data.location?.coordinates?.ibge_city_code
      ? String(data.location.coordinates.ibge_city_code)
      : null,
  };
}
