"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export interface NotaRecorrenteState {
  error?: string;
}

export async function criarNotaRecorrente(
  _prevState: NotaRecorrenteState,
  formData: FormData,
): Promise<NotaRecorrenteState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const empresa = await prisma.empresa.findFirst({
    where: { userId: session.user.id },
  });
  if (!empresa) redirect("/dashboard/empresa");

  const clienteId = formData.get("clienteId") as string;
  const descricaoServico = formData.get("descricaoServico") as string;
  const valorStr = formData.get("valor") as string;
  const diaDoMesStr = formData.get("diaDoMes") as string;

  if (!clienteId || !descricaoServico || !valorStr || !diaDoMesStr) {
    return { error: "Preencha todos os campos." };
  }

  const valor = Number(valorStr.replace(",", "."));
  if (Number.isNaN(valor) || valor <= 0) {
    return { error: "Informe um valor válido." };
  }

  const diaDoMes = Number(diaDoMesStr);
  if (!Number.isInteger(diaDoMes) || diaDoMes < 1 || diaDoMes > 31) {
    return { error: "Informe um dia do mês entre 1 e 31." };
  }

  const cliente = await prisma.cliente.findFirst({
    where: { id: clienteId, empresaId: empresa.id },
  });
  if (!cliente) {
    return { error: "Cliente inválido." };
  }

  await prisma.notaRecorrente.create({
    data: {
      empresaId: empresa.id,
      clienteId: cliente.id,
      descricaoServico,
      valor,
      diaDoMes,
    },
  });

  revalidatePath("/dashboard/recorrentes");
  redirect("/dashboard/recorrentes");
}

export async function alternarNotaRecorrente(id: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const empresa = await prisma.empresa.findFirst({
    where: { userId: session.user.id },
  });
  if (!empresa) redirect("/dashboard/empresa");

  const recorrente = await prisma.notaRecorrente.findFirst({
    where: { id, empresaId: empresa.id },
  });
  if (!recorrente) return;

  await prisma.notaRecorrente.update({
    where: { id },
    data: { ativo: !recorrente.ativo },
  });

  revalidatePath("/dashboard/recorrentes");
}
