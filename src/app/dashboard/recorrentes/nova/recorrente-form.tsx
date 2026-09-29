"use client";

import { useState } from "react";
import { useActionState } from "react";
import { criarRecorrente, type RecorrenteState } from "../actions";
import { SeletorCodigoTributacao } from "@/components/seletor-codigo-tributacao";

interface Servico {
  id: string;
  nome: string;
  descricao: string;
  valor: number;
  codigoTributacaoNacional?: string | null;
}

interface RecorrenteFormProps {
  clientes: { id: string; nome: string; documento: string }[];
  servicos: Servico[];
  ehMei: boolean;
}

const initialState: RecorrenteState = {};

type DuracaoOpcao = "12" | "24" | "indefinidamente";

export function RecorrenteForm({ clientes, servicos, ehMei }: RecorrenteFormProps) {
  const [state, formAction, pending] = useActionState(criarRecorrente, initialState);

  const [servicoId, setServicoId] = useState("");
  const [descricaoServico, setDescricaoServico] = useState("");
  const [valor, setValor] = useState("");
  const [duracao, setDuracao] = useState<DuracaoOpcao>("indefinidamente");
  const [codigoTributacaoNacionalIss, setCodigoTributacaoNacionalIss] = useState("");

  function handleSelecionarServico(id: string) {
    setServicoId(id);
    const servico = servicos.find((s) => s.id === id);
    if (servico) {
      setDescricaoServico(servico.descricao);
      if (servico.valor > 0) setValor(servico.valor.toFixed(2).replace(".", ","));
      if (servico.codigoTributacaoNacional && ehMei) {
        setCodigoTributacaoNacionalIss(servico.codigoTributacaoNacional);
      }
    }
  }

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Cliente *</label>
        <select
          name="clienteId"
          required
          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Selecione o cliente</option>
          {clientes.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nome} ({cliente.documento})
            </option>
          ))}
        </select>
      </div>

      {servicos.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Serviço</label>
          <select
            value={servicoId}
            onChange={(e) => handleSelecionarServico(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Digitar manualmente</option>
            {servicos.map((servico) => (
              <option key={servico.id} value={servico.id}>
                {servico.nome}
              </option>
            ))}
          </select>
          <input type="hidden" name="servicoId" value={servicoId} />
          <p className="mt-1 text-xs text-gray-500">
            Preenche a descrição e o valor automaticamente. Você pode ajustar antes de salvar.
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Descrição do serviço *
        </label>
        <textarea
          name="descricaoServico"
          required
          rows={3}
          value={descricaoServico}
          onChange={(e) => setDescricaoServico(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Valor (R$) *</label>
          <input
            name="valor"
            required
            inputMode="decimal"
            placeholder="0,00"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Dia da emissão *</label>
          <input
            name="diaDoMes"
            type="number"
            min={1}
            max={31}
            required
            placeholder="ex: 5"
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Periodicidade</label>
        <select
          disabled
          defaultValue="MENSAL"
          className="mt-1 w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500"
        >
          <option value="MENSAL">Mensal</option>
          <option value="TRIMESTRAL">Trimestral (em breve)</option>
          <option value="SEMESTRAL">Semestral (em breve)</option>
          <option value="ANUAL">Anual (em breve)</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Por enquanto só a emissão mensal está disponível.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Primeira emissão</label>
        <input
          name="primeiraEmissao"
          type="date"
          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">
          Opcional, só pra referência. A emissão de fato ocorre todo mês no
          dia escolhido acima.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Por quanto tempo deseja repetir?
        </label>
        <select
          value={duracao}
          onChange={(e) => setDuracao(e.target.value as DuracaoOpcao)}
          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="12">12 meses</option>
          <option value="24">24 meses</option>
          <option value="indefinidamente">Indefinidamente</option>
        </select>
        <input
          type="hidden"
          name="quantidadeMeses"
          value={duracao === "indefinidamente" ? "" : duracao}
        />
        <p className="mt-1 text-xs text-gray-500">
          Escolhendo 12 ou 24 meses, a recorrência se encerra sozinha depois da
          última emissão.
        </p>
      </div>

      {ehMei && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Código de tributação nacional do ISS *
          </label>
          <input type="hidden" name="codigoTributacaoNacionalIss" value={codigoTributacaoNacionalIss} />
          <SeletorCodigoTributacao
            value={codigoTributacaoNacionalIss}
            onChange={setCodigoTributacaoNacionalIss}
            formato="nacional"
          />
          <p className="mt-1 text-xs text-gray-500">
            Exigido pela NFS-e Nacional em toda emissão para empresas MEI. Digite o código
            ou parte da descrição do serviço pra filtrar.
          </p>
        </div>
      )}

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Salvando..." : "Criar recorrência"}
      </button>
    </form>
  );
}
