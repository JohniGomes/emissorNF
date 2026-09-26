import { Gift } from "lucide-react";

export default function IndiquePage() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-brand-tan bg-white px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-cream text-brand-dark">
        <Gift size={28} />
      </div>
      <h1 className="text-xl font-semibold text-gray-900">Indique e ganhe</h1>
      <p className="mt-2 max-w-sm text-sm text-gray-500">
        Em breve você vai poder indicar o Emissor NFs para outros empreendedores
        e ganhar recompensas. Fique de olho!
      </p>
    </div>
  );
}
