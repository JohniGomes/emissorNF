import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";

export default function BloqueadoPage() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-cream text-3xl">
        🙁
      </div>
      <h1 className="mb-2 text-xl font-semibold text-gray-900">
        Não podemos te atender agora
      </h1>
      <p className="max-w-sm text-sm text-gray-600">
        Para utilizar o Notarium é necessário ter uma empresa formalizada e
        com CNPJ ativo.
      </p>
      <p className="mt-2 max-w-sm text-sm text-gray-600">
        Volte após abrir sua empresa, será um prazer ter você conosco!
      </p>

      <div className="mt-8 flex gap-3">
        <Link
          href="/onboarding"
          className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Voltar para tela anterior
        </Link>
        <SignOutButton />
      </div>
    </div>
  );
}
