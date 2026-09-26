"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";
import { buscarDadosCnpj, type DadosCnpj } from "@/lib/cnpj";
import { criarEmpresaFocusNfe } from "@/lib/focusnfe";
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

  const razaoSocial = formData.get("razaoSocial") as string;
  const nomeFantasia = (formData.get("nomeFantasia") as string) || null;
  const cnpj = formData.get("cnpj") as string;
  const inscricaoMunicipal = (formData.get("inscricaoMunicipal") as string) || null;
  const regimeTributario = formData.get("regimeTributario") as string;
  const logradouro = (formData.get("logradouro") as string) || null;
  const numero = (formData.get("numero") as string) || null;
  const bairro = (formData.get("bairro") as string) || null;
  const municipio = (formData.get("municipio") as string) || null;
  const municipioCodigoIbge = formData.get("municipioCodigoIbge") as string;
  const uf = formData.get("uf") as string;
  const cep = (formData.get("cep") as string) || null;

  if (!razaoSocial || !cnpj || !regimeTributario || !municipioCodigoIbge || !uf) {
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
  };

  if (empresaExistente) {
    await prisma.empresa.update({
      where: { id: empresaExistente.id },
      data,
    });
  } else {
    const novaEmpresa = await prisma.empresa.create({
      data: { ...data, userId: session.user.id, focusNfeAmbiente: "sandbox" },
    });

    // Cadastra a empresa na Focus NFe automaticamente e guarda o token de
    // homologação cifrado — o usuário nunca vê nada disso.
    const masterToken = process.env.FOCUS_NFE_MASTER_TOKEN;
    if (masterToken) {
      try {
        const resultado = await criarEmpresaFocusNfe(masterToken, {
          razaoSocial,
          nomeFantasia,
          cnpj,
          inscricaoMunicipal,
          regimeTributario,
          logradouro,
          numero,
          bairro,
          municipio,
          uf,
          cep,
        });

        await prisma.empresa.update({
          where: { id: novaEmpresa.id },
          data: { focusNfeTokenEncrypted: encrypt(resultado.token_homologacao) },
        });
      } catch (err) {
        return {
          error:
            err instanceof Error
              ? `Empresa salva, mas houve um problema ao configurar a emissão de notas: ${err.message}`
              : "Empresa salva, mas houve um problema ao configurar a emissão de notas.",
        };
      }
    }
  }

  revalidatePath("/dashboard/empresa");
  return { success: true };
}
