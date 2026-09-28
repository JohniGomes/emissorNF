"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buscarDadosCnpj, type DadosCnpj } from "@/lib/cnpj";
import {
  lerDadosEmpresaDoForm,
  validarDadosEmpresa,
  salvarDadosEmpresa,
} from "@/lib/empresa";
import { atualizarCertificadoFocusNfe } from "@/lib/focusnfe";
import { registrarLog } from "@/lib/auditoria";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export interface EmpresaState {
  error?: string;
  success?: boolean;
}

export interface BuscarCnpjState {
  error?: string;
  dados?: DadosCnpj;
}

export async function buscarDadosCnpjAction(
  _prevState: BuscarCnpjState,
  formData: FormData,
): Promise<BuscarCnpjState> {
  const cnpj = formData.get("cnpj") as string;

  if (!cnpj) {
    return { error: "Informe um CNPJ." };
  }

  try {
    const dados = await buscarDadosCnpj(cnpj);
    return { dados };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Não foi possível buscar o CNPJ.",
    };
  }
}

export async function salvarEmpresa(
  _prevState: EmpresaState,
  formData: FormData,
): Promise<EmpresaState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const dados = lerDadosEmpresaDoForm(formData);
  const erroValidacao = validarDadosEmpresa(dados);
  if (erroValidacao) return { error: erroValidacao };

  let resultado;
  try {
    resultado = await salvarDadosEmpresa(session.user.id, dados);
  } catch (err) {
    return {
      error:
        err instanceof Error
          ? `Não foi possível salvar a empresa: ${err.message}`
          : "Não foi possível salvar a empresa. Tente novamente.",
    };
  }
  if (resultado.error) return { error: resultado.error };

  revalidatePath("/dashboard/empresa");
  return { success: true };
}

export interface CertificadoState {
  error?: string;
  success?: boolean;
}

export async function enviarCertificadoDigital(
  _prevState: CertificadoState,
  formData: FormData,
): Promise<CertificadoState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const empresa = await prisma.empresa.findFirst({
    where: { userId: session.user.id },
  });
  if (!empresa) redirect("/onboarding");

  if (empresa.regimeTributario === "MEI") {
    return {
      error:
        "Empresas MEI emitem pela NFS-e Nacional e não usam certificado digital A1 aqui.",
    };
  }

  if (!empresa.focusNfeEmpresaId) {
    return {
      error:
        "Essa empresa foi cadastrada antes desse recurso existir e ainda não tem um id na Focus NFe. Fale com o suporte.",
    };
  }

  const senha = formData.get("senha") as string;
  const arquivo = formData.get("certificado") as File | null;

  if (!arquivo || arquivo.size === 0) {
    return { error: "Selecione o arquivo do certificado (.pfx ou .p12)." };
  }
  if (!senha) {
    return { error: "Informe a senha do certificado." };
  }

  const masterToken = process.env.FOCUS_NFE_MASTER_TOKEN;
  if (!masterToken) {
    return { error: "Configuração da plataforma incompleta. Fale com o suporte." };
  }

  try {
    const bytes = await arquivo.arrayBuffer();
    const certificadoBase64 = Buffer.from(bytes).toString("base64");

    await atualizarCertificadoFocusNfe(masterToken, empresa.focusNfeEmpresaId, {
      certificadoBase64,
      senha,
    });

    await prisma.empresa.update({
      where: { id: empresa.id },
      data: { certificadoDigitalConfigurado: true },
    });

    await registrarLog({
      empresaId: empresa.id,
      userId: session.user.id,
      acao: "empresa.certificado_digital.atualizar",
    });
  } catch (err) {
    return {
      error:
        err instanceof Error
          ? `Não foi possível enviar o certificado: ${err.message}`
          : "Não foi possível enviar o certificado.",
    };
  }

  revalidatePath("/dashboard/empresa");
  return { success: true };
}
