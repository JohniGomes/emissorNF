"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export interface ServicoState {
  error?: string;
}

export async function criarServico(
  _prevState: ServicoState,
  formData: FormData,
): Promise<ServicoState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const empresa = await prisma.empresa.findFirst({
    where: { userId: session.user.id },
  });
  if (!empresa) redirect("/dashboard/empresa");

  const descricao = formData.get("descricao") as string;
  const valorStr = formData.get("valor") as string;

  if (!descricao || !valorStr) {
    return { error: "Preencha descrição e valor." };
  }

  const valor = Number(valorStr.replace(",", "."));
  if (Number.isNaN(valor) || valor <= 0) {
    return { error: "Informe um valor válido." };
  }

  await prisma.servico.create({
    data: { empresaId: empresa.id, descricao, valor },
  });

  revalidatePath("/dashboard/servicos");
  redirect("/dashboard/servicos");
}

export async function excluirServico(id: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const empresa = await prisma.empresa.findFirst({
    where: { userId: session.user.id },
  });
  if (!empresa) redirect("/dashboard/empresa");

  await prisma.servico.deleteMany({ where: { id, empresaId: empresa.id } });
  revalidatePath("/dashboard/servicos");
}
