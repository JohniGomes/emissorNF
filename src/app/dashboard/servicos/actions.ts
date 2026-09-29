"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { registrarLog } from "@/lib/auditoria";
import { buscarCodigoTributacaoNacional } from "@/lib/codigoTributacaoNacional";

export interface ServicoState {
  error?: string;
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

export interface ItemServicoLote {
  codigoTributacaoNacional: string;
  codigoNbs?: string;
}

export interface CriarServicosEmLoteState {
  error?: string;
}

/**
 * Cria vários serviços de uma vez a partir do código de tributação nacional
 * escolhido (+ NBS opcional) — nome/descrição vêm da própria tabela oficial,
 * nunca digitados à mão, pra manter consistência com o que será enviado à
 * Focus na hora de emitir.
 */
export async function criarServicosEmLote(itens: ItemServicoLote[]): Promise<CriarServicosEmLoteState> {
  const { empresa, userId } = await getEmpresaDoUsuario();

  if (!itens.length) {
    return { error: "Adicione ao menos um serviço à lista antes de salvar." };
  }

  const dados = itens.map((item) => {
    const encontrado = buscarCodigoTributacaoNacional(item.codigoTributacaoNacional, 1)[0];
    if (!encontrado || encontrado.codigo !== item.codigoTributacaoNacional) {
      throw new Error("Código de tributação nacional inválido.");
    }
    return {
      empresaId: empresa.id,
      nome: encontrado.descricao.slice(0, 80),
      descricao: encontrado.descricao,
      valor: 0,
      codigoTributacaoNacional: item.codigoTributacaoNacional,
      codigoNbs: item.codigoNbs || null,
    };
  });

  const criados = await prisma.$transaction(
    dados.map((d) => prisma.servico.create({ data: d })),
  );

  await registrarLog({
    empresaId: empresa.id,
    userId,
    acao: "servico.criar_lote",
    detalhes: { quantidade: criados.length },
  });

  revalidatePath("/dashboard/servicos");
  return {};
}

function lerDados(formData: FormData) {
  return {
    nome: (formData.get("nome") as string)?.trim(),
    descricao: (formData.get("descricao") as string)?.trim(),
    valorStr: (formData.get("valor") as string)?.trim(),
    codigoTributacaoNacional: (formData.get("codigoTributacaoNacional") as string)?.trim() || null,
    codigoNbs: (formData.get("codigoNbs") as string)?.trim() || null,
  };
}

export async function atualizarServico(
  servicoId: string,
  _prevState: ServicoState,
  formData: FormData,
): Promise<ServicoState> {
  const { empresa, userId } = await getEmpresaDoUsuario();

  const existente = await prisma.servico.findFirst({
    where: { id: servicoId, empresaId: empresa.id },
  });
  if (!existente) return { error: "Serviço não encontrado." };

  const { nome, descricao, valorStr, codigoTributacaoNacional, codigoNbs } = lerDados(formData);
  if (!nome || !descricao) {
    return { error: "Preencha nome e descrição do serviço." };
  }

  const valor = valorStr ? Number(valorStr.replace(",", ".")) : 0;
  if (Number.isNaN(valor) || valor < 0) {
    return { error: "Informe um valor válido." };
  }

  await prisma.servico.update({
    where: { id: servicoId },
    data: { nome, descricao, valor, codigoTributacaoNacional, codigoNbs },
  });

  await registrarLog({
    empresaId: empresa.id,
    userId,
    acao: "servico.editar",
    entidadeId: servicoId,
  });

  revalidatePath("/dashboard/servicos");
  redirect("/dashboard/servicos");
}

export async function alternarServico(formData: FormData): Promise<void> {
  const { empresa, userId } = await getEmpresaDoUsuario();
  const id = formData.get("id") as string;

  const servico = await prisma.servico.findFirst({
    where: { id, empresaId: empresa.id },
  });
  if (!servico) return;

  await prisma.servico.update({
    where: { id },
    data: { ativo: !servico.ativo },
  });

  await registrarLog({
    empresaId: empresa.id,
    userId,
    acao: servico.ativo ? "servico.desativar" : "servico.ativar",
    entidadeId: id,
  });

  revalidatePath("/dashboard/servicos");
}
