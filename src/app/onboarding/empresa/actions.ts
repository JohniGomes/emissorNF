"use server";

import { auth } from "@/lib/auth";
import { buscarDadosCnpj, type DadosCnpj } from "@/lib/cnpj";
import {
  lerDadosEmpresaDoForm,
  validarDadosEmpresa,
  salvarDadosEmpresa,
} from "@/lib/empresa";
import { redirect } from "next/navigation";
import { sanitizarMensagemExibicao } from "@/lib/erros-fiscais";

export interface EmpresaOnboardingState {
  error?: string;
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

export async function salvarEmpresaOnboarding(
  _prevState: EmpresaOnboardingState,
  formData: FormData,
): Promise<EmpresaOnboardingState> {
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
          ? `Não foi possível salvar a empresa: ${sanitizarMensagemExibicao(err.message)}`
          : "Não foi possível salvar a empresa. Tente novamente.",
    };
  }
  if (resultado.error) return { error: resultado.error };

  redirect("/onboarding/plano");
}
