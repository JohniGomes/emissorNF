import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { WizardSteps } from "@/components/wizard-steps";
import { OnboardingEmpresaForm } from "./empresa-form";

export default async function OnboardingEmpresaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const empresa = await prisma.empresa.findFirst({
    where: { userId: session.user.id },
  });
  if (empresa?.assinaturaAtiva) redirect("/dashboard");

  return (
    <div>
      <WizardSteps atual={1} />
      <h1 className="mb-6 text-center text-xl font-semibold text-gray-900">
        Dados da sua empresa
      </h1>
      <OnboardingEmpresaForm
        defaultValues={
          empresa
            ? {
                cnpj: empresa.cnpj,
                razaoSocial: empresa.razaoSocial,
                nomeFantasia: empresa.nomeFantasia,
                telefone: empresa.telefone,
                celular: empresa.celular,
                cep: empresa.cep,
                logradouro: empresa.logradouro,
                numero: empresa.numero,
                complemento: empresa.complemento,
                bairro: empresa.bairro,
                municipio: empresa.municipio,
                uf: empresa.uf,
                municipioCodigoIbge: empresa.municipioCodigoIbge,
                regimeTributario: empresa.regimeTributario,
                inscricaoMunicipal: empresa.inscricaoMunicipal,
              }
            : undefined
        }
      />
    </div>
  );
}
