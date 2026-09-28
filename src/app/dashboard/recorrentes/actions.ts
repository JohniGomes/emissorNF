"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { registrarLog } from "@/lib/auditoria";

export interface RecorrenteState {
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

export async function criarRecorrente(
  _prevState: RecorrenteState,
  formData: FormData,
): Promise<RecorrenteState> {
  const { empresa, userId } = await getEmpresaDoUsuario();

  const clienteId = formData.get("clienteId") as string;
  const descricaoServico = (formData.get("descricaoServico") as string)?.trim();
  const valorStr = formData.get("valor") as string;
  const diaDoMesStr = formData.get("diaDoMes") as string;
  const quantidadeMesesStr = (formData.get("quantidadeMeses") as string)?.trim();
  const codigoTributacaoNacionalIss =
    (formData.get("codigoTributacaoNacionalIss") as string)?.trim() || null;

  if (!clienteId || !descricaoServico || !valorStr || !diaDoMesStr) {
    return { error: "Preencha todos os campos obrigatórios." };
  }

  const ehMei = empresa.regimeTributario === "MEI";
  if (ehMei && !codigoTributacaoNacionalIss) {
    return { error: "Informe o código de tributação nacional do ISS." };
  }

  const cliente = await prisma.cliente.findFirst({
    where: { id: clienteId, empresaId: empresa.id },
  });
  if (!cliente) {
    return { error: "Cliente inválido." };
  }

  const valor = Number(valorStr.replace(",", "."));
  if (Number.isNaN(valor) || valor <= 0) {
    return { error: "Informe um valor válido." };
  }

  const diaDoMes = Number(diaDoMesStr);
  if (!Number.isInteger(diaDoMes) || diaDoMes < 1 || diaDoMes > 31) {
    return { error: "Informe um dia do mês entre 1 e 31." };
  }

  let mesesRestantes: number | null = null;
  if (quantidadeMesesStr) {
    const quantidade = Number(quantidadeMesesStr);
    if (!Number.isInteger(quantidade) || quantidade < 1) {
      return { error: "A quantidade de meses deve ser um número inteiro maior que zero." };
    }
    mesesRestantes = quantidade;
  }

  const recorrente = await prisma.notaRecorrente.create({
    data: {
      empresaId: empresa.id,
      clienteId,
      descricaoServico,
      valor,
      diaDoMes,
      mesesRestantes,
      codigoTributacaoNacionalIss: ehMei ? codigoTributacaoNacionalIss : null,
    },
  });

  await registrarLog({
    empresaId: empresa.id,
    userId,
    acao: "nota_recorrente.criar",
    entidadeId: recorrente.id,
  });

  revalidatePath("/dashboard/recorrentes");
  redirect("/dashboard/recorrentes");
}

export async function alternarRecorrente(formData: FormData): Promise<void> {
  const { empresa, userId } = await getEmpresaDoUsuario();
  const id = formData.get("id") as string;

  const recorrente = await prisma.notaRecorrente.findFirst({
    where: { id, empresaId: empresa.id },
  });
  if (!recorrente) return;

  await prisma.notaRecorrente.update({
    where: { id },
    data: { ativo: !recorrente.ativo },
  });

  await registrarLog({
    empresaId: empresa.id,
    userId,
    acao: recorrente.ativo ? "nota_recorrente.desativar" : "nota_recorrente.ativar",
    entidadeId: id,
  });

  revalidatePath("/dashboard/recorrentes");
}
