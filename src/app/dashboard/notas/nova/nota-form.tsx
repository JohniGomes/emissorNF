"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import { emitirNota, type NotaState } from "../actions";
import { SeletorCodigoTributacao } from "@/components/seletor-codigo-tributacao";
import { buscarCodigoTributacaoNacional } from "@/lib/codigoTributacaoNacional";
import { buscarNbsPorItem } from "@/lib/nbs";

interface Servico {
  id: string;
  nome: string;
  descricao: string;
  valor: number;
  codigoTributacaoNacional?: string | null;
  codigoNbs?: string | null;
}

interface NotaFormProps {
  clientes: { id: string; nome: string; documento: string }[];
  servicos: Servico[];
  ehMei: boolean;
  nomeEmpresa: string;
  defaultValues?: {
    clienteId?: string;
    descricaoServico?: string;
    valor?: string;
  };
}

const initialState: NotaState = {};
const CLIENTE_MANUAL = "__manual__";

function hojeISO() {
  const agora = new Date();
  const offset = agora.getTimezoneOffset();
  const local = new Date(agora.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function NotaForm({ clientes, servicos, ehMei, nomeEmpresa, defaultValues }: NotaFormProps) {
  const [state, formAction, pending] = useActionState(emitirNota, initialState);
  const [etapa, setEtapa] = useState<"form" | "revisao">("form");

  const [clienteId, setClienteId] = useState(defaultValues?.clienteId ?? "");
  const [clienteManualNome, setClienteManualNome] = useState("");
  const [clienteManualDocumento, setClienteManualDocumento] = useState("");
  const [clienteManualEmail, setClienteManualEmail] = useState("");

  const [servicoId, setServicoId] = useState("");
  const [descricaoServico, setDescricaoServico] = useState(defaultValues?.descricaoServico ?? "");
  const [valor, setValor] = useState(defaultValues?.valor ?? "");
  const [desconto, setDesconto] = useState("");
  const [dataCompetencia, setDataCompetencia] = useState(hojeISO());
  const [observacoes, setObservacoes] = useState("");
  const [codigoTributacaoNacionalIss, setCodigoTributacaoNacionalIss] = useState("");
  const [itemListaServico, setItemListaServico] = useState("");
  const [codigoNbs, setCodigoNbs] = useState("");
  const [nbsManual, setNbsManual] = useState(false);
  const [mostrarOpcoesFiscais, setMostrarOpcoesFiscais] = useState(false);

  const nbsCorrelacionados = useMemo(
    () => buscarNbsPorItem(itemListaServico.slice(0, 4)),
    [itemListaServico],
  );

  const [idempotencyKey] = useState(() => crypto.randomUUID());

  const clienteManualSelecionado = clienteId === CLIENTE_MANUAL;
  const clienteSelecionado = clientes.find((c) => c.id === clienteId);

  const valorNumerico = Number((valor || "0").replace(",", "."));
  const descontoNumerico = Number((desconto || "0").replace(",", "."));
  const valorLiquido = valorNumerico - (Number.isNaN(descontoNumerico) ? 0 : descontoNumerico);

  const erroValidacao = useMemo(() => {
    if (!clienteId) return "Selecione o cliente.";
    if (clienteManualSelecionado && (!clienteManualNome.trim() || !clienteManualDocumento.trim())) {
      return "Preencha nome e CPF/CNPJ do cliente.";
    }
    if (!descricaoServico.trim()) return "Descreva o serviço prestado.";
    if (!valor || Number.isNaN(valorNumerico) || valorNumerico <= 0) {
      return "Informe um valor válido.";
    }
    if (desconto && (Number.isNaN(descontoNumerico) || descontoNumerico < 0)) {
      return "Informe um desconto válido.";
    }
    if (desconto && descontoNumerico >= valorNumerico) {
      return "O desconto não pode ser maior ou igual ao valor do serviço.";
    }
    if (!dataCompetencia) return "Informe a data de competência.";
    if (ehMei && !codigoTributacaoNacionalIss.trim()) {
      return "Informe o código de tributação nacional do ISS.";
    }
    return null;
  }, [
    clienteId,
    clienteManualSelecionado,
    clienteManualNome,
    clienteManualDocumento,
    descricaoServico,
    valor,
    valorNumerico,
    desconto,
    descontoNumerico,
    dataCompetencia,
    ehMei,
    codigoTributacaoNacionalIss,
  ]);

  function handleSelecionarServico(id: string) {
    setServicoId(id);
    const servico = servicos.find((s) => s.id === id);
    if (servico) {
      setDescricaoServico(servico.descricao);
      if (servico.valor > 0) setValor(servico.valor.toFixed(2).replace(".", ","));
      if (servico.codigoTributacaoNacional) {
        if (ehMei) setCodigoTributacaoNacionalIss(servico.codigoTributacaoNacional);
        else setItemListaServico(servico.codigoTributacaoNacional);
      }
      setCodigoNbs(servico.codigoNbs ?? "");
    }
  }

  function irParaRevisao() {
    if (erroValidacao) return;
    setEtapa("revisao");
  }

  const nomeClienteRevisao = clienteManualSelecionado
    ? clienteManualNome
    : clienteSelecionado
      ? `${clienteSelecionado.nome} — ${clienteSelecionado.documento}`
      : "";

  if (etapa === "revisao") {
    return (
      <form action={formAction} className="max-w-lg space-y-4">
        <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
        <input type="hidden" name="clienteId" value={clienteId} />
        {clienteManualSelecionado && (
          <>
            <input type="hidden" name="clienteManualNome" value={clienteManualNome} />
            <input type="hidden" name="clienteManualDocumento" value={clienteManualDocumento} />
            <input type="hidden" name="clienteManualEmail" value={clienteManualEmail} />
          </>
        )}
        <input type="hidden" name="servicoId" value={servicoId} />
        <input type="hidden" name="descricaoServico" value={descricaoServico} />
        <input type="hidden" name="valor" value={valor} />
        <input type="hidden" name="desconto" value={desconto} />
        <input type="hidden" name="dataCompetencia" value={dataCompetencia} />
        <input type="hidden" name="observacoes" value={observacoes} />
        {ehMei && (
          <input
            type="hidden"
            name="codigoTributacaoNacionalIss"
            value={codigoTributacaoNacionalIss}
          />
        )}
        {!ehMei && (
          <>
            <input
              type="hidden"
              name="itemListaServico"
              value={itemListaServico.slice(0, 4)}
            />
            <input type="hidden" name="codigoNbs" value={codigoNbs} />
          </>
        )}

        <div className="rounded-md border border-gray-200 bg-white">
          <div className="border-b border-gray-100 p-4">
            <h2 className="text-sm font-semibold text-gray-900">Revisão da nota</h2>
            <p className="mt-1 text-xs text-gray-500">
              Confira os dados antes de emitir — depois de emitida a nota não pode ser editada.
            </p>
          </div>

          <div className="space-y-4 p-4 text-sm">
            <div>
              <p className="text-xs font-medium uppercase text-gray-400">Prestador</p>
              <p className="text-gray-900">{nomeEmpresa}</p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-400">Cliente</p>
              <p className="text-gray-900">{nomeClienteRevisao}</p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-400">Serviço</p>
              <p className="whitespace-pre-wrap text-gray-900">{descricaoServico}</p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-400">Valores</p>
              <p className="text-gray-900">Valor do serviço: R$ {formatarMoeda(valorNumerico)}</p>
              {descontoNumerico > 0 && (
                <p className="text-gray-900">Desconto: R$ {formatarMoeda(descontoNumerico)}</p>
              )}
              <p className="font-medium text-gray-900">
                Valor líquido: R$ {formatarMoeda(valorLiquido)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-400">Competência</p>
              <p className="text-gray-900">
                {new Date(`${dataCompetencia}T00:00:00`).toLocaleDateString("pt-BR")}
              </p>
            </div>

            {observacoes && (
              <div>
                <p className="text-xs font-medium uppercase text-gray-400">Observações</p>
                <p className="whitespace-pre-wrap text-gray-900">{observacoes}</p>
              </div>
            )}

            {ehMei && codigoTributacaoNacionalIss && (
              <div>
                <p className="text-xs font-medium uppercase text-gray-400">Opções fiscais</p>
                <p className="text-gray-900">
                  Código de tributação nacional do ISS: {codigoTributacaoNacionalIss}
                  {(() => {
                    const item = buscarCodigoTributacaoNacional(codigoTributacaoNacionalIss, 1)[0];
                    return item ? ` — ${item.descricao}` : "";
                  })()}
                </p>
              </div>
            )}

            {!ehMei && (itemListaServico || codigoNbs) && (
              <div>
                <p className="text-xs font-medium uppercase text-gray-400">Opções fiscais</p>
                {itemListaServico && (
                  <p className="text-gray-900">
                    Item da lista de serviços (LC 116/2003):{" "}
                    {buscarCodigoTributacaoNacional(itemListaServico, 1)[0]?.codigoFormatado ??
                      itemListaServico}
                    {(() => {
                      const item = buscarCodigoTributacaoNacional(itemListaServico, 1)[0];
                      return item ? ` — ${item.descricao}` : "";
                    })()}
                  </p>
                )}
                {codigoNbs && (
                  <p className="text-gray-900">
                    Código NBS: {codigoNbs}
                    {(() => {
                      const item = nbsCorrelacionados.find((n) => n.nbs === codigoNbs);
                      return item ? ` — ${item.descricao}` : "";
                    })()}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setEtapa("form")}
            disabled={pending}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50"
          >
            ← Voltar
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {pending ? "Emitindo..." : "✓ Emitir nota"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="max-w-lg space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Cliente *</label>
        <select
          value={clienteId}
          onChange={(e) => setClienteId(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Selecione o cliente</option>
          {clientes.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nome} — {cliente.documento}
            </option>
          ))}
          <option value={CLIENTE_MANUAL}>Cliente não cadastrado (inserir dados)</option>
        </select>
        <a
          href="/dashboard/clientes/novo"
          target="_blank"
          className="mt-1 inline-block text-xs font-medium text-brand-brown hover:underline"
        >
          + Novo cliente
        </a>
      </div>

      {clienteManualSelecionado && (
        <div className="space-y-3 rounded-md border border-dashed border-gray-300 p-3">
          <p className="text-xs text-gray-500">
            Esses dados serão salvos como um novo cliente da sua carteira.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome/Razão social *</label>
            <input
              value={clienteManualNome}
              onChange={(e) => setClienteManualNome(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">CPF/CNPJ *</label>
            <input
              value={clienteManualDocumento}
              onChange={(e) => setClienteManualDocumento(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">E-mail</label>
            <input
              type="email"
              value={clienteManualEmail}
              onChange={(e) => setClienteManualEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            />
          </div>
        </div>
      )}

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
          <p className="mt-1 text-xs text-gray-500">
            Preenche a descrição e o valor automaticamente — você pode ajustar antes de emitir.
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Descrição do serviço *</label>
        <textarea
          rows={3}
          value={descricaoServico}
          onChange={(e) => setDescricaoServico(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Valor do serviço (R$) *</label>
          <input
            inputMode="decimal"
            placeholder="0,00"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Desconto (R$)</label>
          <input
            inputMode="decimal"
            placeholder="0,00"
            value={desconto}
            onChange={(e) => setDesconto(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>

      {desconto.trim() && !Number.isNaN(valorLiquido) && (
        <p className="text-sm text-gray-600">
          Valor líquido: <span className="font-medium text-gray-900">R$ {formatarMoeda(valorLiquido)}</span>
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Data de competência *</label>
        <input
          type="date"
          value={dataCompetencia}
          onChange={(e) => setDataCompetencia(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">
          Mês/competência a que o serviço se refere — pode ser diferente da data de emissão.
        </p>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setMostrarOpcoesFiscais((v) => !v)}
          className="text-sm font-medium text-brand-brown hover:underline"
        >
          {mostrarOpcoesFiscais ? "▾" : "▸"} ⚙️ Opções fiscais avançadas
        </button>

        {mostrarOpcoesFiscais && (
          <div className="mt-3 space-y-3 rounded-md border border-dashed border-gray-300 p-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Observações</label>
              <textarea
                rows={2}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Informações adicionais que devem constar na nota."
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              />
            </div>

            {ehMei && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Código de tributação nacional do ISS *
                </label>
                <SeletorCodigoTributacao
                  value={codigoTributacaoNacionalIss}
                  onChange={setCodigoTributacaoNacionalIss}
                  formato="nacional"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Exigido pela NFS-e Nacional para empresas MEI. Digite o código ou parte da
                  descrição do serviço pra filtrar a tabela oficial — consulte seu contador se
                  não souber qual se aplica.
                </p>
              </div>
            )}

            {!ehMei && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Item da lista de serviços (LC 116/2003)
                  </label>
                  <SeletorCodigoTributacao
                    value={itemListaServico}
                    onChange={setItemListaServico}
                    formato="lc116"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Alguns municípios exigem esse código pra autorizar a nota. Digite o
                    código ou parte da descrição do serviço pra filtrar — deixe em branco se
                    seu município não exigir.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Código NBS</label>
                  {nbsCorrelacionados.length > 0 && !nbsManual ? (
                    <>
                      <select
                        value={codigoNbs}
                        onChange={(e) => {
                          if (e.target.value === "__manual__") {
                            setNbsManual(true);
                            setCodigoNbs("");
                          } else {
                            setCodigoNbs(e.target.value);
                          }
                        }}
                        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                      >
                        <option value="">Nenhum</option>
                        {nbsCorrelacionados.map((item) => (
                          <option key={item.nbs} value={item.nbs}>
                            {item.nbs} — {item.descricao}
                          </option>
                        ))}
                        <option value="__manual__">Outro (digitar manualmente)</option>
                      </select>
                      <p className="mt-1 text-xs text-gray-500">
                        Opções pré-filtradas pela correlação oficial com o item de serviço
                        escolhido acima. Opcional — deixe "Nenhum" se não souber.
                      </p>
                    </>
                  ) : (
                    <>
                      <input
                        value={codigoNbs}
                        onChange={(e) => setCodigoNbs(e.target.value)}
                        placeholder="ex: 1.1301.30.00"
                        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {itemListaServico
                          ? "Não há NBS pré-cadastrado pra este item — digite manualmente se souber."
                          : "Escolha o item da lista de serviços acima pra ver as opções de NBS correlacionadas."}{" "}
                        Opcional — deixe em branco se não souber.
                      </p>
                      {nbsManual && (
                        <button
                          type="button"
                          onClick={() => {
                            setNbsManual(false);
                            setCodigoNbs("");
                          }}
                          className="mt-1 text-xs font-medium text-brand-brown hover:underline"
                        >
                          ← Voltar pras opções sugeridas
                        </button>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {erroValidacao && <p className="text-sm text-amber-600">{erroValidacao}</p>}
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="button"
        onClick={irParaRevisao}
        disabled={!!erroValidacao}
        className="rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        Revisar e emitir →
      </button>
    </div>
  );
}
