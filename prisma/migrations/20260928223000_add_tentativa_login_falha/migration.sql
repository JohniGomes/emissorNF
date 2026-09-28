-- CreateTable
CREATE TABLE "TentativaLoginFalha" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TentativaLoginFalha_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TentativaLoginFalha_email_createdAt_idx" ON "TentativaLoginFalha"("email", "createdAt");
