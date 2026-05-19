# Server — Lógica que roda no servidor

Código que NÃO vai pro navegador. Cuida do banco de dados, autenticação e
validações de entrada.

## Arquivos

| Arquivo | Responsabilidade |
|---|---|
| `db.ts` | Cliente do Prisma (acesso ao banco PostgreSQL (Supabase)) |
| `auth.ts` | Hash de senha (bcrypt) e tokens de sessão (JWT) |
| `validations.ts` | Schemas Zod para validar login e cadastro |

## Quem usa isto?

- **Rotas de API** em `src/app/api/auth/*` (login, cadastro, logout, me)
- **Layout raiz** em `src/app/layout.tsx` (busca dados do usuário logado)
- **Middleware** em `middleware.ts` (verifica sessão antes de carregar página)

## Importante

**Nunca** importe estes arquivos em componentes client (com `"use client"`).
Eles têm dependências que só rodam no Node.js (Prisma, bcrypt).
