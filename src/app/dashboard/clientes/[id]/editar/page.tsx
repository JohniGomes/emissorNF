import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { EditarClienteForm } from "./editar-cliente-form";

export default async function EditarClientePage({
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
  const cliente = await prisma.cliente.findFirst({
    where: { id, empresaId: empresa.id },
  });
  if (!cliente) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Editar cliente</h1>
      <EditarClienteForm cliente={cliente} />
    </div>
  );
}
