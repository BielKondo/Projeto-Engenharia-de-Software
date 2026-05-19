# Data — Dados Estáticos (Mocks)

Conteúdo estático usado pelo app. Em produção, esses dados viriam de uma API
real (B3 para ativos, CMS para biblioteca, etc).

## Arquivos

| Arquivo | O que contém |
|---|---|
| `assets.ts` | Os 15 ativos do simulador (PETR4, VALE3, BTC...) com 2 anos de histórico |
| `library.ts` | 15 conteúdos da biblioteca (vídeos, artigos, cursos) |
| `expense-categories.ts` | 10 categorias de gastos + 6 sugestões de metas |

## Por que dados estáticos?

O GYM Capital é um **simulador educacional**. Não usa dados reais de mercado.
Isso garante:

- **Aprendizado sem risco** — o usuário não vê o próprio dinheiro perder valor
- **Comportamento previsível** — todo mundo vê a mesma evolução dos preços
- **Sem dependência de internet** — funciona offline

## Como adicionar um ativo novo?

Edite `assets.ts` e adicione um item ao array `mockAssets` seguindo o
formato dos outros. O histórico é gerado automaticamente a partir do preço atual.
