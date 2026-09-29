"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { registrarLog } from "@/lib/auditoria";

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

function lerDados(formData: FormData) {
  return {
    nome: (formData.get("nome") as string)?.trim(),
    descricao: (formData.get("descricao") as string)?.trim(),
    valorStr: (formData.get("valor") as string)?.trim(),
  };
}

export async function criarServico(
  _prevState: ServicoState,
  formData: FormData,
): Promise<ServicoState> {
  const { empresa, userId } = await getEmpresaDoUsuario();
  const { nome, descricao, valorStr } = lerDados(formData);

  if (!nome || !descricao) {
    return { error: "Preencha nome e descrição do serviço." };
  }

  const valor = valorStr ? Number(valorStr.replace(",", ".")) : 0;
  if (Number.isNaN(valor) || valor < 0) {
    return { error: "Informe um valor válido (ou deixe 0 se variar por cliente)." };
  }

  const servico = await prisma.servico.create({
    data: { empresaId: empresa.id, nome, descricao, valor },
  });

  await registrarLog({
    empresaId: empresa.id,
    userId,
    acao: "servico.criar",
    entidadeId: servico.id,
  });

  revalidatePath("/dashboard/servicos");
  redirect("/dashboard/servicos");
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

  const { nome, descricao, valorStr } = lerDados(formData);
  if (!nome || !descricao) {
    return { error: "Preencha nome e descrição do serviço." };
  }

  const valor = valorStr ? Number(valorStr.replace(",", ".")) : 0;
  if (Number.isNaN(valor) || valor < 0) {
    return { error: "Informe um valor válido." };
  }

  await prisma.servico.update({
    where: { id: servicoId },
    data: { nome, descricao, valor },
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
