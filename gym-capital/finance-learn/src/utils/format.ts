/**
 * FORMATAÇÃO DE TEXTO
 * ============================================================
 * Funções para exibir valores na interface (moedas, %, datas...).
 * Use sempre pt-BR e separadores brasileiros (vírgula decimal, ponto de milhar).
 */

/** Formata um número como real brasileiro: R$ 1.234,56 */
export function formatBRL(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

/** Formata número sem símbolo da moeda: 1.234,56 */
export function formatBRLNoCurrency(valor: number, casas = 2): string {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

/** Formata percentual com sinal: +2,50% ou -1,30% */
export function formatPercent(valor: number, casas = 2): string {
  const sinal = valor > 0 ? "+" : "";
  return `${sinal}${valor.toFixed(casas)}%`;
}

/** Formata número grande com sufixo: 1.2M, 540K, 2.3B */
export function formatVolume(valor: number): string {
  if (valor >= 1_000_000_000) return `${(valor / 1_000_000_000).toFixed(1)}B`;
  if (valor >= 1_000_000) return `${(valor / 1_000_000).toFixed(1)}M`;
  if (valor >= 1_000) return `${(valor / 1_000).toFixed(1)}K`;
  return String(valor);
}

/** Formata número simples: 1.234 */
export function formatNumber(valor: number): string {
  return valor.toLocaleString("pt-BR");
}

/** Data + hora: 19/05/2026 14:30 */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Data curta: "19 de mai." */
export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

/** Traduz a categoria do ativo para exibição: "acao" → "Ação" */
export function categoriaLabel(cat: string): string {
  const labels: Record<string, string> = {
    acao: "Ação",
    etf: "ETF",
    tesouro: "Tesouro Direto",
    fii: "FII",
    cripto: "Criptomoeda",
  };
  return labels[cat] ?? cat;
}

/** Traduz o nível de risco: "moderado" → "Moderado" */
export function riscoLabel(risco: string): string {
  const labels: Record<string, string> = {
    conservador: "Conservador",
    moderado: "Moderado",
    arrojado: "Arrojado",
  };
  return labels[risco] ?? risco;
}

// Re-exportamos classNames daqui pra simplificar imports.
// Quem quiser usar só esse helper pode importar direto de "@/utils/classes".
export { classNames } from "./classes";
