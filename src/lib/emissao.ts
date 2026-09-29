import { Prisma, type Empresa, type Cliente, type Nota } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import {
  FocusNfeClient,
  type EmitirNfsePayload,
  type EmitirDpsNacionalPayload,
} from "@/lib/focusnfe";
import { registrarLog } from "@/lib/auditoria";
import { formatarErroParaNota } from "@/lib/erros-fiscais";

interface EmitirNotaParaEmpresaParams {
  empresa: Empresa;
  cliente: Cliente;
  descricaoServico: string;
  valor: number;
  notaRecorrenteId?: string;
  idempotencyKey?: string;
  // Obrigatório apenas para empresas MEI (NFS-e Nacional).
  codigoTributacaoNacionalIss?: string;
  servicoId?: string;
  desconto?: number;
  dataCompetencia?: Date;
  observacoes?: string;
  // Só relevantes para NFS-e clássica (empresas não-MEI).
  itemListaServico?: string;
  codigoNbs?: string;
}

/**
 * Cria a Nota, chama a Focus NFe e grava o resultado. Usada tanto pela emissão
 * avulsa (formulário) quanto pelo cron de notas recorrentes - mantém a mesma
 * lógica de payload/erro nos dois fluxos.
 */
export async function emitirNotaParaEmpresa({
  empresa,
  cliente,
  descricaoServico,
  valor,
  notaRecorrenteId,
  idempotencyKey,
  codigoTributacaoNacionalIss,
  servicoId,
  desconto,
  dataCompetencia,
  observacoes,
  itemListaServico,
  codigoNbs,
}: EmitirNotaParaEmpresaParams): Promise<Nota> {
  if (!empresa.focusNfeTokenEncrypted) {
    throw new Error("Empresa sem token da Focus NFe configurado.");
  }

  const ehMei = empresa.regimeTributario === "MEI";

  if (ehMei) {
    if (!codigoTributacaoNacionalIss) {
      throw new Error(
        "Informe o código de tributação nacional do ISS referente ao serviço.",
      );
    }
    if (!empresa.codigoOpcaoSimplesNacional) {
      throw new Error(
        "Complete o cadastro fiscal da empresa (código de opção pelo Simples Nacional) antes de emitir notas.",
      );
    }
  }

  const valorLiquido = valor - (desconto ?? 0);
  if (valorLiquido <= 0) {
    throw new Error("O desconto não pode ser maior ou igual ao valor do serviço.");
  }

  // Observações do usuário viajam junto na descrição enviada à Focus (não
  // existe um campo fiscal separado pra isso na NFS-e clássica nem na DPS),
  // mas ficam registradas à parte na Nota para referência.
  const discriminacaoParaFocus = observacoes
    ? `${descricaoServico}\n\nObservações: ${observacoes}`
    : descricaoServico;

  let nota: Nota;
  try {
    nota = await prisma.nota.create({
      data: {
        empresaId: empresa.id,
        clienteId: cliente.id,
        servicoId,
        descricaoServico,
        valor,
        desconto,
        dataCompetencia: dataCompetencia ?? new Date(),
        observacoes,
        itemListaServico: ehMei ? undefined : itemListaServico,
        codigoNbs: ehMei ? undefined : codigoNbs,
        status: "PROCESSANDO",
        notaRecorrenteId,
        idempotencyKey,
        codigoTributacaoNacionalIss: ehMei ? codigoTributacaoNacionalIss : undefined,
      },
    });
  } catch (err) {
    // Corrida entre dois cliques quase simultâneos: a constraint única do
    // banco pegou o que a checagem em memória não pegou a tempo - a nota já
    // existe, então devolvemos ela em vez de emitir (e cobrar) duas vezes.
    if (
      idempotencyKey &&
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002" &&
      Array.isArray(err.meta?.target) &&
      err.meta.target.includes("idempotencyKey")
    ) {
      const existente = await prisma.nota.findUnique({ where: { idempotencyKey } });
      if (existente) return existente;
    }
    throw err;
  }

  try {
    const token = decrypt(empresa.focusNfeTokenEncrypted);
    const client = new FocusNfeClient({
      token,
      ambiente: empresa.focusNfeAmbiente === "producao" ? "producao" : "sandbox",
    });

    const resposta = ehMei
      ? await emitirViaNfseNacional(client, empresa, cliente, nota.id, {
          descricaoServico: discriminacaoParaFocus,
          valor: valorLiquido,
          codigoTributacaoNacionalIss: codigoTributacaoNacionalIss!,
          dataCompetencia: nota.dataCompetencia ?? new Date(),
        })
      : await client.emitirNfse(nota.id, montarPayloadNfseClassica(empresa, cliente, {
          descricaoServico: discriminacaoParaFocus,
          valor: valorLiquido,
          itemListaServico,
          codigoNbs,
        }));

    const statusFinal =
      resposta.status === "erro_autorizacao" || resposta.erros?.length
        ? "ERRO"
        : "PROCESSANDO";

    const notaAtualizada = await prisma.nota.update({
      where: { id: nota.id },
      data: {
        status: statusFinal,
        numero: resposta.numero,
        codigoVerificacao: resposta.codigo_verificacao,
        linkPdf: resposta.url,
        respostaApi: JSON.parse(JSON.stringify(resposta)),
        erro: resposta.erros?.length
          ? formatarErroParaNota(resposta.erros.map((e) => e.mensagem).join("; "))
          : undefined,
      },
    });

    await registrarLog({
      empresaId: empresa.id,
      acao: statusFinal === "ERRO" ? "nota.emitir.erro" : "nota.emitir.sucesso",
      entidadeId: nota.id,
      detalhes: { valor, clienteId: cliente.id, viaNfseNacional: ehMei },
    });

    return notaAtualizada;
  } catch (err) {
    const notaComErro = await prisma.nota.update({
      where: { id: nota.id },
      data: {
        status: "ERRO",
        erro: formatarErroParaNota(
          err instanceof Error ? err.message : "Erro desconhecido ao emitir nota.",
        ),
      },
    });

    await registrarLog({
      empresaId: empresa.id,
      acao: "nota.emitir.erro",
      entidadeId: nota.id,
      detalhes: { valor, clienteId: cliente.id, viaNfseNacional: ehMei },
    });

    return notaComErro;
  }
}

