import { NextRequest, NextResponse } from "next/server";

/**
 * Disparado diariamente pelo Vercel Cron (ver vercel.json).
 * Verifica quais NotaRecorrente devem gerar uma Nota hoje e as emite.
 * Implementação da lógica de emissão fica para a próxima fase.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // TODO: buscar NotaRecorrente com diaDoMes === hoje e ativo === true,
  // emitir cada uma via FocusNfeClient e gravar o resultado em Nota.

  return NextResponse.json({ ok: true });
}
