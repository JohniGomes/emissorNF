/** Máscaras de digitação para campos comuns (CPF/CNPJ, CEP, valores em R$). */

/** Formata progressivamente enquanto o usuário digita: CPF (000.000.000-00) ou CNPJ (00.000.000/0000-00). */
export function formatarCpfCnpj(valorBruto: string): string {
  const digitos = valorBruto.replace(/\D/g, "").slice(0, 14);

  if (digitos.length <= 11) {
    return digitos
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  return digitos
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

/** Formata progressivamente enquanto o usuário digita: CEP (00000-000). */
export function formatarCep(valorBruto: string): string {
  const digitos = valorBruto.replace(/\D/g, "").slice(0, 8);
  return digitos.replace(/(\d{5})(\d{1,3})$/, "$1-$2");
}

/**
 * Formata um valor monetário enquanto o usuário digita, tratando os dígitos
 * como centavos (padrão de campo de valor no Brasil): "500" -> "5,00",
 * "150000" -> "1.500,00".
 */
export function formatarValorMonetarioInput(valorBruto: string): string {
  const digitos = valorBruto.replace(/\D/g, "");
  if (!digitos) return "";
  const numero = Number(digitos) / 100;
  return numero.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Converte "1.500,00" (ou "500,00") de volta para o número 1500 (ou 500). */
export function paraNumero(valorFormatado: string): number {
  if (!valorFormatado) return NaN;
  const limpo = valorFormatado.replace(/\./g, "").replace(",", ".");
  return Number(limpo);
}
