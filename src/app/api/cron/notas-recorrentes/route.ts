import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { emitirNotaParaEmpresa } from "@/lib/emissao";
import { hojeDiaDoMesBrasil, anoMesAtualBrasil } from "@/lib/timezone";
import { registrarLog } from "@/lib/auditoria";

/**
 * Disparado diariamente pelo Vercel Cron (ver vercel.json).
 * Emite as NotaRecorrente cujo dia do mês bate com hoje e que ainda não
 * rodaram neste mês/ano (idempotente caso o cron dispare mais de uma vez).
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const diaHoje = hojeDiaDoMesBrasil();
  const { ano, mes } = anoMesAtualBrasil();

  const candidatas = await prisma.notaRecorrente.findMany({
    where: { ativo: true, diaDoMes: diaHoje },
    include: { empresa: true, cliente: true },
  });

  const pendentes = candidatas.filter((r) => {
    if (!r.ultimaExecucao) return true;
    const execucao = new Date(r.ultimaExecucao);
    return execucao.getUTCFullYear() !== ano || execucao.getUTCMonth() + 1 !== mes;
  });

  let sucesso = 0;
  let falhas = 0;
  const detalhes: Array<{ id: string; ok: boolean; erro?: string }> = [];

  for (const recorrente of pendentes) {
    try {
      if (!recorrente.empresa.focusNfeTokenEncrypted) {
        throw new Error("Empresa sem token da Focus NFe configurado.");
      }

      await emitirNotaParaEmpresa({
        empresa: recorrente.empresa,
        cliente: recorrente.cliente,
        descricaoServico: recorrente.descricaoServico,
        valor: Number(recorrente.valor),
        notaRecorrenteId: recorrente.id,
        codigoTributacaoNacionalIss: recorrente.codigoTributacaoNacionalIss ?? undefined,
      });

      const mesesRestantes =
        recorrente.mesesRestantes !== null ? recorrente.mesesRestantes - 1 : null;

      await prisma.notaRecorrente.update({
        where: { id: recorrente.id },
        data: {
          ultimaExecucao: new Date(),
          mesesRestantes,
          // Chegou a zero: essa era a última emissão programada, desativa sozinha.
          ativo: mesesRestantes === null || mesesRestantes > 0,
        },
      });

      await registrarLog({
        empresaId: recorrente.empresaId,
        acao: "nota_recorrente.emitir",
        entidadeId: recorrente.id,
        detalhes: { mesesRestantes },
      });

      sucesso += 1;
      detalhes.push({ id: recorrente.id, ok: true });
    } catch (err) {
      falhas += 1;
      const mensagem = err instanceof Error ? err.message : "Erro desconhecido.";
      detalhes.push({ id: recorrente.id, ok: false, erro: mensagem });
    }
  }

  return NextResponse.json({
    processadas: pendentes.length,
    sucesso,
    falhas,
    detalhes,
  });
}
