-- AlterTable Cliente
ALTER TABLE "Cliente" ADD COLUMN "nomeFantasia" TEXT;
ALTER TABLE "Cliente" ADD COLUMN "telefone" TEXT;
ALTER TABLE "Cliente" ADD COLUMN "whatsapp" TEXT;
ALTER TABLE "Cliente" ADD COLUMN "complemento" TEXT;
ALTER TABLE "Cliente" ADD COLUMN "municipioCodigoIbge" TEXT;
ALTER TABLE "Cliente" ADD COLUMN "inscricaoMunicipal" TEXT;
ALTER TABLE "Cliente" ADD COLUMN "inscricaoEstadual" TEXT;

-- AlterTable Servico
ALTER TABLE "Servico" ADD COLUMN "nome" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Servico" ADD COLUMN "ativo" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Servico" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable Nota
ALTER TABLE "Nota" ADD COLUMN "servicoId" TEXT;
ALTER TABLE "Nota" ADD COLUMN "desconto" DECIMAL(12,2);
ALTER TABLE "Nota" ADD COLUMN "dataCompetencia" TIMESTAMP(3);
ALTER TABLE "Nota" ADD COLUMN "observacoes" TEXT;
ALTER TABLE "Nota" ADD CONSTRAINT "Nota_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "Servico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable NotaRecorrente
ALTER TABLE "NotaRecorrente" ADD COLUMN "servicoId" TEXT;
ALTER TABLE "NotaRecorrente" ADD COLUMN "periodicidade" TEXT NOT NULL DEFAULT 'MENSAL';
ALTER TABLE "NotaRecorrente" ADD COLUMN "primeiraEmissao" TIMESTAMP(3);
ALTER TABLE "NotaRecorrente" ADD CONSTRAINT "NotaRecorrente_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "Servico"("id") ON DELETE SET NULL ON UPDATE CASCADE;
