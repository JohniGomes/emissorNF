export interface Plano {
  id: string;
  nome: string;
  precoMensal: number;
  precoAnual: number; // valor total cobrado no ciclo anual (já com desconto)
  notasIncluidas: number;
  destaques: string[];
}

/**
 * Placeholder - ajustar quando os preços/planos reais forem definidos.
 * Único lugar a editar; nada mais no código depende de valores fixos.
 */
export const PLANOS: Plano[] = [
  {
    id: "padrao",
    nome: "Padrão",
    precoMensal: 89.9,
    precoAnual: 890,
    notasIncluidas: 150,
    destaques: [
      "Emissão automática de NFS-e",
      "Clientes ilimitados",
      "Suporte por e-mail",
    ],
  },
];

export function getPlano(planoId: string | null | undefined): Plano | undefined {
  return PLANOS.find((p) => p.id === planoId);
}
