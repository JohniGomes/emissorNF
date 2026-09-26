"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function escolherPlano(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const empresa = await prisma.empresa.findFirst({
    where: { userId: session.user.id },
  });
  if (!empresa) redirect("/onboarding");

  const planoId = formData.get("planoId") as string;
  const cicloCobranca = formData.get("cicloCobranca") as string;

  await prisma.empresa.update({
    where: { id: empresa.id },
    data: { planoId, cicloCobranca },
  });

  redirect("/onboarding/pagamento");
}
