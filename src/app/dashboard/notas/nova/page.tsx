import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { NotaForm } from "./nota-form";

export default async function NovaNotaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const empresa = await prisma.empresa.findFirst({
    where: { userId: session.user.id },
  });
  if (!empresa) redirect("/dashboard/empresa");

  const clientes = await prisma.cliente.findMany({
    where: { empresaId: empresa.id },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true, documento: true },
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Emitir nota</h1>
      <NotaForm clientes={clientes} />
    </div>
  );
}
