/**
 * Client da API Focus NFe (https://focusnfe.com.br).
 * Isola toda comunicação externa com o provedor fiscal nesta camada,
 * para permitir troca de provedor no futuro sem afetar o resto do app.
 */

const FOCUS_NFE_BASE_URL = {
  sandbox: "https://homologacao.focusnfe.com.br",
  producao: "https://api.focusnfe.com.br",
} as const;

type FocusNfeAmbiente = keyof typeof FOCUS_NFE_BASE_URL;

function getBaseUrl(ambiente: FocusNfeAmbiente = "sandbox") {
  return FOCUS_NFE_BASE_URL[ambiente];
}

function authHeader(token: string) {
  // Focus NFe usa HTTP Basic Auth com o token da empresa como usuário e senha vazia.
  const credentials = Buffer.from(`${token}:`).toString("base64");
  return `Basic ${credentials}`;
}

export interface EmitirNfsePayload {
  data_emissao: string; // ISO date
  prestador: {
    cnpj: string;
    inscricao_municipal?: string;
  };
  tomador: {
    cnpj_cpf: string;
    razao_social: string;
    email?: string;
    endereco?: {
      logradouro?: string;
      numero?: string;
      bairro?: string;
      codigo_municipio?: string;
      uf?: string;
      cep?: string;
    };
  };
  servico: {
    discriminacao: string;
    valor_servicos: number;
  };
}

const REGIME_TRIBUTARIO_FOCUS: Record<string, number> = {
  SIMPLES_NACIONAL: 1,
  LUCRO_PRESUMIDO: 3,
  LUCRO_REAL: 3,
  MEI: 4,
};

export interface CriarEmpresaFocusNfeParams {
  razaoSocial: string;
  nomeFantasia?: string | null;
  cnpj: string;
  inscricaoMunicipal?: string | null;
  regimeTributario: string;
  logradouro?: string | null;
  numero?: string | null;
  bairro?: string | null;
  municipio?: string | null;
  uf: string;
  cep?: string | null;
  email?: string | null;
}

export interface CriarEmpresaFocusNfeResponse {
  id: number;
  token_producao: string;
  token_homologacao: string;
  [key: string]: unknown;
}

/**
 * Cria uma empresa na Focus NFe via API de gestão de conta (usa o token
 * principal da plataforma, não o token de uma empresa). Sempre chamada contra
 * o host de produção — é assim que a Focus documenta o endpoint de gestão,
 * independente do ambiente em que a empresa criada vai emitir notas.
 */
export async function criarEmpresaFocusNfe(
  masterToken: string,
  dados: CriarEmpresaFocusNfeParams,
): Promise<CriarEmpresaFocusNfeResponse> {
  const numeroLimpo = dados.numero?.replace(/\D/g, "");
  const cepLimpo = dados.cep?.replace(/\D/g, "");
  const inscricaoMunicipalLimpa = dados.inscricaoMunicipal?.replace(/\D/g, "");

  const body = {
    nome: dados.razaoSocial,
    nome_fantasia: dados.nomeFantasia || undefined,
    cnpj: dados.cnpj.replace(/\D/g, ""),
    inscricao_municipal: inscricaoMunicipalLimpa
      ? Number(inscricaoMunicipalLimpa)
      : undefined,
    regime_tributario: REGIME_TRIBUTARIO_FOCUS[dados.regimeTributario],
    logradouro: dados.logradouro || undefined,
    numero: numeroLimpo ? Number(numeroLimpo) : undefined,
    bairro: dados.bairro || undefined,
    municipio: dados.municipio || undefined,
    uf: dados.uf,
    cep: cepLimpo ? Number(cepLimpo) : undefined,
    email: dados.email || undefined,
    // MEI é obrigado pela Focus NFe a usar o padrão NFS-e Nacional; os demais
    // regimes usam a NFS-e clássica (municipal).
    ...(dados.regimeTributario === "MEI"
      ? { habilita_nfsen_homologacao: true }
      : { habilita_nfse: true }),
  };

  const response = await fetch(`${FOCUS_NFE_BASE_URL.producao}/v2/empresas`, {
    method: "POST",
    headers: {
      Authorization: authHeader(masterToken),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    const mensagem =
      data?.erros?.map((e: { mensagem: string }) => e.mensagem).join("; ") ||
      data?.mensagem ||
      "Erro ao cadastrar empresa na Focus NFe.";
    throw new Error(mensagem);
  }

  return data;
}

export interface FocusNfeResponse {
  status: string;
  numero?: string;
  codigo_verificacao?: string;
  url?: string;
  erros?: Array<{ codigo: string; mensagem: string }>;
  [key: string]: unknown;
}

interface FocusNfeClientOptions {
  token: string;
  ambiente?: FocusNfeAmbiente;
}

export class FocusNfeClient {
  private readonly token: string;
  private readonly baseUrl: string;

  constructor({ token, ambiente = "sandbox" }: FocusNfeClientOptions) {
    this.token = token;
    this.baseUrl = getBaseUrl(ambiente);
  }

  /**
   * Emite uma NFS-e. `referencia` é um identificador único definido pelo
   * cliente (ex: o id da Nota no nosso banco) usado para consultas futuras.
   */
  async emitirNfse(
    referencia: string,
    payload: EmitirNfsePayload,
  ): Promise<FocusNfeResponse> {
    const response = await fetch(`${this.baseUrl}/v2/nfse?ref=${referencia}`, {
      method: "POST",
      headers: {
        Authorization: authHeader(this.token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return response.json();
  }

  async consultarNfse(referencia: string): Promise<FocusNfeResponse> {
    const response = await fetch(`${this.baseUrl}/v2/nfse/${referencia}`, {
      method: "GET",
      headers: {
        Authorization: authHeader(this.token),
      },
    });

    return response.json();
  }

  async cancelarNfse(
    referencia: string,
    justificativa: string,
  ): Promise<FocusNfeResponse> {
    const response = await fetch(
      `${this.baseUrl}/v2/nfse/${referencia}`,
      {
        method: "DELETE",
        headers: {
          Authorization: authHeader(this.token),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ justificativa }),
      },
    );

    return response.json();
  }
}
