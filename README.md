# 🧑‍💻 Sistema de Cadastro de Usuários e Cargos

Este projeto foi desenvolvido como parte de um **teste técnico** com foco em **Node.js, Express, PostgreSQL, Vue.js 3 (Composition API) e Vuetify**.
O sistema permite o gerenciamento de **usuários e cargos**, incluindo autenticação JWT e operações de CRUD.

---

## 🚀 Funcionalidades

* [x] **Cadastro de Usuário** (nome, e-mail, senha, status ativo/inativo)
* [x] **Cadastro de Cargo** (nome do cargo)
* [x] **Vincular Usuário a Cargo**
* [x] **Listagem de Usuários por Cargo**
* [x] **Atualizar Usuário e Cargo**
* [x] **Desativar Usuário** (soft delete / toggle ativo)
* [x] **Autenticação JWT** (sessão de 60 minutos + renovação)
* [x] **Tela de Login**
* [x] **Logout** com redirecionamento para a tela de login

---

## 🛠️ Tecnologias Utilizadas

### Backend

* [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
* [PostgreSQL](https://www.postgresql.org/)
* [Prisma ORM](https://www.prisma.io/) *(ou Sequelize se preferir)*
* [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) para autenticação JWT
* [bcrypt](https://www.npmjs.com/package/bcrypt) para hash de senhas

### Frontend

* [Vue.js 3](https://vuejs.org/) (Composition API)
* [Vuetify](https://vuetifyjs.com/) para UI moderna e responsiva
* [Vue Router](https://router.vuejs.org/)
* [Axios](https://axios-http.com/) para comunicação com a API

---

## 🗄️ Banco de Dados

O banco é PostgreSQL.
Segue o **SQL inicial das tabelas**:

```sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS "Role" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" varchar(255) UNIQUE NOT NULL,
  "description" text NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "User" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" varchar(255) NOT NULL,
  "email" varchar(255) UNIQUE NOT NULL,
  "passwordHash" varchar(255) NOT NULL,
  "isActive" boolean NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "UserRole" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" uuid NOT NULL,
  "roleId" uuid NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "UserRole_user_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "UserRole_role_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE,
  CONSTRAINT "UserRole_userId_roleId_key" UNIQUE ("userId", "roleId")
);

CREATE TABLE IF NOT EXISTS "RefreshToken" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" uuid NOT NULL,
  "tokenHash" varchar(255) NOT NULL,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "revokedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "RefreshToken_user_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
```

---

## ⚙️ Como Executar

### 🔹 1. Clonar o Repositório

```bash
git clone https://github.com/SEU_USUARIO/nome-do-projeto.git
cd nome-do-projeto
```

O projeto está dividido em **duas pastas**:

* `/src-back` → Backend (Node.js/Express)
* `/src-front` → Frontend (Vue.js 3 + Vuetify)

---

### 🔹 2. Configurar o Banco de Dados

1. Crie um banco no PostgreSQL:

```sql
CREATE DATABASE app;
```

2. Configure o `.env` dentro de `/src-back`:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/app"
JWT_SECRET="sua_chave_secreta"
JWT_EXPIRATION="60m"
PORT=3333
```

---

perfeito! vou te deixar trechos prontos pra colar no README cobrindo:

1. por que os nomes estão em inglês
2. passo-a-passo **correto** para subir o **backend com Docker + Prisma** (migrate + seed)
3. comandos úteis e notas de `.env`

---

# 📝 Convenções de Nomenclatura (por que inglês?)

Adotei nomes em **inglês** (ex.: `User`, `Role`, `users`, `roles`) por três motivos:

* **Padrão de comunidade**: a maioria das libs/ORMS, docs e exemplos usam inglês; isso reduz atrito ao pesquisar e integrar.
* **Clareza entre backend e frontend**: manter o mesmo vocabulário em API, modelos e telas evita “traduções” mentais.
* **Escalabilidade do time**: facilita contribuição de devs que não falam português.

> Mesmo com o produto em PT-BR, código, schemas e endpoints seguem inglês por consistência.

---

# ⚙️ Backend com Docker + Prisma (migrate + seed)

### Pré-requisitos

* Docker + Docker Compose
* Arquivo `.env` no diretório `/src-back`:

```env
# Se usar Docker Compose com serviço "db" (Postgres)
DATABASE_URL="postgresql://postgres:postgres@db:5432/app?schema=public"

# JWT
JWT_SECRET="change-me"
JWT_EXPIRATION="60m"

# Porta do app
PORT=3333
```

> **Importante:** dentro do Docker, o host do Postgres é o **nome do serviço** (ex.: `db`), **não** `localhost`.

---

## Subindo do zero (ordem recomendada)

> No diretório **/src-back**

```bash
# 1) subir/constuir containers (db + app)
docker compose up -d --build

# 2) aplicar migrations (gera/atualiza tabelas)
docker compose exec app npx prisma migrate dev --name init

# 3) seed opcional (cadastra dados iniciais, ex.: roles, admin, etc.)
docker compose exec app npx prisma db seed

# 4) reiniciar o app (só por garantia, se necessário)
docker compose restart app
```

* O servidor sobe em: `http://localhost:3333`
* Endpoints principais: `/auth/login`, `/auth/refresh`, `/users`, `/roles`…

### Rodando sem rebuild (ambiente já construído)

```bash
docker compose up -d
docker compose exec app npx prisma migrate dev
docker compose exec app npx prisma db seed
```

### Reset do banco (opcional, cuidado!)

```bash
docker compose exec app npx prisma migrate reset
# responde 'y' quando solicitado (isso derruba/recria e roda o seed)
```

---

# 🧪 Comandos úteis (backend)

```bash
# logs do app
docker compose logs -f app

# abrir shell no container do app
docker compose exec app sh

# verificar status dos serviços
docker compose ps
```

---

# 🖥️ Frontend

* **Porta:** `http://localhost:5173`
* **Proxy:** requisições a `/api` redirecionam para `http://localhost:3333` (configurado no `vite.config.ts`)
* **Rodar:**

  ```bash
  cd src-front
  npm install
  npm run dev
  ```

---

# 🔐 Fluxo de Autenticação (resumo)

* **Login**: `POST /auth/login` → retorna `accessToken` (60m) e `refreshToken`.
* O **frontend** salva e usa `accessToken`; próximo da expiração tenta **refresh** transparente.
* **Logout**: invalida o refresh no backend e limpa tokens no frontend.

---

# 🧩 Dicas rápidas de ambiente

* Se o **frontend** não encontra o backend, confirme:

  * `vite.config.ts` tem o proxy:

    ```ts
    server: {
      proxy: { '/api': { target: 'http://localhost:3333', changeOrigin: true } }
    }
    ```
  * As chamadas Axios usam **`/api`** como base (ou `VITE_API_URL` no `.env` do front).
* Se o Prisma errar conectando em `localhost`, troque por `db` na `DATABASE_URL` (dentro do Docker).

--- 

## 🔐 Autenticação

* Login: via **/auth/login** com `email` + `senha`.
* Retorna um **token JWT** válido por **60 minutos**.
* O frontend renova automaticamente antes da expiração.
* Logout: invalida o token e redireciona para a tela de login.

---

## 📂 Estrutura do Projeto

```
/src-back
  ├── prisma/             # schema do banco (se usar Prisma)
  ├── src/
  │   ├── controllers/    # Regras de controle das rotas
  │   ├── services/       # Lógica de negócios
  │   ├── middlewares/    # Middleware (auth JWT, erros, etc.)
  │   ├── routes/         # Rotas Express
  │   └── server.js       # Inicialização
  └── package.json

/src-front
  ├── src/
  │   ├── components/     # Componentes Vue
  │   ├── views/          # Telas (Login, Usuários, Cargos, etc.)
  │   ├── router/         # Vue Router
  │   └── store/          # Estado global (Pinia ou Vuex)
  └── package.json
```
 
## 👨‍💻 Autor

**Douglas Soares de Souza Ferreira**
📧 \[[seuemail@exemplo.com](mailto:douglas8_ferreira@hotmail.com)]
🔗 [LinkedIn](https://www.linkedin.com/in/douglas-soares-de-souza-ferreira/)
🔗 [GitHub](https://github.com/Douglas4Developer)

---
 
