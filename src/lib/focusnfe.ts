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
    inscricao_municipal: string;
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
