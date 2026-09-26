"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export interface EmpresaState {
  error?: string;
  success?: boolean;
}

export async function salvarEmpresa(
  _prevState: EmpresaState,
  formData: FormData,
): Promise<EmpresaState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const razaoSocial = formData.get("razaoSocial") as string;
  const nomeFantasia = (formData.get("nomeFantasia") as string) || null;
  const cnpj = formData.get("cnpj") as string;
  const inscricaoMunicipal = formData.get("inscricaoMunicipal") as string;
  const regimeTributario = formData.get("regimeTributario") as string;
  const municipioCodigoIbge = formData.get("municipioCodigoIbge") as string;
  const uf = formData.get("uf") as string;
  const focusNfeToken = formData.get("focusNfeToken") as string;
  const focusNfeAmbiente = formData.get("focusNfeAmbiente") as string;

  if (
    !razaoSocial ||
    !cnpj ||
    !inscricaoMunicipal ||
    !regimeTributario ||
    !municipioCodigoIbge ||
    !uf
  ) {
    return { error: "Preencha todos os campos obrigatórios." };
  }

  const empresaExistente = await prisma.empresa.findFirst({
    where: { userId: session.user.id },
  });

  const data = {
    razaoSocial,
    nomeFantasia,
    cnpj,
    inscricaoMunicipal,
    regimeTributario,
    municipioCodigoIbge,
    uf,
    focusNfeAmbiente: focusNfeAmbiente || "sandbox",
    ...(focusNfeToken ? { focusNfeTokenEncrypted: encrypt(focusNfeToken) } : {}),
  };

  if (empresaExistente) {
    await prisma.empresa.update({
      where: { id: empresaExistente.id },
      data,
    });
  } else {
    await prisma.empresa.create({
      data: { ...data, userId: session.user.id },
    });
  }

  revalidatePath("/dashboard/empresa");
  return { success: true };
}