function montarPayloadNfseClassica(
  empresa: Empresa,
  cliente: Cliente,
  dados: {
    descricaoServico: string;
    valor: number;
    itemListaServico?: string;
    codigoNbs?: string;
  },
): EmitirNfsePayload {
  return {
    data_emissao: new Date().toISOString(),
    prestador: {
      cnpj: empresa.cnpj,
      inscricao_municipal: empresa.inscricaoMunicipal ?? undefined,
      codigo_municipio: empresa.municipioCodigoIbge,
    },
    tomador: {
      cnpj_cpf: cliente.documento,
      razao_social: cliente.nome,
      email: cliente.email ?? undefined,
      endereco: {
        logradouro: cliente.logradouro ?? undefined,
        numero: cliente.numero ?? undefined,
        bairro: cliente.bairro ?? undefined,
        codigo_municipio: empresa.municipioCodigoIbge,
        uf: cliente.uf ?? undefined,
        cep: cliente.cep ?? undefined,
      },
    },
    servico: {
      discriminacao: dados.descricaoServico,
      valor_servicos: dados.valor,
      item_lista_servico: dados.itemListaServico,
      codigo_nbs: dados.codigoNbs,
    },
  };
}

/**
 * Emissão via NFS-e Nacional (DPS), obrigatória para empresas MEI. Reserva um
 * número sequencial de DPS atômico (série fixa 1) antes de montar o payload -
 * a numeração é nossa responsabilidade, a Focus não gera isso por nós.
 */
async function emitirViaNfseNacional(
  client: FocusNfeClient,
  empresa: Empresa,
  cliente: Cliente,
  notaId: string,
  dados: {
    descricaoServico: string;
    valor: number;
    codigoTributacaoNacionalIss: string;
    dataCompetencia: Date;
  },
) {
  const empresaAtualizada = await prisma.empresa.update({
    where: { id: empresa.id },
    data: { proximoNumeroDps: { increment: 1 } },
    select: { proximoNumeroDps: true },
  });
  const numeroDps = empresaAtualizada.proximoNumeroDps - 1;

  const cnpjCliente = cliente.documento.replace(/\D/g, "").length === 14;

  const payload: EmitirDpsNacionalPayload = {
    data_emissao: new Date().toISOString(),
    data_competencia: dados.dataCompetencia.toISOString().slice(0, 10),
    serie_dps: 1,
    numero_dps: numeroDps,
    emitente_dps: "1",
    codigo_municipio_emissora: Number(empresa.municipioCodigoIbge),
    cnpj_prestador: empresa.cnpj.replace(/\D/g, ""),
    codigo_opcao_simples_nacional: empresa.codigoOpcaoSimplesNacional!,
    regime_especial_tributacao: empresa.regimeEspecialTributacao ?? undefined,
    cnpj_tomador: cnpjCliente ? cliente.documento.replace(/\D/g, "") : undefined,
    cpf_tomador: cnpjCliente ? undefined : cliente.documento.replace(/\D/g, ""),
    codigo_municipio_prestacao: empresa.municipioCodigoIbge,
    codigo_tributacao_nacional_iss: dados.codigoTributacaoNacionalIss,
    descricao_servico: dados.descricaoServico,
    valor_servico: dados.valor,
  };

  return client.emitirDpsNacional(notaId, payload);
}

/**
 * Cancela uma Nota já autorizada. Só faz sentido pra notas AUTORIZADA - pedir
 * cancelamento de uma nota em erro ou já cancelada não tem efeito na Focus e
 * só confundiria o histórico, então quem chama isso já deve ter checado o status.
 */
export async function cancelarNotaParaEmpresa(
  empresa: Empresa,
  nota: Nota,
  justificativa: string,
): Promise<Nota> {
  if (!empresa.focusNfeTokenEncrypted) {
    throw new Error("Empresa sem token da Focus NFe configurado.");
  }

  const token = decrypt(empresa.focusNfeTokenEncrypted);
  const client = new FocusNfeClient({
    token,
    ambiente: empresa.focusNfeAmbiente === "producao" ? "producao" : "sandbox",
  });

  const resposta =
    empresa.regimeTributario === "MEI"
      ? await client.cancelarDpsNacional(nota.id, justificativa)
      : await client.cancelarNfse(nota.id, justificativa);

  if (resposta.erros?.length) {
    throw new Error(resposta.erros.map((e) => e.mensagem).join("; "));
  }

  const notaCancelada = await prisma.nota.update({
    where: { id: nota.id },
    data: { status: "CANCELADA" },
  });

  await registrarLog({
    empresaId: empresa.id,
    acao: "nota.cancelar",
    entidadeId: nota.id,
    detalhes: { justificativa },
  });

  return notaCancelada;
}
