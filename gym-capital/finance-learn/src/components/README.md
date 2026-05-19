# Componentes

Componentes React reutilizáveis, organizados por tipo.

## Estrutura

```
components/
├── chart/      # Gráfico de candles (CandlestickChart)
├── modals/     # Janelas pop-up (TradeModal, MetaModal, etc)
├── layout/     # Estrutura geral (Sidebar, TopBar, AuthShell)
└── common/     # Demais componentes da interface
```

## Como decidir onde colocar um novo componente?

- **É um modal/popup?** → `modals/`
- **Faz parte da estrutura fixa do app (sidebar, topo, layout)?** → `layout/`
- **É algo do gráfico de candles?** → `chart/`
- **Qualquer outro componente reutilizável?** → `common/`

## Convenções

- Nomes em **PascalCase** (`AssetAnalysis.tsx`)
- Cada componente tem um header comentado no topo explicando o que faz
- Componentes "client" usam `"use client"` na primeira linha
- Componentes que dependem de estado global importam de `@/state/*`
