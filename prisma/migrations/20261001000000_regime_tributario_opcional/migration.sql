-- Relaxa a constraint: regime tributário passa a ser opcional até ser
-- identificado automaticamente (pelo CNPJ) ou confirmado manualmente.
ALTER TABLE "Empresa" ALTER COLUMN "regimeTributario" DROP NOT NULL;
