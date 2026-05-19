# GYM Capital — Simulador de Investimentos

Plataforma educacional de investimentos do projeto G.Y.M (Universidade Presbiteriana Mackenzie). Inclui simulador de carteira, alertas de preço, metas financeiras, controle de gastos e biblioteca de conteúdo.

## Stack

- **Frontend**: Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS
- **Banco de dados**: SQLite via Prisma ORM
- **Autenticação**: JWT em cookie httpOnly + bcrypt para hash de senhas
- **Validação**: Zod

## Primeiro setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Criar arquivo `.env`

Copie o `.env.example` para `.env` (já existe um `.env` de dev no projeto):

```bash
cp .env.example .env
```

Variáveis necessárias:
- `DATABASE_URL` — caminho do banco SQLite (padrão: `file:./dev.db`)
- `JWT_SECRET` — chave para assinar tokens (mínimo 32 caracteres)

### 3. Criar o banco de dados

```bash
npx prisma db push
```

Esse comando lê o `prisma/schema.prisma` e cria o arquivo `prisma/dev.db` com as tabelas `User` e `Sessao`.

### 4. Rodar o app

```bash
npm run dev
```

Acesse `http://localhost:3000`. Como ainda não tem conta, será redirecionado para `/login`. Clique em "Cadastre-se" para criar a primeira conta.

## Estrutura

```
app/
├── (auth)/              # Rotas públicas (sem sidebar)
│   ├── login/
│   └── cadastro/
├── (app)/               # Rotas privadas (com sidebar, exigem auth)
│   ├── page.tsx         # Dashboard
│   ├── portfolio/
│   ├── mercados/
│   ├── biblioteca/
│   ├── negociar/
│   ├── relatorios/
│   ├── gastos/
│   ├── perfil/
│   ├── configuracoes/
│   └── ajuda/
├── api/auth/
│   ├── login/route.ts
│   ├── cadastro/route.ts
│   ├── logout/route.ts
│   └── me/route.ts
└── layout.tsx           # Layout raiz com AuthProvider

components/              # Componentes React reutilizáveis
contexts/                # React Contexts (Auth, Portfolio, Gastos, etc.)
lib/
├── prisma.ts            # Cliente Prisma singleton
├── auth/
│   ├── schemas.ts       # Validação Zod
│   └── session.ts       # JWT + bcrypt helpers
├── types.ts             # Tipos compartilhados
└── ...                  # Mocks e formatters
prisma/
└── schema.prisma        # Schema do banco
middleware.ts            # Proteção de rotas privadas
```

## Comandos úteis

| Comando | O que faz |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Build de produção (gera Prisma client e compila) |
| `npm run start` | Roda o build de produção |
| `npm run db:push` | Aplica o schema Prisma ao banco |
| `npm run db:studio` | Abre o Prisma Studio (UI visual do banco) |

## Segurança

- Senhas armazenadas com bcrypt (12 rounds)
- Sessões em JWT assinado com HS256, válidas por 7 dias
- Cookie `httpOnly` + `sameSite=lax` (protege contra XSS e CSRF básico)
- `secure: true` automaticamente em produção
- Validação server-side com Zod em todos os endpoints de auth
- Proteção contra timing attack no login (bcrypt sempre executado)
- Middleware redireciona rotas privadas sem sessão para `/login`

## Migrando para PostgreSQL no futuro

Quando quiserem usar PostgreSQL em produção:

1. Em `prisma/schema.prisma`, troque:
   ```diff
   datasource db {
   -  provider = "sqlite"
   +  provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Atualize a `DATABASE_URL` no `.env` para o formato:
   ```
   DATABASE_URL="postgresql://user:senha@host:5432/gymcapital"
   ```

3. Rode `npx prisma migrate dev --name init` para criar as migrações versionadas.

## Equipe

- Felipe Haddad — RA 10437372
- Gabriel Kondo — RA 10436238
- Arthur Slikta — RA 10353847
- João Pedro Sinzato — RA 10440034
