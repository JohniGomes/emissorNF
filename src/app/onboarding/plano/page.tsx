import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { WizardSteps } from "@/components/wizard-steps";
import { PlanoSelector } from "./plano-selector";
import { PLANOS } from "@/lib/planos";

export default async function OnboardingPlanoPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const empresa = await prisma.empresa.findFirst({
    where: { userId: session.user.id },
  });
  if (!empresa) redirect("/onboarding");
  if (empresa.assinaturaAtiva) redirect("/dashboard");

  return (
    <div>
      <WizardSteps atual={2} />
      <h1 className="mb-6 text-center text-xl font-semibold text-gray-900">
        Escolha seu plano
      </h1>
      <PlanoSelector planos={PLANOS} />
    </div>
  );
}
