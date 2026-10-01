import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ImportarNotasForm } from "./importar-notas-form";

export default async function ImportarNotasPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const empresa = await prisma.empresa.findFirst({
    where: { userId: session.user.id },
  });
  if (!empresa) redirect("/dashboard/empresa");

  const servicos = await prisma.servico.findMany({
    where: { empresaId: empresa.id, ativo: true },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true, descricao: true, codigoTributacaoNacional: true },
  });

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold text-gray-900">Importar notas em lote</h1>
      <p className="mb-6 text-sm text-gray-500">
        Suba uma planilha (CSV) com uma linha por nota - por exemplo, o relatório de
        comissões por marca de um programa de afiliados - e emita várias notas de uma vez,
        todas com o mesmo serviço e competência.
      </p>

      {servicos.length === 0 ? (
        <p className="text-sm text-gray-500">
          Cadastre pelo menos um serviço em "Meus Serviços" antes de importar notas em lote.
        </p>
      ) : (
        <ImportarNotasForm
          servicos={servicos}
          ehMei={empresa.regimeTributario === "MEI"}
        />
      )}
    </div>
  );
}
