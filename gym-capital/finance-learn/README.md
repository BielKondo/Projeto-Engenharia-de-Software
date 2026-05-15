# GYM Capital — Plataforma de Educação Financeira

Plataforma web educacional desenvolvida pelo grupo **G.Y.M** para ensinar finanças e investimentos por meio de uma carteira simulada com dinheiro fictício.

## Sobre

Esta entrega cobre o frontend inicial da plataforma, contemplando os requisitos:

- **RF05** — Simulador de investimentos
- **RF08** — Análise de carteira de investimentos
- **RF13** — Dashboard financeiro

> Todo dinheiro nesta plataforma é fictício. O sistema é estritamente educacional.

## Stack

- **Next.js 14** (App Router)
- **TypeScript** (strict mode)
- **Tailwind CSS** com tema dark navy customizado
- **React Context API** + `localStorage` para persistência (sem banco de dados ainda)
- SVG puro para os gráficos (candlestick, área, sparklines) — zero dependências de bibliotecas de chart

## Funcionalidades implementadas

| Funcionalidade | Status |
|---|---|
| Dashboard com KPIs do portfólio | ✅ |
| Gráfico de desempenho (área) | ✅ |
| Análise de ativo com candlestick + EMA/SMA | ✅ |
| Timeframes (1D/1S/1M/6M) | ✅ |
| Compra/venda com cálculo automático | ✅ |
| Cálculo de preço médio ponderado | ✅ |
| Lista Mercado & Favoritos | ✅ |
| Posições com sparkline e rendimento | ✅ |
| Simulação de variação de preços em tempo real | ✅ |
| Persistência em localStorage | ✅ |
| Reinício da simulação | ✅ |

## Estrutura

```
finance-learn/
├── app/                          # App Router (Next.js)
│   ├── layout.tsx                # Root layout + provider
│   ├── page.tsx                  # Dashboard principal
│   └── globals.css               # Estilos globais + tema dark
├── components/
│   ├── Sidebar.tsx               # Navegação lateral
│   ├── TopBar.tsx                # Topo: usuário + ações
│   ├── PortfolioSummary.tsx      # Card resumo + gráfico de área
│   ├── AssetAnalysis.tsx         # Análise: candlestick + botões
│   ├── CandlestickChart.tsx      # SVG candlestick (EMA + SMA)
│   ├── MarketFavorites.tsx       # Lista lateral de ativos
│   ├── ActivitiesTrends.tsx      # Posições do usuário com sparkline
│   └── TradeModal.tsx            # Modal de compra/venda
├── contexts/
│   └── PortfolioContext.tsx      # Estado global da carteira
└── lib/
    ├── types.ts                  # Tipos do domínio
    ├── mockAssets.ts             # Mock de ativos brasileiros (gerador OHLC determinístico)
    └── formatters.ts             # BRL, percent, datas, etc.
```

## Como rodar

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Roadmap (próximas entregas)

- **Sprint 1 (login e controle financeiro):**
  - Cadastro/login com padrão **Strategy** (email-senha, OAuth2, 2FA)
  - Controle de gastos (RF03)
  - Gráficos mensais (RF04)
  - Metas financeiras (RF06)
- **Sprint 2 (investimentos e educação):**
  - Backend Node/Python com PostgreSQL
  - Integração com cotações reais via padrão **Adapter** (B3, Binance)
  - Biblioteca de conteúdo (RF07)
  - Trilhas de curso (RF10)
  - Criptomoedas (RF09)
  - Notificações (RF11)
  - Recuperação de senha (RF12)

## Padrões de design previstos

Conforme documentado no entregável "Aplicação de Padrões de Projeto":

- **Strategy** → módulo de autenticação (em vez de acoplar email/senha)
- **Adapter** → fonte de cotações (B3, Binance, CoinGecko) isoladas do Simulador Engine

## Grupo G.Y.M

- Arthur Roldan / Slikta — 10353847
- Felipe Haddad — 10437372
- Gabriel Kondo — 10436238
- João Bocchini / Sinzato — 10440034
