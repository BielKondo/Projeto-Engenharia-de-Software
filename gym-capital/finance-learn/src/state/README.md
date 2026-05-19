# State — Estado Global do App

Esta pasta contém os **Contexts do React** que mantêm dados acessíveis em qualquer
componente do app, sem precisar passá-los manualmente como props.

## Arquivos

| Arquivo | O que gerencia | Persistência |
|---|---|---|
| `auth.tsx` | Usuário logado (nome, email) | Cookie de sessão (httpOnly) |
| `theme.tsx` | Tema escuro/claro | localStorage |
| `notifications.tsx` | Notificações do sino | localStorage |
| `portfolio.tsx` | Carteira, ativos, alertas, metas | localStorage |
| `expenses.tsx` | Gastos, salário, rendas | localStorage |

## Como usar em um componente

```tsx
"use client";
import { usePortfolio } from "@/state/portfolio";
import { useTheme } from "@/state/theme";

export function MeuComponente() {
  const { estado, comprar, vender } = usePortfolio();
  const { tema, alternar } = useTheme();
  // ...
}
```

## Padrão usado em todos os contexts

1. **Provider** — embrulha a árvore React e fornece o estado.
2. **Hook `useXxx()`** — acessa o estado de qualquer componente.
3. **Persistência** — quase tudo é salvo no localStorage com uma chave versionada
   (ex: `gym-capital:portfolio:v3`).

Todos os providers são montados em `src/app/layout.tsx`.
