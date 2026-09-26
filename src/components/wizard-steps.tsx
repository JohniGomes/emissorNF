const steps = ["Dados da sua empresa", "Escolha seu plano", "Pagamento"];

export function WizardSteps({ atual }: { atual: 1 | 2 | 3 }) {
  return (
    <div className="mb-8 flex items-center justify-center gap-3 text-sm">
      {steps.map((label, index) => {
        const numero = index + 1;
        const ativo = numero === atual;
        const concluido = numero < atual;

        return (
          <div key={label} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                  ativo || concluido
                    ? "btn-gradient text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {numero}
              </span>
              <span
                className={ativo ? "font-medium text-gray-900" : "text-gray-500"}
              >
                {label}
              </span>
            </div>
            {numero < steps.length && (
              <div className="h-px w-8 bg-gray-200 sm:w-16" />
            )}
          </div>
        );
      })}
    </div>
  );
}
