# GYM Capital

Simulador de investimentos educacional do projeto **G.Y.M** (Universidade
Presbiteriana Mackenzie). Permite aprender sobre mercado financeiro
sem usar dinheiro real.

## Funcionalidades

- 🔐 **Autenticação** — Login e cadastro com banco de dados PostgreSQL (Supabase)
- 💰 **Simulador de carteira** — Compre e venda ativos com dinheiro fictício
- 📊 **Gráfico de candles** — Análise técnica com zoom, EMA 20 e SMA 30
- 🔔 **Alertas de preço** — Receba notificações quando ativos atingirem valores
- 🎯 **Metas financeiras** — Defina objetivos e acompanhe progresso em tempo real
- 💸 **Controle de gastos** — Registre despesas e veja para onde seu dinheiro vai
- 📚 **Biblioteca** — Vídeos, artigos e cursos sobre investimentos
- 🌗 **Tema claro/escuro** — Funciona em qualquer preferência
- 📈 **Análise patrimonial** — Veja exatamente por que sua carteira valorizou ou desvalorizou

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS |
| Banco de dados | **PostgreSQL via Supabase** (gratuito) |
| ORM | Prisma |
| Autenticação | JWT em cookie httpOnly + bcrypt |
| Validação | Zod |

## Setup (primeira vez)

O projeto usa **Supabase** como banco de dados — é gratuito para projetos
pequenos e tem um painel web visual para ver/editar dados.

### Passo 1: Criar conta e projeto no Supabase

1. Acesse https://supabase.com e clique em **"Start your project"**
2. Faça login (recomendo "Continue with GitHub")
3. Clique em **"New project"** e preencha:
   - **Name**: `gym-capital` (ou outro nome)
   - **Database password**: clique no botão de gerar e **salve essa senha** (vai usar daqui a pouco)
   - **Region**: `South America (São Paulo)` para menor latência
   - **Plan**: Free
4. Clique em **"Create new project"** e aguarde ~2 minutos enquanto o projeto é provisionado

### Passo 2: Copiar as URLs de conexão

1. No painel do projeto, vá em **Settings** (ícone de engrenagem) → **Database**
2. Role até a seção **"Connection string"**
3. Vai aparecer várias abas — você precisa de duas connection strings:

   **a)** Aba **"Transaction"** (porta 6543) → essa será `DATABASE_URL`
   
   **b)** Aba **"Session"** ou **"Direct connection"** (porta 5432) → essa será `DIRECT_URL`

4. Copie cada uma trocando `[YOUR-PASSWORD]` pela senha do banco (do passo 1)

### Passo 3: Configurar o `.env`

Edite o arquivo `.env` na raiz do projeto e cole as URLs:

```env
DATABASE_URL="postgresql://postgres.xxxxx:SUA_SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxxx:SUA_SENHA@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
JWT_SECRET="qualquer-string-aleatoria-com-32-caracteres-ou-mais"
```

### Passo 4: Instalar e criar as tabelas

