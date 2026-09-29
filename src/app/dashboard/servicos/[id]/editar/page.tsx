import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { atualizarServico } from "../../actions";
import { ServicoForm } from "../../servico-form";

export default async function EditarServicoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const empresa = await prisma.empresa.findFirst({
    where: { userId: session.user.id },
  });
  if (!empresa) redirect("/dashboard/empresa");

  const { id } = await params;
  const servico = await prisma.servico.findFirst({
    where: { id, empresaId: empresa.id },
  });
  if (!servico) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Editar serviço</h1>
      <ServicoForm
        action={atualizarServico.bind(null, servico.id)}
        defaultValues={{
          nome: servico.nome,
          descricao: servico.descricao,
          valor: Number(servico.valor),
        }}
        textoBotao="Salvar alterações"
      />
    </div>
  );
}
