import type { Empresa, Cliente, Nota } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { FocusNfeClient, type EmitirNfsePayload } from "@/lib/focusnfe";

interface EmitirNotaParaEmpresaParams {
  empresa: Empresa;
  cliente: Cliente;
  descricaoServico: string;
  valor: number;
  notaRecorrenteId?: string;
}

/**
 * Cria a Nota, chama a Focus NFe e grava o resultado. Usada tanto pela emissão
 * avulsa (formulário) quanto pelo cron de notas recorrentes — mantém a mesma
 * lógica de payload/erro nos dois fluxos.
 */
export async function emitirNotaParaEmpresa({
  empresa,
  cliente,
  descricaoServico,
  valor,
  notaRecorrenteId,
}: EmitirNotaParaEmpresaParams): Promise<Nota> {
  if (!empresa.focusNfeTokenEncrypted) {
    throw new Error("Empresa sem token da Focus NFe configurado.");
  }

  if (empresa.regimeTributario === "MEI") {
    // MEI é obrigado a emitir pelo padrão NFS-e Nacional (DPS), que tem um
    // payload diferente da NFS-e clássica usada abaixo. Ainda não implementado.
    throw new Error(
      "Emissão para empresas MEI (NFS-e Nacional) ainda não está disponível — em breve.",
    );
  }

  const nota = await prisma.nota.create({
    data: {
      empresaId: empresa.id,
      clienteId: cliente.id,
      descricaoServico,
      valor,
      status: "PROCESSANDO",
      notaRecorrenteId,
    },
  });

  const payload: EmitirNfsePayload = {
    data_emissao: new Date().toISOString(),
    prestador: {
      cnpj: empresa.cnpj,
      inscricao_municipal: empresa.inscricaoMunicipal ?? undefined,
    },
    tomador: {
      cnpj_cpf: cliente.documento,
      razao_social: cliente.nome,
      email: cliente.email ?? undefined,
      endereco: {
        logradouro: cliente.logradouro ?? undefined,
        numero: cliente.numero ?? undefined,
        bairro: cliente.bairro ?? undefined,
        codigo_municipio: empresa.municipioCodigoIbge,
        uf: cliente.uf ?? undefined,
        cep: cliente.cep ?? undefined,
      },
    },
    servico: {
      discriminacao: descricaoServico,
      valor_servicos: valor,
    },
  };

  try {
    const token = decrypt(empresa.focusNfeTokenEncrypted);
    const client = new FocusNfeClient({
      token,
      ambiente: empresa.focusNfeAmbiente === "producao" ? "producao" : "sandbox",
    });

    const resposta = await client.emitirNfse(nota.id, payload);

    const statusFinal =
      resposta.status === "erro_autorizacao" || resposta.erros?.length
        ? "ERRO"
        : "PROCESSANDO";

    return await prisma.nota.update({
      where: { id: nota.id },
      data: {
        status: statusFinal,
        numero: resposta.numero,
        codigoVerificacao: resposta.codigo_verificacao,
        linkPdf: resposta.url,
        respostaApi: JSON.parse(JSON.stringify(resposta)),
        erro: resposta.erros?.map((e) => e.mensagem).join("; "),
      },
    });
  } catch (err) {
    return await prisma.nota.update({
      where: { id: nota.id },
      data: {
        status: "ERRO",
        erro: err instanceof Error ? err.message : "Erro desconhecido ao emitir nota.",
      },
    });
  }
}