```bash
# Instalar dependências
npm install

# Criar as tabelas User e Sessao no Supabase
npx prisma db push

# Iniciar o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). Você será redirecionado
para `/login`. Clique em **"Cadastre-se"** para criar a primeira conta.

### Como ver/editar os dados do banco

Você tem **3 opções**:

**Opção 1 (recomendada): Painel do Supabase**
- Acesse https://app.supabase.com/project/SEU_PROJETO
- Menu lateral → **"Table Editor"**
- Veja as tabelas em formato de planilha, edite inline, adicione/remova linhas

**Opção 2: Prisma Studio (interface local)**
```bash
npm run db:studio
```
Abre `localhost:5555` com uma UI de planilha.

**Opção 3: SQL Editor do Supabase**
- Painel Supabase → **"SQL Editor"** no menu lateral
- Execute queries SQL diretamente (ex: `SELECT * FROM "User"`)

## Estrutura do projeto

```
finance-learn/
├── prisma/
│   └── schema.prisma         # Estrutura do banco de dados
│
├── src/                      # Todo o código-fonte
│   ├── app/                  # Rotas (cada pasta vira uma URL)
│   │   ├── (auth)/           # Rotas sem login: /login, /cadastro
│   │   ├── (private)/        # Rotas protegidas: /, /portfolio, etc
│   │   ├── api/auth/         # Endpoints de autenticação
│   │   ├── layout.tsx        # Layout raiz (providers)
│   │   └── globals.css       # Estilos globais e variáveis CSS
│   │
│   ├── components/           # Componentes React (UI)
│   │   ├── chart/            # Gráfico de candles
│   │   ├── modals/           # Janelas pop-up
│   │   ├── layout/           # Sidebar, TopBar, AuthShell
│   │   └── common/           # Demais componentes
│   │
│   ├── state/                # Estado global (Contexts)
│   │   ├── auth.tsx          # Usuário logado
│   │   ├── theme.tsx         # Tema claro/escuro
│   │   ├── portfolio.tsx     # Carteira do usuário
│   │   ├── notifications.tsx # Notificações
│   │   └── expenses.tsx      # Controle de gastos
│   │
│   ├── data/                 # Dados estáticos (mocks)
│   │   ├── assets.ts         # Os 15 ativos do simulador
│   │   ├── library.ts        # Conteúdos da biblioteca
│   │   └── expense-categories.ts
│   │
│   ├── server/               # Código que roda no servidor
│   │   ├── db.ts             # Cliente Prisma
│   │   ├── auth.ts           # Hash de senha e JWT
│   │   └── validations.ts    # Schemas Zod
│   │
│   ├── utils/                # Funções utilitárias
│   │   ├── format.ts         # Formatar números, datas, etc.
│   │   └── classes.ts        # Helper de classes CSS
│   │
│   └── types.ts              # ⭐ Todos os tipos do domínio (comece aqui!)
│
├── middleware.ts             # Proteção de rotas privadas
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── .env                      # Variáveis de ambiente (NÃO commitado)
└── .env.example              # Modelo de .env
```

### Onde começar a ler o código?

1. **`src/types.ts`** — Define todas as estruturas de dados (Asset, Position,
   Alert, Meta, Gasto, etc.). Entender isto = entender o que o sistema faz.
2. **`src/app/layout.tsx`** — Layout raiz, monta todos os Contexts.
3. **`src/state/portfolio.tsx`** — Lógica central da carteira (o "coração" do app).
4. **`src/app/(private)/page.tsx`** — Página do Dashboard, mostra como tudo se
   conecta na UI.

Cada pasta tem um `README.md` próprio com mais detalhes.

## Comandos disponíveis

| Comando | O que faz |
|---|---|
| `npm run dev` | Inicia o servidor em modo desenvolvimento |
| `npm run build` | Compila para produção (gera Prisma + build) |
| `npm run start` | Roda a versão de produção (precisa de build antes) |
| `npm run db:push` | Aplica o schema Prisma ao banco PostgreSQL |
| `npm run db:studio` | Abre interface visual do banco no navegador |

## Segurança implementada

- ✅ Senhas com bcrypt (12 rounds)
- ✅ Sessão em JWT assinado (HS256, expira em 7 dias)
- ✅ Cookie httpOnly + sameSite=lax (protege contra XSS e CSRF)
- ✅ Cookie `secure` em produção (HTTPS only)
- ✅ Validação dupla (frontend + backend) com Zod
- ✅ Proteção contra timing attack no login
- ✅ Middleware redireciona rotas privadas sem sessão
- ✅ Constraint unique para email e CPF no banco
- ✅ Idade mínima validada (16+ anos)

## Equipe (G.Y.M)

- Felipe Haddad — RA 10437372
- Gabriel Kondo — RA 10436238
- Arthur Slikta — RA 10353847
- João Bocchini Sinzato — RA 10440034
