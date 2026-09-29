"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { registrarLog } from "@/lib/auditoria";
import { buscarDadosCnpj, type DadosCnpj } from "@/lib/cnpj";

export interface ClienteState {
  error?: string;
}

export interface BuscarCnpjClienteState {
  error?: string;
  dados?: DadosCnpj;
}

export async function buscarCnpjClienteAction(
  _prevState: BuscarCnpjClienteState,
  formData: FormData,
): Promise<BuscarCnpjClienteState> {
  const documento = formData.get("documento") as string;

  if (!documento) {
    return { error: "Informe um CNPJ." };
  }

  try {
    const dados = await buscarDadosCnpj(documento);
    return { dados };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Não foi possível buscar o CNPJ.",
    };
  }
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

  const cliente = await prisma.cliente.create({
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

  await registrarLog({
    empresaId: empresa.id,
    userId: session.user.id,
    acao: "cliente.criar",
    entidadeId: cliente.id,
  });

  revalidatePath("/dashboard/clientes");
  redirect("/dashboard/clientes");
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

export async function atualizarCliente(
  clienteId: string,
  _prevState: ClienteState,
  formData: FormData,
): Promise<ClienteState> {
  const { empresa, userId } = await getEmpresaDoUsuario();

  // Reconfirma que o cliente pertence a esta empresa antes de alterar —
  // nunca confiamos apenas no id vindo do formulário.
  const clienteExistente = await prisma.cliente.findFirst({
    where: { id: clienteId, empresaId: empresa.id },
  });
  if (!clienteExistente) {
    return { error: "Cliente não encontrado." };
  }

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

  await prisma.cliente.update({
    where: { id: clienteId },
    data: { nome, documento, email, logradouro, numero, bairro, municipio, uf, cep },
  });

  await registrarLog({
    empresaId: empresa.id,
    userId,
    acao: "cliente.editar",
    entidadeId: clienteId,
  });

  revalidatePath("/dashboard/clientes");
  redirect("/dashboard/clientes");
}

export interface ExcluirClienteState {
  error?: string;
}

export async function excluirCliente(
  _prevState: ExcluirClienteState,
  formData: FormData,
): Promise<ExcluirClienteState> {
  const { empresa, userId } = await getEmpresaDoUsuario();
  const clienteId = formData.get("clienteId") as string;

  const cliente = await prisma.cliente.findFirst({
    where: { id: clienteId, empresaId: empresa.id },
  });
  if (!cliente) {
    return { error: "Cliente não encontrado." };
  }

  const notasDoCliente = await prisma.nota.count({ where: { clienteId } });
  if (notasDoCliente > 0) {
    return {
      error: "Este cliente já tem notas emitidas e não pode ser excluído.",
    };
  }

  await prisma.cliente.delete({ where: { id: clienteId } });

  await registrarLog({
    empresaId: empresa.id,
    userId,
    acao: "cliente.excluir",
    entidadeId: clienteId,
  });

  revalidatePath("/dashboard/clientes");
  return {};
}
