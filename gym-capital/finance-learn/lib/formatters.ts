export const formatBRL = (valor: number): string =>
  valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });

export const formatPercent = (valor: number, casas = 2): string => {
  const sinal = valor > 0 ? "+" : "";
  return `${sinal}${valor.toFixed(casas)}%`;
};

export const formatBRLNoCurrency = (valor: number, casas = 2): string =>
  valor.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });

export const formatNumber = (valor: number): string =>
  valor.toLocaleString("pt-BR");

export const formatVolume = (valor: number): string => {
  if (valor >= 1_000_000_000) return `${(valor / 1_000_000_000).toFixed(1)}B`;
  if (valor >= 1_000_000) return `${(valor / 1_000_000).toFixed(1)}M`;
  if (valor >= 1_000) return `${(valor / 1_000).toFixed(1)}K`;
  return String(valor);
};

export const formatDateTime = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDateShort = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "short" });
};

export const classNames = (...arr: (string | false | null | undefined)[]) =>
  arr.filter(Boolean).join(" ");

export const categoriaLabel = (cat: string): string => {
  const map: Record<string, string> = {
    acao: "Ação",
    etf: "ETF",
    tesouro: "Tesouro Direto",
    fii: "FII",
    cripto: "Criptomoeda",
  };
  return map[cat] ?? cat;
};

export const riscoLabel = (risco: string): string => {
  const map: Record<string, string> = {
    conservador: "Conservador",
    moderado: "Moderado",
    arrojado: "Arrojado",
  };
  return map[risco] ?? risco;
};
