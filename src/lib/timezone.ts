/**
 * Dia do mês (1-31) considerando o fuso America/Sao_Paulo, independente do
 * fuso do runtime (a Vercel roda funções em UTC). Usado pelo cron de notas
 * recorrentes, que dispara com base num horário UTC (ver vercel.json).
 */
export function hojeDiaDoMesBrasil(): number {
  const formatado = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    day: "numeric",
  }).format(new Date());

  return Number(formatado);
}

/** Ano e mês (1-12) atuais em America/Sao_Paulo, para checar se uma recorrência já rodou neste ciclo. */
export function anoMesAtualBrasil(): { ano: number; mes: number } {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "numeric",
  }).formatToParts(new Date());

  const ano = Number(partes.find((p) => p.type === "year")?.value);
  const mes = Number(partes.find((p) => p.type === "month")?.value);

  return { ano, mes };
}
