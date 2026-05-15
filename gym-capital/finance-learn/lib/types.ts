export type AssetCategory = "acao" | "etf" | "tesouro" | "fii" | "cripto";

export type RiskLevel = "conservador" | "moderado" | "arrojado";

export type Timeframe = "1S" | "1M" | "6M" | "1A" | "TUDO";

export type Tema = "dark" | "light";

export interface Candle {
  data: string; // ISO date
  abertura: number;
  maxima: number;
  minima: number;
  fechamento: number;
  volume: number;
}

export interface Asset {
  ticker: string;
  nome: string;
  categoria: AssetCategory;
  setor: string;
  preco: number;
  variacaoDia: number;
  variacaoAbs: number;
  volume: number;
  maxima: number;
  minima: number;
  risco: RiskLevel;
  descricao: string;
  historico: Candle[];
}

export interface Position {
  ticker: string;
  quantidade: number;
  precoMedio: number;
}

export interface Transaction {
  id: string;
  tipo: "compra" | "venda";
  ticker: string;
  quantidade: number;
  preco: number;
  total: number;
  data: string;
}

// Alertas de preço
export interface Alert {
  id: string;
  ticker: string;
  precoAlvo: number;
  direcao: "acima" | "abaixo";
  criadoEm: string;
  atingido: boolean;
  atingidoEm?: string;
}

// Metas financeiras
export type CategoriaMeta =
  | "reserva"
  | "compra"
  | "viagem"
  | "aposentadoria"
  | "educacao"
  | "outro";

export type VincularMeta = "patrimonio" | "caixa" | "investido" | "manual";

export interface Meta {
  id: string;
  titulo: string;
  descricao?: string;
  valorAlvo: number;
  prazo: string; // ISO date
  criadaEm: string;
  categoria: CategoriaMeta;
  vincular: VincularMeta;
  valorAtualManual?: number;
}

// Controle de gastos
export type TipoGasto = "unico" | "recorrente";
export type Recorrencia = "mensal" | "anual";

export interface Gasto {
  id: string;
  titulo: string;
  valor: number;
  categoria: string;
  data: string; // ISO date
  tipo: TipoGasto;
  recorrencia?: Recorrencia;
  observacao?: string;
}

export interface ControleGastosState {
  gastos: Gasto[];
  salario: number;
  outrasRendas: number;
}

// Notificações
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

export interface PortfolioState {
  caixa: number;
  posicoes: Position[];
  transacoes: Transaction[];
  saldoInicial: number;
  historico: { data: string; patrimonio: number }[];
  configurado: boolean;
  alertas: Alert[];
  metas: Meta[];
}

export interface Usuario {
  nome: string;
  perfil: RiskLevel;
}
