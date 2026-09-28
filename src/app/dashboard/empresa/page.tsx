import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { EmpresaForm } from "./empresa-form";
import { CertificadoDigitalForm } from "./certificado-digital-form";

export default async function EmpresaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const empresa = await prisma.empresa.findFirst({
    where: { userId: session.user.id },
  });

  if (!empresa) redirect("/onboarding");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Sua empresa</h1>

      <EmpresaForm
        defaultValues={{
          razaoSocial: empresa.razaoSocial,
          nomeFantasia: empresa.nomeFantasia,
          cnpj: empresa.cnpj,
          telefone: empresa.telefone,
          celular: empresa.celular,
          inscricaoMunicipal: empresa.inscricaoMunicipal,
          regimeTributario: empresa.regimeTributario,
          logradouro: empresa.logradouro,
          numero: empresa.numero,
          complemento: empresa.complemento,
          bairro: empresa.bairro,
          municipio: empresa.municipio,
          municipioCodigoIbge: empresa.municipioCodigoIbge,
          cep: empresa.cep,
          uf: empresa.uf,
          codigoOpcaoSimplesNacional: empresa.codigoOpcaoSimplesNacional,
          regimeEspecialTributacao: empresa.regimeEspecialTributacao,
        }}
      />

      <CertificadoDigitalForm jaConfigurado={empresa.certificadoDigitalConfigurado} />
    </div>
  );
}
