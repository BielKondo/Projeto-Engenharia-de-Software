/**
 * DADOS DOS ATIVOS — MOCK
 * ============================================================
 * Este arquivo simula os 15 ativos disponíveis no GYM Capital.
 * Em produção, esses dados viriam de uma API de cotações (B3, Binance).
 *
 * Cada ativo tem:
 *   - dados básicos (ticker, nome, setor)
 *   - preço atual e variação
 *   - 730 dias de histórico (~2 anos de candles diários)
 *
 * O histórico é gerado de forma DETERMINÍSTICA (mesma seed = mesmo resultado),
 * para que o gráfico seja igual em qualquer máquina que rodar o app.
 */
import type { Asset, Candle } from "../types";

// Saldo começa em 0 — o usuário escolhe o valor inicial no setup
export const SALDO_INICIAL = 0;

// Valores sugeridos no setup do portfólio
export const VALORES_SUGERIDOS = [
  1_000, 10_000, 50_000, 100_000, 500_000, 1_000_000,
];

// PRNG determinístico (mulberry32) para gerar histórico estável por ativo
function seedRandom(seed: number) {
  let s = seed >>> 0;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(ticker: string): number {
  let h = 2166136261;
  for (let i = 0; i < ticker.length; i++) {
    h ^= ticker.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Gera 730 dias de OHLC (~2 anos) com uma tendência leve
function gerarHistorico(
  ticker: string,
  precoAtual: number,
  volatilidade = 0.025,
  dias = 730,
): Candle[] {
  const rng = seedRandom(hashSeed(ticker));
  const candles: Candle[] = [];
  // Começa no passado e caminha até o atual
  // Tendência aleatória estável por ticker
  const tendencia = (rng() - 0.5) * 0.0015;

  // Preço inicial reverso aproximado
  let preco = precoAtual / (1 + tendencia * dias);

  const hoje = new Date();
  for (let i = dias; i >= 0; i--) {
    const dt = new Date(hoje);
    dt.setDate(hoje.getDate() - i);

    const abertura = preco;
    const drift = tendencia;
    const ruido = (rng() - 0.5) * 2 * volatilidade;
    const fechamento = abertura * (1 + drift + ruido);
    const maxima =
      Math.max(abertura, fechamento) *
      (1 + rng() * volatilidade * 0.6);
    const minima =
      Math.min(abertura, fechamento) *
      (1 - rng() * volatilidade * 0.6);
    const volume = Math.round((0.5 + rng()) * 5_000_000);

    candles.push({
      data: dt.toISOString().slice(0, 10),
      abertura,
      maxima,
      minima,
      fechamento,
      volume,
    });

    preco = fechamento;
  }

  // Ajusta a última vela para fechar exatamente no precoAtual
  if (candles.length > 0) {
    const last = candles[candles.length - 1];
    last.fechamento = precoAtual;
    last.maxima = Math.max(last.maxima, precoAtual);
    last.minima = Math.min(last.minima, precoAtual);
  }

  return candles;
}

interface AssetSeed {
  ticker: string;
  nome: string;
  categoria: Asset["categoria"];
  setor: string;
  preco: number;
  variacaoDia: number;
  risco: Asset["risco"];
  descricao: string;
}

const seeds: AssetSeed[] = [
  {
    ticker: "PETR4",
    nome: "Petrobras PN",
    categoria: "acao",
    setor: "Petróleo e Gás",
    preco: 38.65,
    variacaoDia: 2.12,
    risco: "moderado",
    descricao:
      "Maior empresa do Brasil em receita, atua em exploração, produção e refino de petróleo.",
  },
  {
    ticker: "VALE3",
    nome: "Vale ON",
    categoria: "acao",
    setor: "Mineração",
    preco: 62.18,
    variacaoDia: 1.9,
    risco: "moderado",
    descricao:
      "Uma das maiores mineradoras do mundo, líder global em minério de ferro e níquel.",
  },
  {
    ticker: "ITUB4",
    nome: "Itaú Unibanco PN",
    categoria: "acao",
    setor: "Financeiro",
    preco: 33.47,
    variacaoDia: 1.1,
    risco: "moderado",
    descricao:
      "Maior banco privado da América Latina, com forte atuação em varejo e atacado.",
  },
  {
    ticker: "BBDC4",
    nome: "Bradesco PN",
    categoria: "acao",
    setor: "Financeiro",
    preco: 14.05,
    variacaoDia: 1.3,
    risco: "moderado",
    descricao: "Um dos maiores bancos privados do Brasil, com ampla rede de agências.",
  },
  {
    ticker: "ABEV3",
    nome: "Ambev ON",
    categoria: "acao",
    setor: "Bebidas",
    preco: 12.91,
    variacaoDia: 0.62,
    risco: "conservador",
    descricao:
      "Maior cervejaria das Américas, com marcas como Skol, Brahma e Stella Artois.",
  },
  {
    ticker: "MGLU3",
    nome: "Magazine Luiza ON",
    categoria: "acao",
    setor: "Varejo",
    preco: 8.32,
    variacaoDia: 3.17,
    risco: "arrojado",
    descricao: "Varejista omnichannel combinando lojas físicas e plataforma digital.",
  },
  {
    ticker: "WEGE3",
    nome: "WEG ON",
    categoria: "acao",
    setor: "Bens Industriais",
    preco: 41.76,
    variacaoDia: -0.5,
    risco: "moderado",
    descricao:
      "Multinacional brasileira de equipamentos elétricos, motores e automação industrial.",
  },
  {
    ticker: "B3SA3",
    nome: "B3 ON",
    categoria: "acao",
    setor: "Financeiro",
    preco: 11.28,
    variacaoDia: -1.42,
    risco: "moderado",
    descricao: "Operadora da bolsa brasileira de ações e derivativos.",
  },
  {
    ticker: "BOVA11",
    nome: "iShares Ibovespa",
    categoria: "etf",
    setor: "Índice Brasil",
    preco: 122.45,
    variacaoDia: 0.38,
    risco: "moderado",
    descricao:
      "ETF que replica o Ibovespa. Diversificação instantânea no mercado brasileiro.",
  },
  {
    ticker: "IVVB11",
    nome: "iShares S&P 500 BDR",
    categoria: "etf",
    setor: "Índice EUA",
    preco: 318.92,
    variacaoDia: 0.71,
    risco: "moderado",
    descricao:
      "ETF que replica o S&P 500, expondo o investidor às 500 maiores empresas dos EUA.",
  },
  {
    ticker: "SELIC26",
    nome: "Tesouro Selic 2026",
    categoria: "tesouro",
    setor: "Renda Fixa Pós",
    preco: 14_320.55,
    variacaoDia: 0.04,
    risco: "conservador",
    descricao:
      "Título público com rendimento atrelado à Selic. Baixo risco e alta liquidez.",
  },
  {
    ticker: "IPCA29",
    nome: "Tesouro IPCA+ 2029",
    categoria: "tesouro",
    setor: "Renda Fixa Indexada",
    preco: 3_245.18,
    variacaoDia: -0.12,
    risco: "conservador",
    descricao: "Título público que paga IPCA + taxa prefixada. Protege da inflação.",
  },
  {
    ticker: "HGLG11",
    nome: "CSHG Logística FII",
    categoria: "fii",
    setor: "Logística",
    preco: 161.47,
    variacaoDia: 0.28,
    risco: "moderado",
    descricao:
      "FII focado em galpões logísticos. Distribui rendimentos mensais isentos de IR.",
  },
  {
    ticker: "MXRF11",
    nome: "Maxi Renda FII",
    categoria: "fii",
    setor: "Recebíveis",
    preco: 10.34,
    variacaoDia: 0.19,
    risco: "moderado",
    descricao: "Fundo de papel (CRIs/LCIs) com foco em distribuição mensal de dividendos.",
  },
  {
    ticker: "BTC",
    nome: "Bitcoin",
    categoria: "cripto",
    setor: "Criptomoeda",
    preco: 354_280.0,
    variacaoDia: 2.45,
    risco: "arrojado",
    descricao:
      "A primeira e maior criptomoeda do mundo, com suprimento limitado de 21 milhões de unidades.",
  },
];

export const mockAssets: Asset[] = seeds.map((s) => {
  const historico = gerarHistorico(
    s.ticker,
    s.preco,
    s.categoria === "tesouro" ? 0.003 : s.categoria === "cripto" ? 0.04 : 0.025,
  );
  const ultimaVela = historico[historico.length - 1];
  const variacaoAbs = s.preco * (s.variacaoDia / 100);
  return {
    ...s,
    variacaoAbs,
    volume: ultimaVela.volume,
    maxima: Math.max(...historico.slice(-1).map((c) => c.maxima)),
    minima: Math.min(...historico.slice(-1).map((c) => c.minima)),
    historico,
  };
});

export const dicasEducacionais = [
  {
    titulo: "Diversificação",
    texto:
      "Não coloque todos os ovos na mesma cesta. Distribua entre setores e classes de ativos.",
  },
  {
    titulo: "Horizonte de tempo",
    texto:
      "Investir em ações exige paciência. Quanto maior o prazo, menor a chance de prejuízo histórico.",
  },
  {
    titulo: "Preço médio",
    texto:
      "Comprar o mesmo ativo em momentos diferentes gera preço médio — média ponderada dos preços pagos.",
  },
  {
    titulo: "Volatilidade ≠ Risco",
    texto:
      "Oscilações de curto prazo são normais. Risco real é precisar vender no pior momento.",
  },
];
