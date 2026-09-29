import { NovoServicoForm } from "./novo-servico-form";

export default function NovoServicoPage() {
  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold text-gray-900">Novo serviço</h1>
      <p className="mb-6 text-sm text-gray-500">
        Escolha o código de tributação nacional do serviço que você presta (e o NBS, se
        aplicável), adicione à lista com "+" e repita quantas vezes precisar antes de
        salvar tudo de uma vez.
      </p>
      <NovoServicoForm />
    </div>
  );
}
