"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export interface ClienteState {
  error?: string;
}

export async function criarCliente(
  _prevState: ClienteState,
  formData: FormData,
): Promise<ClienteState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const empresa = await prisma.empresa.findFirst({
    where: { userId: session.user.id },
  });
  if (!empresa) redirect("/dashboard/empresa");

  const nome = formData.get("nome") as string;
  const documento = formData.get("documento") as string;
  const email = (formData.get("email") as string) || null;
  const logradouro = (formData.get("logradouro") as string) || null;
  const numero = (formData.get("numero") as string) || null;
  const bairro = (formData.get("bairro") as string) || null;
  const municipio = (formData.get("municipio") as string) || null;
  const uf = (formData.get("uf") as string) || null;
  const cep = (formData.get("cep") as string) || null;

  if (!nome || !documento) {
    return { error: "Preencha nome e documento (CPF/CNPJ)." };
  }

  await prisma.cliente.create({
    data: {
      empresaId: empresa.id,
      nome,
      documento,
      email,
      logradouro,
      numero,
      bairro,
      municipio,
      uf,
      cep,
    },
  });

  revalidatePath("/dashboard/clientes");
  redirect("/dashboard/clientes");
}
