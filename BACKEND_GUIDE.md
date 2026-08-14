# Guia do Back-end (para construção do Front-end)

Este documento descreve como o back-end desta API funciona, para que seja possível construir um front-end que consuma seus endpoints sem precisar ler todo o código-fonte.

## 1. Visão geral

- **Stack**: Node.js + TypeScript, Express, Prisma (PostgreSQL) via `@prisma/adapter-pg`, Redis para cache.
- **Arquitetura em camadas** (Clean Architecture): `src/domain`, `src/application`, `src/infrastructure`, `src/database`, `src/main`.
- **Entry point**: `src/main/app.ts` monta o app Express (`cors()`, `express.json()`, rotas, e por último o `errorMiddleware`). `src/main/server.ts` conecta o Redis, registra os listeners de eventos de domínio e sobe o servidor.
- **Sem prefixo `/api`** — as rotas ficam na raiz: `/users`, `/sessions`, `/users/me/...`.
- **Porta**: `process.env.PORT` ou `3000` como padrão.
- **CORS**: hoje está fixo em `origin: "http://localhost:8080"`, com `credentials: true` (`src/main/app.ts`). Se o front-end rodar em outra porta, esse valor precisa ser ajustado no back-end antes de testar a integração. O front deve enviar as requisições com `credentials: "include"` (fetch) ou `withCredentials: true` (axios) para o navegador enviar/receber o cookie de sessão.
- **Variáveis de ambiente**: `NODE_ENV`, `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `PORT` (opcional). Não existe `.env.example` no repositório.

## 2. Autenticação

- Baseada em **JWT**, transportado em um **cookie `httpOnly`** chamado `token` (`Set-Cookie: token=...; HttpOnly; SameSite=Lax; Path=/; Max-Age=7200`). O front-end **não precisa (e não consegue) ler ou armazenar o token manualmente** — o navegador cuida disso automaticamente, desde que as requisições sejam feitas com `credentials: "include"` (fetch) / `withCredentials: true` (axios).
- Como fallback, o middleware de autenticação também aceita o header `Authorization: Bearer <token>` (útil para Postman/testes), mas o front-end deve depender apenas do cookie.
- **Login**: `POST /sessions` com `{ email, password }` seta o cookie `token` na resposta e retorna `{ user }` no corpo (sem o token, sem `passwordHash`).
- **Logout**: `POST /sessions/logout` limpa o cookie `token` e retorna `{ message }`. É a única forma de encerrar a sessão do lado do front, já que JS não consegue apagar um cookie `httpOnly` diretamente.
- O token/cookie expira em **2 horas**. Não existe endpoint de refresh — o front precisa detectar `401` e redirecionar para login novamente.
- Erros comuns de autenticação (todos `401`): `"Token não informado"`, `"Token mal formatado"`, `"Token inválido"`, `"Usuário não autenticado"`.

## 3. Endpoints

Todas as requisições e respostas são em JSON. Os corpos são validados com Zod usando `.strict()` — **campos extras no corpo são rejeitados**.

| Método | Rota | Auth | Corpo / Query | Resposta de sucesso |
|---|---|---|---|---|
| POST | `/users` | não | `{ name (3-100), email, password (4-100) }` | `201` `{ id, name, email, createdAt }` |
| POST | `/sessions` | não | `{ email, password (4-100) }` | `200` `{ user }` (+ cookie `token`) |
| POST | `/sessions/logout` | não | — | `200` `{ message }` (limpa o cookie `token`) |
| PATCH | `/users/me/password` | Bearer/cookie | `{ currentPassword, newPassword }` (4-100 cada) | `200` `{ message }` |
| GET | `/users/me/wallet` | Bearer/cookie | — | `200` `{ id, userId }` |
| GET | `/users/me/wallet/balance` | Bearer/cookie | — | `200` `{ balance: number }` |
| POST | `/users/me/transactions` | Bearer/cookie | `{ name (3-30), amount (>0), category, transactionType }` | `201` `{ name, amount, category, transactionType, createdAt }` |
| GET | `/users/me/transactions` | Bearer/cookie | query `?category=&transactionType=` (opcionais) | `200` array de transações, ordenado por `createdAt` desc |
| POST | `/users/me/goals` | Bearer/cookie | `{ name (3-100), description? (10-150), targetAmount (>0) }` | `201` `{ name, description, targetAmount, savedAmount, createdAt }` |
| GET | `/users/me/goals` | Bearer/cookie | — | `200` array de metas, ordenado por `createdAt` desc |
| PATCH | `/users/me/goals/:goalId` | Bearer/cookie | `{ amount (>0) }` | `200` `{ goalReached, remainingAmount }` |
| DELETE | `/users/me/goals/:goalId` | Bearer/cookie | — | `200` `{ message }` |

### Enums

- `Category`: `LEISURE` | `GROCERIES` | `EXPENSES` | `SHOPPING` | `FOOD` | `SALARY`
- `TransactionType`: `DEBIT` | `CREDIT`

### Observações importantes

- **`PATCH /users/me/goals/:goalId` é um depósito incremental**, não uma edição geral da meta: o valor enviado em `amount` é somado a `savedAmount`. A resposta traz apenas `{ goalReached, remainingAmount }`, **não** a meta atualizada inteira — se precisar exibir a meta atualizada, chame `GET /users/me/goals` novamente.
- **Não há endpoint combinado**: para montar uma tela de carteira, o front precisa chamar `GET /users/me/wallet`, `GET /users/me/wallet/balance` e `GET /users/me/transactions` separadamente.
- **Sem paginação** em transações e metas — todos os registros voltam de uma vez (transações podem ser filtradas por `category`/`transactionType`).
- **Transações e metas não retornam `id`** nos DTOs de resposta (`TransactionDto` e `GoalDto`), apenas os campos listados na tabela.

## 4. Formato de erros

Toda a API usa um middleware de erro central (`error-middleware.ts`), que produz três formatos possíveis:

1. **Erro de negócio** (`BusinessError`):
   ```json
   { "error": "BusinessError", "message": "<mensagem>" }
   ```
   Status code varia conforme o erro (400, 401, 404 ou 409).

2. **Erro de validação (Zod)** — corpo/query fora do schema:
   ```json
   {
     "message": "Dados inválidos",
     "errors": [{ "field": "email", "message": "..." }]
   }
   ```
   Sempre `400`.

3. **Erro genérico não tratado**:
   ```json
   { "error": "Erro interno do servidor." }
   ```
   Sempre `500`.

**Atenção**: algumas regras de negócio dentro das entidades (ex.: tentar guardar em uma meta um valor que ultrapasse `targetAmount`) lançam um `Error` comum em vez de `BusinessError`, e por isso caem no formato genérico de `500` em vez de um `400` mais específico. Não confie apenas no status code para decidir a mensagem exibida ao usuário — trate também o texto de `message`, quando disponível.

### Mensagens de erro mais comuns (em português, vêm prontas da API)

- `401`: "Token não informado", "Token mal formatado", "Token inválido", "Usuário não autenticado", "Usuário não encontrado" (troca de senha), "Senha incorreta", "A senha deve ser diferente da atual"
- `404`: "Usuário não encontrado" (metas), "Meta não encontrada", "Carteira não encontrada" / "Carteira não encontrada para o usuário"
- `409`: "Email já cadastrado"
- `400`: "E-mail ou senha inválidos" (login — mensagem genérica de propósito, não indica se foi o e-mail ou a senha), "A senha deve conter no mínimo 4 caracteres"

## 5. Modelo de dados (referência rápida)

- **User**: `id`, `name`, `email` (único), `passwordHash`, `createdAt`. Tem uma `Wallet` e várias `Goal`.
- **Wallet**: `id`, `userId` (1:1 com User). Tem várias `Transaction`.
- **Transaction**: `id`, `walletId`, `name`, `category`, `amount`, `transactionType`, `createdAt`.
- **Goal**: `id`, `userId`, `name`, `description`, `targetAmount`, `savedAmount`, `createdAt`.
- **AuditLog**: uso interno, não é exposto por nenhuma rota HTTP.

**Atenção com números**: `amount`, `targetAmount` e `savedAmount` são armazenados como `Decimal(14,2)` no banco, mas circulam como `number` no domínio. Vale conferir no front como esses valores realmente chegam serializados no JSON (número ou string), especialmente para evitar problemas de arredondamento.

## 6. Comportamento assíncrono (bom saber)

Criar uma transação (`POST /users/me/transactions`) dispara internamente um evento (`transaction.created`) que:
1. Atualiza o cache de saldo no Redis (o que `GET /users/me/wallet/balance` lê).
2. Grava um registro de auditoria (`AuditLog`, não exposto via API).

Isso acontece de forma síncrona dentro do mesmo processo (sem fila externa), então na prática o saldo já reflete a nova transação assim que a resposta HTTP volta — mas não há garantia formal disso, já que falhas nesses listeners são apenas logadas e não interrompem a requisição original.

## 7. Resumo de pontos de atenção para o front-end

- CORS hoje só libera `http://localhost:8080` (com `credentials: true`) — ajustar no back-end se o front rodar em outra porta, e sempre enviar as requisições com `credentials: "include"`/`withCredentials: true` para o cookie de sessão funcionar.
- Autenticação é via cookie `httpOnly` `token` (setado no login, limpo no logout) — o front não manipula o token diretamente, só garante que os cookies sejam enviados em cada requisição.
- `TransactionDto` e `GoalDto` não trazem `id`.
- Atualizar uma meta (`PATCH .../goals/:goalId`) é sempre um depósito incremental, e não retorna a meta completa.
- Alguns erros de regra de negócio podem chegar como `500` genérico em vez de `400`.
- Sem paginação, sem refresh token — token/cookie expira em 2h (existe logout via `POST /sessions/logout`).
