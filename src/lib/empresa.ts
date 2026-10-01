import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";
import { criarEmpresaFocusNfe } from "@/lib/focusnfe";
import { sanitizarMensagemExibicao } from "@/lib/erros-fiscais";

function ehCnpjDuplicado(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2002" &&
    Array.isArray(err.meta?.target) &&
    err.meta.target.includes("cnpj")
  );
}

export interface DadosEmpresaForm {
  razaoSocial: string;
  nomeFantasia: string | null;
  cnpj: string;
  telefone: string | null;
  celular: string | null;
  inscricaoMunicipal: string | null;
  regimeTributario: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  municipio: string | null;
  municipioCodigoIbge: string;
  uf: string;
  cep: string | null;
  codigoOpcaoSimplesNacional: string | null;
  regimeEspecialTributacao: string | null;
}

export function lerDadosEmpresaDoForm(formData: FormData): DadosEmpresaForm {
  return {
    razaoSocial: formData.get("razaoSocial") as string,
    nomeFantasia: (formData.get("nomeFantasia") as string) || null,
    cnpj: formData.get("cnpj") as string,
    telefone: (formData.get("telefone") as string) || null,
    celular: (formData.get("celular") as string) || null,
    inscricaoMunicipal: (formData.get("inscricaoMunicipal") as string) || null,
    regimeTributario: (formData.get("regimeTributario") as string) || null,
    logradouro: (formData.get("logradouro") as string) || null,
    numero: (formData.get("numero") as string) || null,
    complemento: (formData.get("complemento") as string) || null,
    bairro: (formData.get("bairro") as string) || null,
    municipio: (formData.get("municipio") as string) || null,
    municipioCodigoIbge: formData.get("municipioCodigoIbge") as string,
    uf: formData.get("uf") as string,
    cep: (formData.get("cep") as string) || null,
    codigoOpcaoSimplesNacional:
      (formData.get("codigoOpcaoSimplesNacional") as string) || null,
    regimeEspecialTributacao: (formData.get("regimeEspecialTributacao") as string) || null,
  };
}

export function validarDadosEmpresa(dados: DadosEmpresaForm): string | null {
  if (
    !dados.razaoSocial ||
    !dados.nomeFantasia ||
    !dados.cnpj ||
    !dados.municipioCodigoIbge ||
    !dados.uf ||
    !dados.cep ||
    !dados.logradouro ||
    !dados.numero ||
    !dados.bairro
  ) {
    return "Preencha todos os campos obrigatórios, incluindo o endereço completo.";
  }
  return null;
}

/**
 * Cria ou atualiza a Empresa do usuário. Numa criação nova, também cadastra
 * a empresa na Focus NFe automaticamente (token fica cifrado, nunca exposto).
 * Usada tanto no onboarding quanto na edição posterior (dashboard/empresa).
 */
export async function salvarDadosEmpresa(
  userId: string,
  dados: DadosEmpresaForm,
): Promise<{ error?: string; empresaId?: string }> {
  const empresaExistente = await prisma.empresa.findFirst({ where: { userId } });

  const data = {
    razaoSocial: dados.razaoSocial,
    nomeFantasia: dados.nomeFantasia,
    cnpj: dados.cnpj,
    telefone: dados.telefone,
    celular: dados.celular,
    inscricaoMunicipal: dados.inscricaoMunicipal,
    regimeTributario: dados.regimeTributario,
    logradouro: dados.logradouro,
    numero: dados.numero,
    complemento: dados.complemento,
    bairro: dados.bairro,
    municipio: dados.municipio,
    municipioCodigoIbge: dados.municipioCodigoIbge,
    cep: dados.cep,
    uf: dados.uf,
    codigoOpcaoSimplesNacional: dados.codigoOpcaoSimplesNacional,
    regimeEspecialTributacao: dados.regimeEspecialTributacao,
  };

  if (empresaExistente) {
    try {
      await prisma.empresa.update({ where: { id: empresaExistente.id }, data });
    } catch (err) {
      if (ehCnpjDuplicado(err)) {
        return { error: "Este CNPJ já está cadastrado em outra conta." };
      }
      throw err;
    }

    // Empresa já existia sem regime tributário definido (não identificado
    // automaticamente pelo CNPJ) e o usuário acabou de informar agora -
    // só nesse momento dá pra cadastrar na Focus NFe e gerar o token.
    if (!empresaExistente.focusNfeTokenEncrypted && dados.regimeTributario) {
      const erroFocus = await registrarEmpresaNaFocus(empresaExistente.id, dados);
      if (erroFocus) return { empresaId: empresaExistente.id, error: erroFocus };
    }

    return { empresaId: empresaExistente.id };
  }

  let novaEmpresa;
  try {
    novaEmpresa = await prisma.empresa.create({
      data: { ...data, userId, focusNfeAmbiente: "sandbox" },
    });
  } catch (err) {
    if (ehCnpjDuplicado(err)) {
      return { error: "Este CNPJ já está cadastrado em outra conta." };
    }
    throw err;
  }

  if (dados.regimeTributario) {
    const erroFocus = await registrarEmpresaNaFocus(novaEmpresa.id, dados);
    if (erroFocus) return { empresaId: novaEmpresa.id, error: erroFocus };
  }

  return { empresaId: novaEmpresa.id };
}

/**
 * Cadastra a empresa na Focus NFe e salva o token cifrado - só pode
 * acontecer depois que o regime tributário é conhecido, porque a Focus
 * exige esse campo. Retorna uma mensagem de erro (ou undefined se deu certo).
 */
async function registrarEmpresaNaFocus(
  empresaId: string,
  dados: DadosEmpresaForm,
): Promise<string | undefined> {
  const masterToken = process.env.FOCUS_NFE_MASTER_TOKEN;
  if (!masterToken || !dados.regimeTributario) return undefined;

  try {
    const resultado = await criarEmpresaFocusNfe(masterToken, {
      razaoSocial: dados.razaoSocial,
      nomeFantasia: dados.nomeFantasia,
      cnpj: dados.cnpj,
      inscricaoMunicipal: dados.inscricaoMunicipal,
      regimeTributario: dados.regimeTributario,
      logradouro: dados.logradouro,
      numero: dados.numero,
      bairro: dados.bairro,
      municipio: dados.municipio,
      uf: dados.uf,
      cep: dados.cep,
    });

    await prisma.empresa.update({
      where: { id: empresaId },
      data: {
        focusNfeTokenEncrypted: encrypt(resultado.token_homologacao),
        focusNfeEmpresaId: resultado.id,
      },
    });
    return undefined;
  } catch (err) {
    return err instanceof Error
      ? `Empresa salva, mas houve um problema ao configurar a emissão de notas: ${sanitizarMensagemExibicao(err.message)}`
      : "Empresa salva, mas houve um problema ao configurar a emissão de notas.";
  }
}
