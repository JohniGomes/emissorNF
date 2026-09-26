import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { WizardSteps } from "@/components/wizard-steps";
import { PagamentoForm } from "./pagamento-form";
import { getPlano } from "@/lib/planos";

export default async function OnboardingPagamentoPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const empresa = await prisma.empresa.findFirst({
    where: { userId: session.user.id },
  });
  if (!empresa) redirect("/onboarding");
  if (empresa.assinaturaAtiva) redirect("/dashboard");
  if (!empresa.planoId || !empresa.cicloCobranca) redirect("/onboarding/plano");

  const plano = getPlano(empresa.planoId);
  const ciclo = empresa.cicloCobranca as "mensal" | "anual";
  const preco = plano ? (ciclo === "mensal" ? plano.precoMensal : plano.precoAnual) : 0;

  return (
    <div>
      <WizardSteps atual={3} />
      <h1 className="mb-6 text-center text-xl font-semibold text-gray-900">
        Pagamento
      </h1>

      <div className="mx-auto grid max-w-xl gap-6 sm:grid-cols-[1fr_1.4fr]">
        <div>
          <h2 className="text-sm font-medium text-gray-500">Resumo da assinatura</h2>
          <p className="mt-2 text-lg font-semibold text-gray-900">{plano?.nome}</p>
          <p className="text-sm text-gray-500">
            {ciclo === "mensal" ? "Cobrança mensal" : "Cobrança anual"}
          </p>
          <p className="mt-4 text-2xl font-bold text-gray-900">
            {preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
        </div>

        <PagamentoForm ciclo={ciclo} />
      </div>
    </div>
  );
}
