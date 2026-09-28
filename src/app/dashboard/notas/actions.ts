"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { emitirNotaParaEmpresa, cancelarNotaParaEmpresa } from "@/lib/emissao";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export interface NotaState {
  error?: string;
}

export interface CancelarNotaState {
  error?: string;
}

export async function cancelarNota(
  _prevState: CancelarNotaState,
  formData: FormData,
): Promise<CancelarNotaState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const empresa = await prisma.empresa.findFirst({
    where: { userId: session.user.id },
  });
  if (!empresa) redirect("/dashboard/empresa");

  const notaId = formData.get("notaId") as string;
  const justificativa = (formData.get("justificativa") as string)?.trim();

  if (!justificativa || justificativa.length < 15) {
    return { error: "Informe uma justificativa com pelo menos 15 caracteres." };
  }

  const nota = await prisma.nota.findFirst({
    where: { id: notaId, empresaId: empresa.id },
  });
  if (!nota) {
    return { error: "Nota não encontrada." };
  }
  if (nota.status !== "AUTORIZADA") {
    return { error: "Só é possível cancelar uma nota autorizada." };
  }

  try {
    await cancelarNotaParaEmpresa(empresa, nota, justificativa);
  } catch (err) {
    return {
      error:
        err instanceof Error
          ? `Não foi possível cancelar a nota: ${err.message}`
          : "Não foi possível cancelar a nota.",
    };
  }

  revalidatePath("/dashboard/notas");
  return {};
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

  const ehMei = empresa.regimeTributario === "MEI";

  if (ehMei && !empresa.codigoOpcaoSimplesNacional) {
    return {
      error:
        "Complete o cadastro fiscal da empresa (código de opção pelo Simples Nacional) na página Empresa antes de emitir notas.",
    };
  }

  const clienteId = formData.get("clienteId") as string;
  const descricaoServico = formData.get("descricaoServico") as string;
  const valorStr = formData.get("valor") as string;
  const idempotencyKey = (formData.get("idempotencyKey") as string) || undefined;
  const codigoTributacaoNacionalIss =
    (formData.get("codigoTributacaoNacionalIss") as string) || undefined;

  if (ehMei && !codigoTributacaoNacionalIss) {
    return { error: "Informe o código de tributação nacional do ISS." };
  }

  if (!clienteId || !descricaoServico || !valorStr) {
    return { error: "Preencha todos os campos." };
  }

  if (idempotencyKey) {
    const notaExistente = await prisma.nota.findUnique({
      where: { idempotencyKey },
    });
    if (notaExistente) {
      // Reenvio do mesmo formulário (duplo clique, retry de rede): a nota já
      // foi criada na primeira chamada, não criamos uma segunda.
      revalidatePath("/dashboard/notas");
      redirect("/dashboard/notas");
    }
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

  await emitirNotaParaEmpresa({
    empresa,
    cliente,
    descricaoServico,
    valor,
    idempotencyKey,
    codigoTributacaoNacionalIss,
  });

  revalidatePath("/dashboard/notas");
  redirect("/dashboard/notas");
}
