import { criarServico } from "../actions";
import { ServicoForm } from "../servico-form";

export default function NovoServicoPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Novo serviço</h1>
      <ServicoForm action={criarServico} textoBotao="Salvar serviço" />
    </div>
  );
}
