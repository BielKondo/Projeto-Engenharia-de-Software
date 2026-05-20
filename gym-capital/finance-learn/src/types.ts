/**
 * TIPOS DO DOMÍNIO — GYM CAPITAL
 * ============================================================
 * Este arquivo contém TODAS as estruturas de dados usadas no app.
 * Se você quer entender o que existe no sistema, comece por aqui.
 *
 * Organização:
 *   1. Ativos do mercado (ações, ETFs, etc.)
 *   2. Portfólio do usuário (caixa, posições, transações)
 *   3. Alertas de preço
 *   4. Metas financeiras
 *   5. Controle de gastos
 *   6. Notificações
 *   7. Usuário e autenticação
 */

// ============================================================
// 1. ATIVOS DO MERCADO
// ============================================================

/** Tipos de ativos disponíveis no simulador */
export type AssetCategory = "acao" | "etf" | "tesouro" | "fii" | "cripto";

/** Perfil de risco do ativo (mostrado em /mercados) */
export type RiskLevel = "conservador" | "moderado" | "arrojado";

/** Períodos do gráfico de candles */
export type Timeframe = "1S" | "1M" | "6M" | "1A" | "TUDO";

/** Uma vela (candle) do gráfico OHLC */
export interface Candle {
  data: string;       // ISO date (ex: "2026-05-19")
  abertura: number;   // preço de abertura
  maxima: number;     // maior preço do dia
  minima: number;     // menor preço do dia
  fechamento: number; // preço de fechamento
  volume: number;     // volume negociado
}

/** Um ativo negociável (ex: PETR4, BTC, BOVA11) */
export interface Asset {
  ticker: string;          // código (ex: "PETR4")
  nome: string;            // nome completo (ex: "Petrobras PN")
  categoria: AssetCategory;
  setor: string;           // setor econômico
  preco: number;           // preço atual
  variacaoDia: number;     // variação % do dia
  variacaoAbs: number;     // variação em R$
  volume: number;
  maxima: number;
  minima: number;
  risco: RiskLevel;
  descricao: string;
  historico: Candle[];     // histórico para o gráfico
}

// ============================================================
// 2. PORTFÓLIO DO USUÁRIO
// ============================================================

/** Uma posição em carteira (quanto da ação o usuário tem) */
export interface Position {
  ticker: string;
  quantidade: number;
  precoMedio: number; // preço médio ponderado das compras
}

/** Uma operação realizada (compra ou venda) */
export interface Transaction {
  id: string;
  tipo: "compra" | "venda";
  ticker: string;
  quantidade: number;
  preco: number;
  total: number; // quantidade × preço
  data: string;  // ISO datetime
}

/** Estado completo do portfólio do usuário */
export interface PortfolioState {
  caixa: number;              // dinheiro disponível
  posicoes: Position[];       // ativos em carteira
  transacoes: Transaction[];  // histórico de operações
  saldoInicial: number;       // valor configurado no setup
  historico: { data: string; patrimonio: number }[]; // gráfico do dashboard
  configurado: boolean;       // false até o usuário escolher saldo inicial
  alertas: Alert[];
  metas: Meta[];
}

// ============================================================
// 3. ALERTAS DE PREÇO
// ============================================================

/** Aviso disparado quando um ativo atinge um preço-alvo */
export interface Alert {
  id: string;
  ticker: string;
  precoAlvo: number;
  direcao: "acima" | "abaixo";
  criadoEm: string;
  atingido: boolean;
  atingidoEm?: string;
}

// ============================================================
// 4. METAS FINANCEIRAS
// ============================================================

export type CategoriaMeta =
  | "reserva"
  | "compra"
  | "viagem"
  | "aposentadoria"
  | "educacao"
  | "outro";

/** A que o progresso da meta está atrelado */
export type VincularMeta = "patrimonio" | "caixa" | "investido" | "manual";

/** Uma meta financeira (ex: "Juntar R$ 30k em 12 meses") */
export interface Meta {
  id: string;
  titulo: string;
  descricao?: string;
  valorAlvo: number;
  prazo: string;             // ISO date
  criadaEm: string;
  categoria: CategoriaMeta;
  vincular: VincularMeta;    // de onde tira o "valor atual"
  valorAtualManual?: number; // só usado quando vincular === "manual"
}

// ============================================================
// 5. CONTROLE DE GASTOS
// ============================================================

export type TipoGasto = "unico" | "recorrente";
export type Recorrencia = "mensal" | "anual";

/** Um gasto registrado pelo usuário */
export interface Gasto {
  id: string;
  titulo: string;
  valor: number;
  categoria: string;      // id da categoria (ex: "moradia")
  data: string;           // ISO date — para únicos é a data do gasto; para recorrentes, o dia/mês do vencimento
  criadoEm?: string;      // ISO datetime de quando o usuário cadastrou (usado para recorrentes começarem a contar do mês certo)
  tipo: TipoGasto;
  recorrencia?: Recorrencia;
  observacao?: string;
}

/** Estado completo do controle de gastos */
export interface ControleGastosState {
  gastos: Gasto[];
  salario: number;
  outrasRendas: number;
}

// ============================================================
// 6. NOTIFICAÇÕES
// ============================================================

export type TipoNotif =
  | "conquista"
  | "mercado"
  | "lembrete"
  | "biblioteca"
  | "alerta";

export interface Notificacao {
  id: string;
  tipo: TipoNotif;
  titulo: string;
  texto: string;
  criadaEm: string;
  naoLida: boolean;
}

// ============================================================
// 7. USUÁRIO, TEMA E INTERNACIONALIZAÇÃO
// ============================================================

export type Tema = "dark" | "light";

/** Idiomas suportados pelo app */
export type Idioma = "pt-BR" | "en-US" | "es-ES";

/** Moedas suportadas pelo app */
export type Moeda = "BRL" | "USD" | "EUR";

export interface Usuario {
  id: string;
  email: string;
  nome: string;
  dataNascimento?: string;
  idioma?: Idioma;
  moeda?: Moeda;
  avatarUrl?: string | null;
}
