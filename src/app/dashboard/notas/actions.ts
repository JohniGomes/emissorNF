"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { emitirNotaParaEmpresa } from "@/lib/emissao";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export interface NotaState {
  error?: string;
}

export async function emitirNota(
  _prevState: NotaState,
  formData: FormData,
): Promise<NotaState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const empresa = await prisma.empresa.findFirst({
    where: { userId: session.user.id },
  });
  if (!empresa) redirect("/dashboard/empresa");

  if (!empresa.focusNfeTokenEncrypted) {
    return {
      error:
        "Configure o token da Focus NFe na página da Empresa antes de emitir notas.",
    };
  }

  if (empresa.regimeTributario === "MEI") {
    return {
      error:
        "Emissão para empresas MEI (NFS-e Nacional) ainda não está disponível — em breve.",
    };
  }

  const clienteId = formData.get("clienteId") as string;
  const descricaoServico = formData.get("descricaoServico") as string;
  const valorStr = formData.get("valor") as string;

  if (!clienteId || !descricaoServico || !valorStr) {
    return { error: "Preencha todos os campos." };
  }

  const valor = Number(valorStr.replace(",", "."));
  if (Number.isNaN(valor) || valor <= 0) {
    return { error: "Informe um valor válido." };
  }

  let cliente;
  if (clienteId === "__manual__") {
    const nome = (formData.get("clienteManualNome") as string)?.trim();
    const documento = (formData.get("clienteManualDocumento") as string)?.trim();
    const email = (formData.get("clienteManualEmail") as string)?.trim() || null;

    if (!nome || !documento) {
      return { error: "Preencha nome e CPF/CNPJ do cliente." };
    }

    cliente = await prisma.cliente.create({
      data: { empresaId: empresa.id, nome, documento, email },
    });
  } else {
    cliente = await prisma.cliente.findFirst({
      where: { id: clienteId, empresaId: empresa.id },
    });
    if (!cliente) {
      return { error: "Cliente inválido." };
    }
  }

  await emitirNotaParaEmpresa({ empresa, cliente, descricaoServico, valor });

  revalidatePath("/dashboard/notas");
  redirect("/dashboard/notas");
}
