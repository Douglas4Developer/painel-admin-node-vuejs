# backend/Dockerfile
FROM node:20-bookworm-slim
ENV DEBIAN_FRONTEND=noninteractive
WORKDIR /usr/src/app

# Dependências de build para módulos nativos (bcrypt)
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ ca-certificates openssl libssl3 \
  && rm -rf /var/lib/apt/lists/*

# Instala só o que precisa para resolver dependências
COPY package.json package-lock.json ./
RUN npm ci

# Copia o restante do código (sem node_modules por causa do .dockerignore)
COPY . .

# Gera o client do Prisma após copiar schema
RUN npx prisma generate

EXPOSE 3333

# Em produção, rode as migrations e suba a API
CMD ["sh","-c","npm run migrate && node src/index.js"]
