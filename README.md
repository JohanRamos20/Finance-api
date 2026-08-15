# API — Finance

API REST para controle financeiro pessoal: cadastro de usuários, autenticação, carteira com saldo em cache, lançamento de transações (receitas e despesas) e metas de economia com depósitos incrementais.

## Tecnologias

- **Node.js** + **TypeScript**
- **Express** — framework HTTP
- **Prisma ORM** (`@prisma/client`, `@prisma/adapter-pg`) — acesso ao banco
- **PostgreSQL** — banco de dados relacional
- **Redis** — cache do saldo da carteira
- **JWT** (`jsonwebtoken`) + **cookies httpOnly** (`cookie-parser`) — autenticação
- **bcrypt** — hash de senhas
- **Zod** — validação de schemas (body/query, modo `.strict()`)
- **Vitest** + **Supertest** — testes unitários e de integração
- **Docker Compose** — orquestração de Postgres (app e teste) e Redis

## Arquitetura

O projeto segue os princípios de **Clean Architecture**, organizado em camadas com dependências apontando sempre para dentro (o domínio não conhece infraestrutura):

```
src/
├── domain/            # Regras de negócio puras — sem dependência de framework
│   ├── entities/       # User, Wallet, Transaction, Goal (validações e regras)
│   ├── repositories/    # Interfaces (contratos) de persistência
│   ├── services/        # Interfaces de serviços (hash de senha, geração de token)
│   ├── events/           # Barramento de eventos de domínio (EventBus, DomainEvent)
│   ├── managers/         # Interface do gerenciador de transações (unit of work)
│   └── errors/            # BusinessError (erros de negócio com status HTTP)
│
├── application/        # Casos de uso — orquestram o domínio
│   ├── use-cases/        # Ex.: create-transaction, create-goal, login-user...
│   ├── dtos/               # Contratos de entrada/saída de cada caso de uso
│   └── listeners/           # Reagem a eventos de domínio (auditoria, cache de saldo)
│
├── infrastructure/     # Implementações concretas (detalhes técnicos)
│   ├── repositories/     # Implementações Prisma dos repositórios de domínio
│   ├── services/           # bcrypt (hash) e JWT (token) implementando as interfaces
│   ├── cache/                # Cliente Redis
│   └── http/                  # Express: controllers, rotas, middlewares, validators (Zod), factories
│
├── database/           # Integração com Prisma: client, repository client,
│                        # transaction manager e unit of work (transações atômicas)
│
└── main/               # Composição da aplicação
    ├── app.ts            # Monta o Express (cors, json, rotas, error middleware)
    └── server.ts         # Conecta Redis, registra listeners e sobe o servidor
```

**Injeção de dependência manual** via *factories* (`src/infrastructure/http/factories`): cada factory monta um controller com suas dependências concretas (repositório Prisma, serviços de infraestrutura), mantendo os casos de uso desacoplados de Express e Prisma.

**Eventos de domínio**: ao criar uma transação, um evento `transaction.created` é publicado e dois listeners reagem a ele de forma síncrona no mesmo processo — atualização do cache de saldo no Redis e gravação de log de auditoria (`AuditLog`, uso interno, não exposto via API).

### Modelo de dados

| Entidade | Campos principais | Relacionamentos |
|---|---|---|
| **User** | `id`, `name`, `email` (único), `passwordHash`, `createdAt` | 1:1 com Wallet, 1:N com Goal |
| **Wallet** | `id`, `userId` | 1:N com Transaction |
| **Transaction** | `id`, `walletId`, `name`, `category`, `amount`, `transactionType`, `createdAt` | pertence a Wallet |
| **Goal** | `id`, `userId`, `name`, `description`, `targetAmount`, `savedAmount`, `createdAt` | pertence a User |
| **AuditLog** | `id`, `event`, `userId`, `entityId`, `data`, `createdAt` | uso interno |

- `Category`: `LEISURE` \| `GROCERIES` \| `EXPENSES` \| `SHOPPING` \| `FOOD` \| `SALARY`
- `TransactionType`: `DEBIT` \| `CREDIT`
- Valores monetários (`amount`, `targetAmount`, `savedAmount`) são `Decimal(14,2)` no banco.

## Como rodar

### Pré-requisitos

- Node.js 18+
- Docker e Docker Compose

### 1. Clonar e instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@localhost:5432/db"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="uma-string-secreta-longa-e-aleatoria"
PORT=3000
```

Para rodar os testes, crie também um `.env.test`:

```env
NODE_ENV=test
DATABASE_URL="postgresql://postgres:password@localhost:5433/db_test"
```

### 3. Subir os serviços de infraestrutura (Postgres + Redis)

```bash
docker compose up -d
```

Isso sobe três containers: `db` (Postgres, porta `5432`, usado em desenvolvimento), `db_test` (Postgres, porta `5433`, usado nos testes) e `redis` (porta `6379`).

### 4. Rodar as migrations

```bash
npx prisma migrate deploy
```

### 5. Iniciar a aplicação

```bash
npm run dev
```

O servidor sobe em `http://localhost:3000` (ou na porta definida em `PORT`).

### Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Sobe o servidor em modo desenvolvimento com hot-reload (`nodemon`) |
| `npm start` | Sobe o servidor sem hot-reload |
| `npm test` | Roda os testes em modo watch (Vitest) |
| `npm run test:run` | Roda os testes uma única vez |
| `npm run test:coverage` | Roda os testes com relatório de cobertura |

## Funcionalidades

### Autenticação
- Cadastro de usuário (com criação automática de uma carteira vinculada)
- Login via JWT, transportado em cookie `httpOnly` (`token`, expira em 2h) — com fallback via header `Authorization: Bearer <token>`
- Logout (limpa o cookie de sessão)
- Troca de senha autenticada

### Carteira e transações
- Consulta da carteira do usuário autenticado
- Saldo com cache em Redis, atualizado automaticamente a cada nova transação
- Criação de transações (receita/`CREDIT` ou despesa/`DEBIT`), categorizadas
- Listagem de transações, com filtro opcional por categoria e tipo, ordenadas por data (mais recentes primeiro)

### Metas de economia
- Criação de metas com valor alvo (`targetAmount`)
- Depósito incremental em uma meta (soma ao `savedAmount`, retorna se a meta foi atingida e quanto falta)
- Listagem e exclusão de metas

### Endpoints

| Método | Rota | Autenticação |
|---|---|---|
| POST | `/users` | não |
| POST | `/sessions` | não |
| POST | `/sessions/logout` | não |
| PATCH | `/users/me/password` | sim |
| GET | `/users/me/wallet` | sim |
| GET | `/users/me/wallet/balance` | sim |
| POST | `/users/me/transactions` | sim |
| GET | `/users/me/transactions` | sim |
| POST | `/users/me/goals` | sim |
| GET | `/users/me/goals` | sim |
| PATCH | `/users/me/goals/:goalId` | sim |
| DELETE | `/users/me/goals/:goalId` | sim |

Detalhes completos de payloads, respostas, formato de erros e regras de negócio para consumo por um front-end estão em [`BACKEND_GUIDE.md`](./BACKEND_GUIDE.md).

## Testes

O projeto tem testes unitários (entidades de domínio e casos de uso, com repositórios/serviços *fake* em `tests/fakes`) e testes de integração (transações Prisma reais, contra o banco `db_test`).

```bash
# subir o banco de teste (se ainda não estiver rodando)
docker compose up -d db_test

npm run test:run
```
