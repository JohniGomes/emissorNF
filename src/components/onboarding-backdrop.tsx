import { Sidebar } from "@/components/sidebar";
import { HelpCircle, Bell } from "lucide-react";

/**
 * Fundo "fantasma" do dashboard, mostrado apagado atrás do modal de
 * onboarding — mesma sidebar de verdade, sem interatividade, só pra dar a
 * sensação de "é isso que você vai acessar assim que terminar".
 */
export function OnboardingBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 flex select-none opacity-50 grayscale"
    >
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-end gap-2 border-b border-gray-200 bg-white px-6 py-3">
          <HelpCircle size={20} className="text-brand-dark" />
          <Bell size={20} className="text-brand-dark" />
          <div className="h-9 w-9 rounded-full bg-brand-brown" />
        </div>
        <div className="flex-1 space-y-4 bg-brand-cream p-8">
          <div className="h-6 w-56 rounded bg-gray-300/70" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 rounded-lg border border-gray-200 bg-white" />
            <div className="h-24 rounded-lg border border-gray-200 bg-white" />
          </div>
          <div className="h-24 rounded-lg border border-dashed border-gray-300 bg-white" />
        </div>
      </div>
    </div>
  );
}
