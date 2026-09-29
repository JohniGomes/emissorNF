import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { NotaForm } from "./nota-form";

export default async function NovaNotaPage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string; descricao?: string; valor?: string }>;
}) {
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

  const servicos = await prisma.servico.findMany({
    where: { empresaId: empresa.id, ativo: true },
    orderBy: { nome: "asc" },
    select: {
      id: true,
      nome: true,
      descricao: true,
      valor: true,
      codigoTributacaoNacional: true,
      codigoNbs: true,
    },
  });

  const { clienteId, descricao, valor } = await searchParams;
  // "Emitir novamente" preenche a partir de uma nota anterior - só se o
  // cliente ainda existir na carteira da empresa (nunca confiamos no id vindo
  // da URL sem confirmar que ele pertence a este usuário).
  const clienteValido =
    clienteId && clientes.some((c) => c.id === clienteId) ? clienteId : undefined;

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Emitir nota</h1>
      <NotaForm
        clientes={clientes}
        servicos={servicos.map((s) => ({ ...s, valor: Number(s.valor) }))}
        ehMei={empresa.regimeTributario === "MEI"}
        nomeEmpresa={empresa.razaoSocial}
        defaultValues={{
          clienteId: clienteValido,
          descricaoServico: descricao,
          valor: valor,
        }}
      />
    </div>
  );
}
