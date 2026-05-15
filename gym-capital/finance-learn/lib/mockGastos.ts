import type { CategoriaMeta } from "./types";

export interface CategoriaGasto {
  id: string;
  nome: string;
  cor: string;
  icone: string; // emoji
}

export const CATEGORIAS_GASTOS: CategoriaGasto[] = [
  { id: "moradia", nome: "Moradia", cor: "#3B82F6", icone: "🏠" },
  { id: "alimentacao", nome: "Alimentação", cor: "#10B981", icone: "🍽️" },
  { id: "transporte", nome: "Transporte", cor: "#F97316", icone: "🚗" },
  { id: "saude", nome: "Saúde", cor: "#EF4444", icone: "💊" },
  { id: "educacao", nome: "Educação", cor: "#8B5CF6", icone: "📚" },
  { id: "lazer", nome: "Lazer", cor: "#EC4899", icone: "🎉" },
  { id: "assinaturas", nome: "Assinaturas", cor: "#06B6D4", icone: "📺" },
  { id: "vestuario", nome: "Vestuário", cor: "#FBBF24", icone: "👔" },
  { id: "investimentos", nome: "Investimentos", cor: "#14B8A6", icone: "📈" },
  { id: "outros", nome: "Outros", cor: "#64748B", icone: "📦" },
];

export const categoriaGastoPorId = (id: string): CategoriaGasto =>
  CATEGORIAS_GASTOS.find((c) => c.id === id) ??
  CATEGORIAS_GASTOS[CATEGORIAS_GASTOS.length - 1];

// Sugestões prontas de metas
export interface SugestaoMeta {
  titulo: string;
  descricao: string;
  valorSugerido: number;
  prazoMeses: number;
  categoria: CategoriaMeta;
  icone: string;
}

export const SUGESTOES_METAS: SugestaoMeta[] = [
  {
    titulo: "Reserva de Emergência",
    descricao: "6 meses do seu custo de vida em renda fixa",
    valorSugerido: 30_000,
    prazoMeses: 12,
    categoria: "reserva",
    icone: "🛡️",
  },
  {
    titulo: "Entrada do Apartamento",
    descricao: "20% do valor de um imóvel próprio",
    valorSugerido: 80_000,
    prazoMeses: 36,
    categoria: "compra",
    icone: "🏠",
  },
  {
    titulo: "Viagem dos Sonhos",
    descricao: "Para uma viagem internacional",
    valorSugerido: 15_000,
    prazoMeses: 18,
    categoria: "viagem",
    icone: "✈️",
  },
  {
    titulo: "Aposentadoria",
    descricao: "Independência financeira no longo prazo",
    valorSugerido: 1_000_000,
    prazoMeses: 240,
    categoria: "aposentadoria",
    icone: "🌴",
  },
  {
    titulo: "Pós-graduação / MBA",
    descricao: "Investir em educação de qualidade",
    valorSugerido: 50_000,
    prazoMeses: 24,
    categoria: "educacao",
    icone: "🎓",
  },
  {
    titulo: "Carro Novo",
    descricao: "Valor para entrada ou compra à vista",
    valorSugerido: 60_000,
    prazoMeses: 24,
    categoria: "compra",
    icone: "🚗",
  },
];
