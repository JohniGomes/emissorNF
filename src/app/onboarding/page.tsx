import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function OnboardingGatePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const empresa = await prisma.empresa.findFirst({
    where: { userId: session.user.id },
  });

  if (empresa) {
    redirect(empresa.assinaturaAtiva ? "/dashboard" : "/onboarding/plano");
  }

  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg btn-gradient text-sm font-bold text-white">
        NF
      </div>
      <h1 className="mb-2 text-xl font-semibold text-gray-900">Emissor NFs</h1>
      <p className="mb-8 max-w-sm text-sm text-gray-600">
        Emita notas fiscais automaticamente para os serviços prestados pela sua
        empresa.
      </p>

      <p className="mb-4 text-sm font-medium text-gray-700">
        Você já possui uma empresa?
      </p>

      <div className="flex gap-3">
        <Link
          href="/onboarding/bloqueado"
          className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Ainda não tenho
        </Link>
        <Link
          href="/onboarding/empresa"
          className="rounded-full btn-gradient px-5 py-2 text-sm font-medium text-white"
        >
          Já tenho uma empresa →
        </Link>
      </div>
    </div>
  );
}
