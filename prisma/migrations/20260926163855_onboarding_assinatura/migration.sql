-- AlterTable
ALTER TABLE "Empresa" ADD COLUMN     "assinaturaAtiva" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "bairro" TEXT,
ADD COLUMN     "celular" TEXT,
ADD COLUMN     "cicloCobranca" TEXT,
ADD COLUMN     "complemento" TEXT,
ADD COLUMN     "logradouro" TEXT,
ADD COLUMN     "numero" TEXT,
ADD COLUMN     "planoId" TEXT,
ADD COLUMN     "telefone" TEXT;
