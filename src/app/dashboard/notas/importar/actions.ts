"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { emitirNotaParaEmpresa } from "@/lib/emissao";
import { registrarLog } from "@/lib/auditoria";
import { sanitizarMensagemExibicao } from "@/lib/erros-fiscais";
import { formatarCpfCnpj } from "@/lib/formatters";

export interface ItemImportacao {
  idempotencyKey: string;
  nomeCliente: string;
  documentoCliente: string;
  valor: number;
}

export interface ResultadoItemImportacao {
  idempotencyKey: string;
  ok: boolean;
  mensagem: string;
}

async function getEmpresaDoUsuario() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const empresa = await prisma.empresa.findFirst({
    where: { userId: session.user.id },
  });
  if (!empresa) redirect("/dashboard/empresa");

  return { empresa, userId: session.user.id };
}

// Processa um lote pequeno por vez (o cliente divide a lista completa em
// pedaços) - evita estourar o tempo limite de uma função serverless ao
// emitir dezenas/centenas de notas de uma só chamada.
const TAMANHO_MAXIMO_LOTE = 15;

export async function importarLoteNotas(
  servicoId: string,
  dataCompetenciaStr: string,
  itens: ItemImportacao[],
): Promise<ResultadoItemImportacao[]> {
  const { empresa, userId } = await getEmpresaDoUsuario();

  if (itens.length > TAMANHO_MAXIMO_LOTE) {
    throw new Error(`Envie no máximo ${TAMANHO_MAXIMO_LOTE} itens por chamada.`);
  }

  if (!empresa.focusNfeTokenEncrypted) {
    return itens.map((item) => ({
      idempotencyKey: item.idempotencyKey,
      ok: false,
      mensagem: "Complete a configuração fiscal da empresa antes de importar notas.",
    }));
  }

  const servico = await prisma.servico.findFirst({
    where: { id: servicoId, empresaId: empresa.id },
  });
  if (!servico) {
    return itens.map((item) => ({
      idempotencyKey: item.idempotencyKey,
      ok: false,
      mensagem: "Serviço selecionado inválido.",
    }));
  }

  const ehMei = empresa.regimeTributario === "MEI";
  if (ehMei && !servico.codigoTributacaoNacional) {
    return itens.map((item) => ({
      idempotencyKey: item.idempotencyKey,
      ok: false,
      mensagem:
        "O serviço selecionado não tem código de tributação nacional configurado (obrigatório para MEI).",
    }));
  }

  const dataCompetencia = dataCompetenciaStr
    ? new Date(`${dataCompetenciaStr}T00:00:00`)
    : new Date();

  const resultados: ResultadoItemImportacao[] = [];

  for (const item of itens) {
    try {
      const nome = item.nomeCliente.trim();
      const documento = formatarCpfCnpj(item.documentoCliente);
      const documentoDigitos = documento.replace(/\D/g, "");

      if (!nome) throw new Error("Nome do cliente vazio.");
      if (documentoDigitos.length !== 11 && documentoDigitos.length !== 14) {
        throw new Error("CPF/CNPJ do cliente inválido.");
      }
      if (!item.valor || Number.isNaN(item.valor) || item.valor <= 0) {
        throw new Error("Valor inválido.");
      }

      let cliente = await prisma.cliente.findFirst({
        where: { empresaId: empresa.id, documento },
      });
      if (!cliente) {
        cliente = await prisma.cliente.create({
          data: { empresaId: empresa.id, nome, documento },
        });
        await registrarLog({
          empresaId: empresa.id,
          userId,
          acao: "cliente.criar_via_importacao",
          entidadeId: cliente.id,
        });
      }

      const nota = await emitirNotaParaEmpresa({
        empresa,
        cliente,
        descricaoServico: servico.descricao,
        valor: item.valor,
        idempotencyKey: item.idempotencyKey,
        servicoId: servico.id,
        dataCompetencia,
        codigoTributacaoNacionalIss: ehMei ? servico.codigoTributacaoNacional! : undefined,
        itemListaServico: !ehMei ? servico.codigoTributacaoNacional?.slice(0, 4) : undefined,
        codigoNbs: servico.codigoNbs ?? undefined,
      });

      resultados.push({
        idempotencyKey: item.idempotencyKey,
        ok: nota.status !== "ERRO",
        mensagem:
          nota.status === "ERRO"
            ? nota.erro
              ? sanitizarMensagemExibicao(nota.erro)
              : "Não foi possível emitir esta nota."
            : "Emitida com sucesso.",
      });
    } catch (err) {
      resultados.push({
        idempotencyKey: item.idempotencyKey,
        ok: false,
        mensagem:
          err instanceof Error ? sanitizarMensagemExibicao(err.message) : "Erro desconhecido.",
      });
    }
  }

  await registrarLog({
    empresaId: empresa.id,
    userId,
    acao: "nota.importar_lote",
    detalhes: { total: itens.length, sucesso: resultados.filter((r) => r.ok).length },
  });

  revalidatePath("/dashboard/notas");
  return resultados;
}
