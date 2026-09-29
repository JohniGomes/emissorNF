import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

interface RegistrarLogParams {
  empresaId?: string | null;
  userId?: string | null;
  acao: string;
  entidadeId?: string | null;
  detalhes?: Record<string, unknown>;
}

/**
 * Registra um evento na trilha de auditoria. Nunca deve lançar erro para o
 * chamador - um problema no log não pode derrubar a operação de negócio que
 * está sendo auditada.
 */
export async function registrarLog({
  empresaId,
  userId,
  acao,
  entidadeId,
  detalhes,
}: RegistrarLogParams): Promise<void> {
  try {
    await prisma.logAuditoria.create({
      data: {
        empresaId,
        userId,
        acao,
        entidadeId,
        detalhes: detalhes as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (err) {
    console.error("Falha ao registrar log de auditoria:", acao, err);
  }
}
