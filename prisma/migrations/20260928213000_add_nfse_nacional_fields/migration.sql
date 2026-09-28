-- AlterTable
ALTER TABLE "Empresa" ADD COLUMN "codigoOpcaoSimplesNacional" TEXT;
ALTER TABLE "Empresa" ADD COLUMN "regimeEspecialTributacao" TEXT;
ALTER TABLE "Empresa" ADD COLUMN "proximoNumeroDps" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Nota" ADD COLUMN "codigoTributacaoNacionalIss" TEXT;
