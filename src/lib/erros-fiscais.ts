/**
 * Traduz o texto bruto que o provedor fiscal devolve em erros (em geral
 * jargão técnico de API) para algo que o usuário do Notarium entenda, com
 * uma dica de como resolver quando dá pra saber a causa. Nunca inventa causa
 * fiscal, e nunca expõe o nome do provedor, hosts ou jargão técnico de API
 * ao usuário final; quando não reconhece o padrão, mostra uma mensagem
 * genérica e honesta em vez de repetir o texto bruto.
 */

interface ErroNormalizado {
  mensagem: string;
  dica?: string;
}

const MENSAGEM_GENERICA: ErroNormalizado = {
  mensagem: "Não foi possível emitir a nota agora.",
  dica: "Tente novamente em alguns minutos; se o problema continuar, fale com o suporte.",
};

const PADROES: Array<{ regex: RegExp; normalizar: (original: string) => ErroNormalizado }> = [
  {
    regex: /certificado digital/i,
    normalizar: () => ({
      mensagem: "Sua empresa ainda não tem um certificado digital configurado.",
      dica: 'Vá em "Sua empresa" e envie o certificado A1 (.pfx/.p12) na seção "Certificado digital".',
    }),
  },
  {
    regex: /codigo_municipio|código do município|codigo_municipio_prestacao|codigo_municipio_emissora/i,
    normalizar: () => ({
      mensagem: "Faltou o código do município (IBGE) para autorizar a nota.",
      dica: 'Confira o "Código IBGE do município" em "Sua empresa"; ou, se o problema for do cliente, o município cadastrado nele.',
    }),
  },
  {
    regex: /inscricao_municipal|inscrição municipal/i,
    normalizar: () => ({
      mensagem: "A prefeitura exige a inscrição municipal da empresa para essa nota.",
      dica: 'Preencha a "Inscrição municipal" em "Sua empresa".',
    }),
  },
  {
    regex: /nota fiscal não encontrada|nao encontrada/i,
    normalizar: () => ({
      mensagem: "Essa nota não foi localizada.",
      dica: "Pode já ter expirado no ambiente de testes ou ter sido processada com outro identificador.",
    }),
  },
  {
    regex: /codigo_opcao_simples_nacional|regime_especial_tributacao/i,
    normalizar: () => ({
      mensagem: "A classificação fiscal da empresa no Simples Nacional está incorreta ou incompleta.",
      dica: 'Revise o "Código de opção pelo Simples Nacional" em "Sua empresa" com seu contador.',
    }),
  },
  {
    regex: /codigo_tributacao_nacional_iss/i,
    normalizar: () => ({
      mensagem: "O código de tributação nacional do ISS informado não é válido para esse serviço.",
      dica: "Confira o código na tabela oficial da NFS-e Nacional ou com seu contador.",
    }),
  },
  {
    regex: /access token|permissao_negada|host\s*:/i,
    normalizar: () => ({
      mensagem: "O acesso fiscal da sua empresa não foi reconhecido.",
      dica: 'Vá em "Sua empresa" e confirme se o cadastro fiscal está completo; se o problema continuar, fale com o suporte.',
    }),
  },
];

export function normalizarErroFiscal(mensagemOriginal: string): ErroNormalizado {
  for (const { regex, normalizar } of PADROES) {
    if (regex.test(mensagemOriginal)) {
      return normalizar(mensagemOriginal);
    }
  }

  // Não reconhecemos o padrão: melhor uma mensagem genérica e honesta do que
  // repetir texto técnico bruto que pode citar o provedor, hosts ou jargão de API.
  return MENSAGEM_GENERICA;
}

/** Formata pra guardar em Nota.erro: mensagem amigável + dica entre parênteses. */
export function formatarErroParaNota(mensagemOriginal: string): string {
  const { mensagem, dica } = normalizarErroFiscal(mensagemOriginal);
  return dica ? `${mensagem} (${dica})` : mensagem;
}

const PADRAO_PROVEDOR = /focus\s*-?\s*nfe|[\w.-]*focusnfe\.com\.br/gi;
const PADRAO_HOST = /\(?\s*host\s*:\s*[^)]*\)?/gi;

/**
 * Sanitiza uma mensagem de erro já salva (possivelmente de antes desta
 * blindagem existir) na hora de exibir - garante que nada citando o
 * provedor fiscal ou jargão técnico de API chegue à tela do usuário, mesmo
 * para notas antigas.
 */
export function sanitizarMensagemExibicao(mensagem: string): string {
  const semHost = mensagem.replace(PADRAO_HOST, "").replace(PADRAO_PROVEDOR, "provedor fiscal");
  const limpo = semHost.replace(/\(\s*\)/g, "").replace(/\s{2,}/g, " ").trim();

  if (!limpo || /access token|permissao_negada|provedor fiscal$/i.test(limpo)) {
    return `${MENSAGEM_GENERICA.mensagem} (${MENSAGEM_GENERICA.dica})`;
  }

  return limpo;
}
