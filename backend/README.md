# Backend API

## 1. Visão Geral

Esta API implementa um sistema completo de gerenciamento de Usuários e Cargos com autenticação por JWT e refresh tokens. Construído em Node.js 20 com Express e Prisma (PostgreSQL), o projeto segue uma arquitetura limpa em camadas, com separação clara entre domínio, repositórios, serviços e controladores. Para uma demonstração rápida das funcionalidades consulte o vídeo na seção [11](#11-vídeo-demo).

![Screenshot](docs/screenshot-backend.png)

## 2. Arquitetura & Decisões

O repositório segue a proposta de DDD light, com pastas bem definidas:

- **src/config**: configurações de ambiente;
- **src/domain**: definição de entidades e DTOs;
- **src/repositories**: acesso aos dados via Prisma;
- **src/services**: regras de negócio;
- **src/controllers**: controladores HTTP;
- **src/middlewares**: autenticação, autorização, validação, rate limiter e tratamento de erros;
- **src/routes**: definições de rotas agrupadas;
- **src/infra**: instâncias de banco de dados e JWT.

Optou‑se pelo **Prisma** como ORM pela tipagem forte e facilidade de migrações. JWT com refresh token rotacionável oferece segurança e flexibilidade, com tabela de whitelist para revogação. Logs estruturados são feitos com Pino. O rate‑limiter protege a rota de login. As senhas são armazenadas com Bcrypt. Toda a camada de acesso utiliza injeção por módulo, facilitando testes.

## 3. Requisitos

* Node 20+
* PNPM ou NPM
* Docker e Docker Compose
* PostgreSQL 16 (subindo via docker‑compose)

## 4. Ambiente

Faça uma cópia de `.env.example` para `.env` e ajuste os segredos de acordo com sua necessidade:

```
PORT=3333
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/app?schema=public
JWT_SECRET=<sua-chave-jwt>
JWT_REFRESH_SECRET=<sua-chave-refresh>
RATE_LIMIT_MAX=5
RATE_LIMIT_WINDOW=60
```

## 5. Subindo com Docker

Execute no diretório `backend`:

```bash
docker compose up -d
```

O serviço `postgres` disponibiliza o banco e o `pgadmin` expõe uma interface em `http://localhost:5050` (usuário `admin@admin.com`, senha `admin`). O serviço `app` sobe a API em `http://localhost:3333`.

## 6. Banco & Migrations

Para aplicar as migrações e popular o banco com um usuário administrador e alguns cargos, utilize os scripts NPM:

```bash
npm run migrate
npm run seed
```

As migrações geradas pelo Prisma ficam em `prisma/migrations/`. Há também um arquivo consolidado `prisma/database.sql` com todas as instruções SQL necessárias.

## 7. Executando

Em modo de desenvolvimento:

```bash
npm install
npm run dev
```

A API ficará disponível em `http://localhost:3333`. Para produção dentro do contêiner, use `npm start`.

## 8. Testes & Cobertura

Os testes de integração foram escritos com Jest e Supertest. Para rodar:

```bash
npm test
```

Para relatório de cobertura:

```bash
npm run test:coverage
```

O objetivo é manter pelo menos 80 % de cobertura. A configuração do Jest está em `jest.config.js`.

## 9. Coleções de API

Uma coleção para Insomnia/Thunder Client contendo exemplos de requisições está disponível no diretório `docs/` (`collection.json`). Importe no seu cliente HTTP favorito para explorar os endpoints.

## 10. SQL das Tabelas

O arquivo `prisma/database.sql` consolida o schema e pode ser consultado para fins de verificação ou execução manual. As migrações do Prisma também podem ser inspecionadas em `prisma/migrations/`.

## 11. Vídeo Demo

Um vídeo de 3 minutos demonstrando o fluxo completo (login, CRUD cargos, CRUD usuários, associação de cargos, listagem por cargo, atualização, desativação, logout e renovação de token) será fornecido através de um link aqui. *(Faça upload no YouTube/Drive e substitua este texto pelo link).*

## 12. Roadmap & Melhorias Futuras

* Implementar RBAC avançado com permissões granulares;
* Auditoria completa de ações de usuários (trilhas de auditoria);
* Internacionalização (i18n) da API;
* Extensão PWA no frontend;
* Sistema de temas claro/escuro;
* Otimizar testes e cobertura contínua via CI;
* Implementar mensageria (fila) para envio de emails de boas‑vindas e recuperação de senha;
* Adicionar linter/formatador em pre-commit com Husky e lint-staged.