# Build stage
FROM node:22-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@9.15.4

WORKDIR /app

# Copia os arquivos de configuração e patches PRIMEIRO
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Instala todas as dependências (sem frozen-lockfile para evitar erros de versão)
RUN pnpm install

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Production stage
FROM node:22-alpine

# Install pnpm
RUN npm install -g pnpm@9.15.4

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# IMPORTANTE: Copia os patches também para o estágio de produção
COPY patches ./patches

# Install production dependencies only (sem frozen-lockfile)
RUN pnpm install --prod

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/storage ./storage

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start application
CMD ["pnpm", "start"]