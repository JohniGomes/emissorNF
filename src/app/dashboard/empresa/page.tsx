import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { EmpresaForm } from "./empresa-form";

export default async function EmpresaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const empresa = await prisma.empresa.findFirst({
    where: { userId: session.user.id },
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-gray-900">
        {empresa ? "Sua empresa" : "Cadastre sua empresa"}
      </h1>

      <EmpresaForm
        defaultValues={
          empresa
            ? {
                razaoSocial: empresa.razaoSocial,
                nomeFantasia: empresa.nomeFantasia,
                cnpj: empresa.cnpj,
                inscricaoMunicipal: empresa.inscricaoMunicipal,
                regimeTributario: empresa.regimeTributario,
                municipioCodigoIbge: empresa.municipioCodigoIbge,
                uf: empresa.uf,
              }
            : undefined
        }
      />
    </div>
  );
}
