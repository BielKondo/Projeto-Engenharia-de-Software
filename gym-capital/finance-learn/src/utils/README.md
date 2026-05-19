# Utils — Funções utilitárias

Helpers pequenos usados em vários lugares do app.

## Arquivos

| Arquivo | O que faz |
|---|---|
| `format.ts` | Formata números (BRL, %, datas) e traduz labels |
| `classes.ts` | Junta classes CSS condicionais em uma string |

## Exemplos

```ts
import { formatBRL, formatPercent } from "@/utils/format";

formatBRL(1234.5);       // "R$ 1.234,50"
formatPercent(2.5);      // "+2.50%"
formatPercent(-1.3);     // "-1.30%"
```

```tsx
import { classNames } from "@/utils/classes";

<button
  className={classNames(
    "btn",
    isAtivo && "btn-ativo",
    isDesabilitado ? "opacity-50" : "opacity-100"
  )}
/>
```
