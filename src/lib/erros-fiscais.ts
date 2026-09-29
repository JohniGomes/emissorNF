/**
 * Traduz o texto bruto que a Focus NFe devolve em erros (em geral inglês
 * técnico de API ou jargão fiscal) para algo que o usuário do Notarium
 * entenda, com uma dica de como resolver quando dá pra saber a causa.
 * Nunca inventa causa fiscal - quando não reconhece o padrão, mostra a
 * mensagem original da Focus prefixada, sem fingir que sabe o motivo.
 */

interface ErroNormalizado {
  mensagem: string;
  dica?: string;
}

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
      mensagem: "Essa nota não foi localizada no provedor fiscal.",
      dica: "Pode já ter expirado no ambiente de testes (homologação) ou ter sido processada com outro identificador.",
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
    regex: /access token/i,
    normalizar: () => ({
      mensagem: "O acesso ao provedor fiscal da sua empresa não foi reconhecido.",
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

  return { mensagem: mensagemOriginal };
}

/** Formata pra guardar em Nota.erro: mensagem amigável + dica entre parênteses. */
export function formatarErroParaNota(mensagemOriginal: string): string {
  const { mensagem, dica } = normalizarErroFiscal(mensagemOriginal);
  return dica ? `${mensagem} (${dica})` : mensagem;
}
