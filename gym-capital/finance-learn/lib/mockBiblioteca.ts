export type TipoConteudo = "video" | "artigo" | "curso";

export type NivelConteudo = "iniciante" | "intermediario" | "avancado";

export interface ConteudoBiblioteca {
  id: string;
  titulo: string;
  descricao: string;
  tipo: TipoConteudo;
  nivel: NivelConteudo;
  tema: string;
  duracaoMin?: number; // vídeos e artigos
  modulos?: number; // cursos
  autor: string;
  publicadoEm: string; // ISO
  destaque?: boolean;
}

export const TEMAS = [
  "Iniciação",
  "Renda Fixa",
  "Ações",
  "FIIs",
  "ETFs",
  "Cripto",
  "Análise Técnica",
  "Análise Fundamentalista",
  "Finanças Pessoais",
] as const;

export const conteudosBiblioteca: ConteudoBiblioteca[] = [
  {
    id: "intro-investimentos",
    titulo: "Introdução aos Investimentos",
    descricao:
      "Os primeiros conceitos que todo investidor deveria conhecer antes de começar: tipos de investimento, retorno, risco e liquidez.",
    tipo: "video",
    nivel: "iniciante",
    tema: "Iniciação",
    duracaoMin: 15,
    autor: "Equipe G.Y.M",
    publicadoEm: "2026-04-12",
    destaque: true,
  },
  {
    id: "bolsa-de-valores",
    titulo: "Como funciona a Bolsa de Valores",
    descricao:
      "Entenda o que é a B3, como ações são negociadas, o papel dos investidores e como o preço de uma ação é formado.",
    tipo: "artigo",
    nivel: "iniciante",
    tema: "Ações",
    duracaoMin: 8,
    autor: "Felipe Haddad",
    publicadoEm: "2026-04-18",
  },
  {
    id: "tesouro-direto-guia",
    titulo: "Tesouro Direto: Guia Completo",
    descricao:
      "Trilha estruturada cobrindo todos os títulos públicos: Selic, IPCA+, Prefixado e Renda+. Inclui exercícios e simulações.",
    tipo: "curso",
    nivel: "iniciante",
    tema: "Renda Fixa",
    modulos: 4,
    autor: "Gabriel Kondo",
    publicadoEm: "2026-03-22",
    destaque: true,
  },
  {
    id: "analise-fundamentalista",
    titulo: "Análise Fundamentalista de Ações",
    descricao:
      "Aprenda a ler balanços, calcular indicadores (P/L, P/VP, ROE) e identificar empresas com bom fundamento para o longo prazo.",
    tipo: "video",
    nivel: "intermediario",
    tema: "Análise Fundamentalista",
    duracaoMin: 32,
    autor: "Arthur Slikta",
    publicadoEm: "2026-05-02",
  },
  {
    id: "como-escolher-fii",
    titulo: "Como escolher um Fundo Imobiliário",
    descricao:
      "Critérios para avaliar um FII: tipo (papel ou tijolo), dividend yield, vacância, alavancagem e qualidade da gestão.",
    tipo: "artigo",
    nivel: "intermediario",
    tema: "FIIs",
    duracaoMin: 12,
    autor: "João Bocchini",
    publicadoEm: "2026-04-28",
  },
  {
    id: "diversificacao",
    titulo: "Diversificação de Carteira",
    descricao:
      "Trilha sobre como montar uma carteira balanceada entre classes de ativos, com base no seu perfil de risco e horizonte.",
    tipo: "curso",
    nivel: "intermediario",
    tema: "Iniciação",
    modulos: 6,
    autor: "Equipe G.Y.M",
    publicadoEm: "2026-03-30",
    destaque: true,
  },
  {
    id: "bitcoin-blockchain",
    titulo: "Bitcoin e Blockchain do zero",
    descricao:
      "O que é Bitcoin, como funciona a tecnologia blockchain e qual o papel das criptomoedas no portfólio do investidor moderno.",
    tipo: "video",
    nivel: "iniciante",
    tema: "Cripto",
    duracaoMin: 25,
    autor: "Felipe Haddad",
    publicadoEm: "2026-05-08",
  },
  {
    id: "candlesticks",
    titulo: "Análise Técnica: Candlesticks",
    descricao:
      "Aprenda a ler velas japonesas, identificar padrões de reversão e continuação, e usar EMAs e SMAs como suporte na decisão.",
    tipo: "artigo",
    nivel: "intermediario",
    tema: "Análise Técnica",
    duracaoMin: 15,
    autor: "Arthur Slikta",
    publicadoEm: "2026-04-15",
  },
  {
    id: "etfs-bdr",
    titulo: "ETFs Internacionais via BDR",
    descricao:
      "Como investir no S&P 500 e em índices globais a partir do Brasil usando ETFs e BDRs (IVVB11, BIE11 e outros).",
    tipo: "video",
    nivel: "intermediario",
    tema: "ETFs",
    duracaoMin: 18,
    autor: "Gabriel Kondo",
    publicadoEm: "2026-05-10",
  },
  {
    id: "indicadores-macro",
    titulo: "Indicadores Macroeconômicos",
    descricao:
      "Selic, IPCA, PIB, câmbio: o que cada um significa e como impactam diretamente seus investimentos no Brasil.",
    tipo: "artigo",
    nivel: "intermediario",
    tema: "Iniciação",
    duracaoMin: 10,
    autor: "João Bocchini",
    publicadoEm: "2026-04-22",
  },
  {
    id: "reserva-emergencia",
    titulo: "Reserva de Emergência",
    descricao:
      "Quanto guardar, onde guardar, e por que essa é a primeira etapa antes de qualquer investimento de risco.",
    tipo: "video",
    nivel: "iniciante",
    tema: "Finanças Pessoais",
    duracaoMin: 12,
    autor: "Equipe G.Y.M",
    publicadoEm: "2026-04-05",
  },
  {
    id: "debentures",
    titulo: "Renda Fixa Avançada: Debêntures",
    descricao:
      "Trilha completa sobre debêntures incentivadas, CRIs, CRAs e títulos privados de crédito. Inclui análise de risco de crédito.",
    tipo: "curso",
    nivel: "avancado",
    tema: "Renda Fixa",
    modulos: 5,
    autor: "Arthur Slikta",
    publicadoEm: "2026-03-15",
  },
  {
    id: "estrategia-dividendos",
    titulo: "Estratégias de Dividendos",
    descricao:
      "Como montar uma carteira focada em dividendos: critérios de seleção, payout, sustentabilidade e os melhores setores.",
    tipo: "artigo",
    nivel: "intermediario",
    tema: "Ações",
    duracaoMin: 14,
    autor: "Felipe Haddad",
    publicadoEm: "2026-05-04",
  },
  {
    id: "day-trade-vs-longo",
    titulo: "Day Trade vs Buy and Hold",
    descricao:
      "Comparação honesta entre operações de curto prazo e investimento de longo prazo: prós, contras e perfis adequados.",
    tipo: "video",
    nivel: "intermediario",
    tema: "Ações",
    duracaoMin: 22,
    autor: "Equipe G.Y.M",
    publicadoEm: "2026-04-25",
  },
  {
    id: "perfil-investidor",
    titulo: "Descobrindo seu Perfil de Investidor",
    descricao:
      "Conservador, moderado ou arrojado? Entenda como descobrir seu perfil e por que isso define toda a sua estratégia.",
    tipo: "artigo",
    nivel: "iniciante",
    tema: "Iniciação",
    duracaoMin: 7,
    autor: "Gabriel Kondo",
    publicadoEm: "2026-04-09",
  },
];
