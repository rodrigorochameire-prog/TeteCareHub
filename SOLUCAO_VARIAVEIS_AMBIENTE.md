# 🔧 Solução: Variáveis de Ambiente Não Carregadas

## 🎯 Problema

O `dotenv` por padrão carrega apenas `.env`, não `.env.local`. O código está procurando por:
- `VITE_SUPABASE_URL` ou `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## 🚀 Solução Rápida

### Opção 1: Criar arquivo `.env` (Recomendado)

Crie um arquivo `.env` na raiz do projeto com o mesmo conteúdo do `.env.local`:

```bash
# Copiar conteúdo do .env.local para .env
cp .env.local .env
```

**OU crie manualmente:**

```bash
# Supabase
VITE_SUPABASE_URL=https://siwapjqndevuwsluncnr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.siwapjqndevuwsluncnr.supabase.co:5432/postgres

# App
NODE_ENV=production
VITE_APP_ID=tete-house-hub
JWT_SECRET=qualquer_string_aleatoria_aqui
PORT=3000
```

**⚠️ IMPORTANTE:** Substitua `[PASSWORD]` pela senha real do banco.

---

### Opção 2: Configurar dotenv para carregar .env.local

Modificar `server/_core/index.ts` para carregar `.env.local`:

```typescript
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
```

---

## 📋 Passos

1. **Criar `.env` na raiz:**
   ```bash
   # Copiar do .env.local
   cp .env.local .env
   ```

2. **Verificar conteúdo:**
   ```bash
   cat .env
   ```

3. **Testar novamente:**
   ```bash
   pnpm start
   ```

---

## ✅ Após Criar .env

O servidor deve iniciar corretamente. Se ainda houver erros, me envie as mensagens.

---

**🚀 Execute: `cp .env.local .env` e depois `pnpm start`**






## 🎯 Problema

O `dotenv` por padrão carrega apenas `.env`, não `.env.local`. O código está procurando por:
- `VITE_SUPABASE_URL` ou `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## 🚀 Solução Rápida

### Opção 1: Criar arquivo `.env` (Recomendado)

Crie um arquivo `.env` na raiz do projeto com o mesmo conteúdo do `.env.local`:

```bash
# Copiar conteúdo do .env.local para .env
cp .env.local .env
```

**OU crie manualmente:**

```bash
# Supabase
VITE_SUPABASE_URL=https://siwapjqndevuwsluncnr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.siwapjqndevuwsluncnr.supabase.co:5432/postgres

# App
NODE_ENV=production
VITE_APP_ID=tete-house-hub
JWT_SECRET=qualquer_string_aleatoria_aqui
PORT=3000
```

**⚠️ IMPORTANTE:** Substitua `[PASSWORD]` pela senha real do banco.

---

### Opção 2: Configurar dotenv para carregar .env.local

Modificar `server/_core/index.ts` para carregar `.env.local`:

```typescript
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
```

---

## 📋 Passos

1. **Criar `.env` na raiz:**
   ```bash
   # Copiar do .env.local
   cp .env.local .env
   ```

2. **Verificar conteúdo:**
   ```bash
   cat .env
   ```

3. **Testar novamente:**
   ```bash
   pnpm start
   ```

---

## ✅ Após Criar .env

O servidor deve iniciar corretamente. Se ainda houver erros, me envie as mensagens.

---

**🚀 Execute: `cp .env.local .env` e depois `pnpm start`**






