"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { registrarLog } from "@/lib/auditoria";
import { buscarDadosCnpj, type DadosCnpj } from "@/lib/cnpj";
import { buscarDadosCep, type DadosCep } from "@/lib/cep";

export interface ClienteState {
  error?: string;
}

export interface BuscarCnpjClienteState {
  error?: string;
  dados?: DadosCnpj;
}

export interface BuscarCepClienteState {
  error?: string;
  dados?: DadosCep;
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

export async function buscarCepClienteAction(
  _prevState: BuscarCepClienteState,
  formData: FormData,
): Promise<BuscarCepClienteState> {
  const cep = formData.get("cep") as string;

  if (!cep) {
    return { error: "Informe um CEP." };
  }

  try {
    const dados = await buscarDadosCep(cep);
    return { dados };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Não foi possível buscar o CEP.",
    };
  }
}

function lerCamposCliente(formData: FormData) {
  return {
    nome: formData.get("nome") as string,
    nomeFantasia: (formData.get("nomeFantasia") as string) || null,
    documento: formData.get("documento") as string,
    email: (formData.get("email") as string) || null,
    telefone: (formData.get("telefone") as string) || null,
    whatsapp: (formData.get("whatsapp") as string) || null,
    logradouro: (formData.get("logradouro") as string) || null,
    numero: (formData.get("numero") as string) || null,
    complemento: (formData.get("complemento") as string) || null,
    bairro: (formData.get("bairro") as string) || null,
    municipio: (formData.get("municipio") as string) || null,
    municipioCodigoIbge: (formData.get("municipioCodigoIbge") as string) || null,
    uf: (formData.get("uf") as string) || null,
    cep: (formData.get("cep") as string) || null,
    inscricaoMunicipal: (formData.get("inscricaoMunicipal") as string) || null,
    inscricaoEstadual: (formData.get("inscricaoEstadual") as string) || null,
  };
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

  const campos = lerCamposCliente(formData);

  if (!campos.nome || !campos.documento) {
    return { error: "Preencha nome e documento (CPF/CNPJ)." };
  }

  const cliente = await prisma.cliente.create({
    data: {
      empresaId: empresa.id,
      ...campos,
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

  const campos = lerCamposCliente(formData);

  if (!campos.nome || !campos.documento) {
    return { error: "Preencha nome e documento (CPF/CNPJ)." };
  }

  await prisma.cliente.update({
    where: { id: clienteId },
    data: campos,
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
