-- CreateIndex
CREATE INDEX "Cliente_empresaId_idx" ON "Cliente"("empresaId");

-- CreateIndex
CREATE INDEX "Empresa_userId_idx" ON "Empresa"("userId");

-- CreateIndex
CREATE INDEX "Nota_empresaId_idx" ON "Nota"("empresaId");

-- CreateIndex
CREATE INDEX "Nota_clienteId_idx" ON "Nota"("clienteId");

-- CreateIndex
CREATE INDEX "Nota_notaRecorrenteId_idx" ON "Nota"("notaRecorrenteId");

-- CreateIndex
CREATE INDEX "Nota_status_idx" ON "Nota"("status");

-- CreateIndex
CREATE INDEX "NotaRecorrente_empresaId_idx" ON "NotaRecorrente"("empresaId");

-- CreateIndex
CREATE INDEX "NotaRecorrente_clienteId_idx" ON "NotaRecorrente"("clienteId");

-- CreateIndex
CREATE INDEX "Servico_empresaId_idx" ON "Servico"("empresaId");
