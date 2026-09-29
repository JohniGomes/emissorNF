import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registrarLog } from "@/lib/auditoria";
import { formatarErroParaNota } from "@/lib/erros-fiscais";
import type { StatusNota } from "@prisma/client";

interface FocusWebhookPayload {
  ref?: string;
  status?: string;
  numero?: string;
  codigo_verificacao?: string;
  url?: string;
  mensagem_sefaz?: string;
  erros?: Array<{ codigo: string; mensagem: string }>;
  [key: string]: unknown;
}

function mapStatus(status?: string): StatusNota | null {
  switch (status) {
    case "autorizado":
      return "AUTORIZADA";
    case "cancelado":
      return "CANCELADA";
    case "erro_autorizacao":
      return "ERRO";
    case "processando_autorizacao":
      return "PROCESSANDO";
    default:
      return null;
  }
}

// Estados finais: uma vez chegados, ignoramos um webhook atrasado/fora de
// ordem que tentasse "voltar" a nota para um estado anterior.
const ESTADOS_FINAIS: StatusNota[] = ["AUTORIZADA", "ERRO", "CANCELADA"];

/**
 * Recebe as notificações assíncronas da Focus NFe (autorização, erro,
 * cancelamento) em vez de depender só do retorno síncrono da emissão.
 * A URL deve ser cadastrada no painel da Focus com o query param `token`
 * batendo com FOCUS_NFE_WEBHOOK_SECRET - a Focus não assina o webhook,
 * então esse token é a única forma de confirmar que a chamada é legítima.
 */
export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const secretConfigurado = process.env.FOCUS_NFE_WEBHOOK_SECRET;

  if (!secretConfigurado || token !== secretConfigurado) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let payload: FocusWebhookPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  await registrarLog({
    acao: "webhook.focusnfe.recebido",
    entidadeId: payload.ref,
    detalhes: { status: payload.status },
  });

  if (!payload.ref) {
    return NextResponse.json({ error: "missing_ref" }, { status: 400 });
  }

  const nota = await prisma.nota.findUnique({ where: { id: payload.ref } });
  if (!nota) {
    // Referência desconhecida: pode ser de outro ambiente/teste. Respondemos
    // 200 para a Focus não ficar reenviando indefinidamente, só registramos.
    await registrarLog({
      acao: "webhook.focusnfe.nota_nao_encontrada",
      entidadeId: payload.ref,
    });
    return NextResponse.json({ ok: true });
  }

  if (ESTADOS_FINAIS.includes(nota.status)) {
    // Nota já está num estado final - evita que um webhook atrasado ou
    // duplicado sobrescreva um resultado já consolidado.
    return NextResponse.json({ ok: true, ignorado: "estado_final_ja_atingido" });
  }

  const statusNovo = mapStatus(payload.status);
  if (!statusNovo) {
    await registrarLog({
      empresaId: nota.empresaId,
      acao: "webhook.focusnfe.status_desconhecido",
      entidadeId: nota.id,
      detalhes: { status: payload.status },
    });
    return NextResponse.json({ ok: true, ignorado: "status_desconhecido" });
  }

  await prisma.nota.update({
    where: { id: nota.id },
    data: {
      status: statusNovo,
      numero: payload.numero ?? nota.numero,
      codigoVerificacao: payload.codigo_verificacao ?? nota.codigoVerificacao,
      linkPdf: payload.url ?? nota.linkPdf,
      erro:
        statusNovo === "ERRO"
          ? formatarErroParaNota(
              payload.erros?.map((e) => e.mensagem).join("; ") ||
                payload.mensagem_sefaz ||
                "Erro não especificado pelo provedor fiscal.",
            )
          : null,
      respostaApi: JSON.parse(JSON.stringify(payload)),
    },
  });

  await registrarLog({
    empresaId: nota.empresaId,
    acao: "webhook.focusnfe.status_atualizado",
    entidadeId: nota.id,
    detalhes: { statusAnterior: nota.status, statusNovo },
  });

  return NextResponse.json({ ok: true });
}
