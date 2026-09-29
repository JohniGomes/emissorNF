-- Additive-only: campos opcionais para NFS-e clássica (empresas não-MEI).
ALTER TABLE "Nota" ADD COLUMN "itemListaServico" TEXT;
ALTER TABLE "Nota" ADD COLUMN "codigoNbs" TEXT;
