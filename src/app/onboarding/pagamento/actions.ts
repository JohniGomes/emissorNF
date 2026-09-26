"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function confirmarPagamento() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const empresa = await prisma.empresa.findFirst({
    where: { userId: session.user.id },
  });
  if (!empresa) redirect("/onboarding");

  // Mock: sem cobrança real ainda (ASAAS entra numa fase futura).
  // Já marca a assinatura como ativa pra liberar o acesso ao dashboard.
  await prisma.empresa.update({
    where: { id: empresa.id },
    data: { assinaturaAtiva: true },
  });

  redirect("/dashboard");
}
