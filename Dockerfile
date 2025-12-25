# ============================
# Stage 1: Builder
# ============================
FROM node:22-alpine AS builder

# Garante a versão do pnpm do repo (packageManager)
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

WORKDIR /app

# Copia arquivos de dependência e patches
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Instala dependências (reprodutível)
RUN pnpm install --frozen-lockfile

# Copia todo o código fonte
COPY . .

# --- VARIÁVEIS PARA O FRONTEND (Build) ---
# Necessárias para que o Vite "asse" as configurações no Javascript
ARG VITE_STRIPE_PUBLISHABLE_KEY
ARG VITE_ANALYTICS_ENDPOINT
ARG VITE_ANALYTICS_WEBSITE_ID
ARG VITE_OAUTH_PORTAL_URL
ARG VITE_APP_ID
ARG VITE_API_URL

ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY
ENV VITE_ANALYTICS_ENDPOINT=$VITE_ANALYTICS_ENDPOINT
ENV VITE_ANALYTICS_WEBSITE_ID=$VITE_ANALYTICS_WEBSITE_ID
ENV VITE_OAUTH_PORTAL_URL=$VITE_OAUTH_PORTAL_URL
ENV VITE_APP_ID=$VITE_APP_ID
ENV VITE_API_URL=$VITE_API_URL
# -----------------------------------------

# Constrói o site
RUN pnpm build

# ============================
# Stage 2: Production (Runner)
# ============================
FROM node:22-alpine

# Garante a versão do pnpm do repo (packageManager)
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

WORKDIR /app

# Copia arquivos essenciais
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Instala dependências (inclui devDependencies p/ tsx/drizzle em runtime)
# Forçamos development para garantir que as ferramentas de banco funcionem
RUN NODE_ENV=development pnpm install --frozen-lockfile

# Copia os arquivos do site construído
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/scripts ./scripts

# --- AQUI ESTAVA FALTANDO: Copia a configuração do banco ---
# Sem isso, o db:push não sabe como criar as tabelas
COPY --from=builder /app/drizzle.config.ts ./
# -----------------------------------------------------------

# Cria pasta de storage
RUN mkdir -p storage

# Expõe a porta
EXPOSE 3000

ENV NODE_ENV=production

# --- COMANDO FINAL ---
# 1. Aplica migrações com verificações de segurança (db:migrate)
# 2. Inicia o servidor (start)
CMD ["sh", "-c", "pnpm db:migrate && pnpm start"]
