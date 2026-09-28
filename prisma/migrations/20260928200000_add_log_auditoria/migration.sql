-- CreateTable
CREATE TABLE "LogAuditoria" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT,
    "userId" TEXT,
    "acao" TEXT NOT NULL,
    "entidadeId" TEXT,
    "detalhes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogAuditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LogAuditoria_empresaId_idx" ON "LogAuditoria"("empresaId");

-- CreateIndex
CREATE INDEX "LogAuditoria_acao_idx" ON "LogAuditoria"("acao");

-- CreateIndex
CREATE INDEX "LogAuditoria_createdAt_idx" ON "LogAuditoria"("createdAt");

-- AddForeignKey
ALTER TABLE "LogAuditoria" ADD CONSTRAINT "LogAuditoria_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
