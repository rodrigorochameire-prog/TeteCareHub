# ============================
# Stage 1: Builder
# ============================
FROM node:22-alpine AS builder

# Instala o pnpm
RUN npm install -g pnpm@9.15.4

WORKDIR /app

# Copia arquivos de dependência e patches
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Instala todas as dependências
RUN pnpm install

# Copia todo o código fonte
COPY . .

# --- VARIÁVEIS PARA O FRONTEND (Build) ---
ARG VITE_STRIPE_PUBLISHABLE_KEY
ARG VITE_ANALYTICS_ENDPOINT
ARG VITE_ANALYTICS_WEBSITE_ID
ARG VITE_OAUTH_PORTAL_URL
ARG VITE_APP_ID

ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY
ENV VITE_ANALYTICS_ENDPOINT=$VITE_ANALYTICS_ENDPOINT
ENV VITE_ANALYTICS_WEBSITE_ID=$VITE_ANALYTICS_WEBSITE_ID
ENV VITE_OAUTH_PORTAL_URL=$VITE_OAUTH_PORTAL_URL
ENV VITE_APP_ID=$VITE_APP_ID
# -----------------------------------------

# Constrói o site
RUN pnpm build

# ============================
# Stage 2: Production (Runner)
# ============================
FROM node:22-alpine

# Instala o pnpm
RUN npm install -g pnpm@9.15.4

WORKDIR /app

# Copia arquivos essenciais
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Instala dependências (forçando mode development para baixar o Vite)
RUN NODE_ENV=development pnpm install

# Copia os arquivos construídos na etapa anterior
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared

# Cria pasta de storage
RUN mkdir -p storage

# Expõe a porta
EXPOSE 3000

# Define ambiente de produção
ENV NODE_ENV=production

# --- COMANDO MÁGICO FINAL ---
# Executa o "db:push" para criar as tabelas e depois inicia o servidor
CMD ["sh", "-c", "pnpm db:push && pnpm start"]
