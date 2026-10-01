import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { WizardSteps } from "@/components/wizard-steps";
import { CertificadoOnboardingForm } from "./certificado-form";

export default async function OnboardingCertificadoPage() {
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
      <h1 className="mb-2 text-center text-xl font-semibold text-gray-900">
        Anexe seu certificado digital
      </h1>
      <p className="mb-6 text-center text-sm text-gray-500">
        Necessário pra emitir notas, mas você pode pular e enviar depois em "Sua empresa".
      </p>
      <CertificadoOnboardingForm jaConfigurado={empresa.certificadoDigitalConfigurado} />
    </div>
  );
}
