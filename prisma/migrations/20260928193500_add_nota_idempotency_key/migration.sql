-- AlterTable
ALTER TABLE "Nota" ADD COLUMN "idempotencyKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Nota_idempotencyKey_key" ON "Nota"("idempotencyKey");
