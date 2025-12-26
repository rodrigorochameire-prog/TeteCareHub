# 📝 Instruções: Criar Arquivo .env

## 🎯 Problema

O `dotenv` por padrão carrega apenas `.env`, não `.env.local`. 

**Solução:** Crie um arquivo `.env` na raiz do projeto.

---

## 🚀 Opção 1: Copiar Manualmente (Recomendado)

Execute no terminal:

```bash
cp .env.local .env
```

---

## 🚀 Opção 2: Criar Manualmente

Crie um arquivo `.env` na raiz do projeto com este conteúdo:

```bash
# Supabase
VITE_SUPABASE_URL=https://siwapjqndevuwsluncnr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpd2FwanFuZGV2uwsluncnrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MDcwOTQsImV4cCI6MjA4MjA4MzA5NH0.TZY7Niw2qT-Pp3vMc2l5HO-Pq6dcEGvjKBrxBYQwm_4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpd2FwanFuZGV2uwsluncnrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImiYXQiOjE3NjY1MDcwOTQsImV4cCI6MjA4MjA4MzA5NH0.aS2tpEkxHEXZ3mbclUg1ol_DgaJzv3WulcvXokftUmo

# Database (pegar em Supabase → Settings → Database)
DATABASE_URL=postgresql://postgres:[401bFr505*]@db.siwapjqndevuwsluncnr.supabase.co:5432/postgres

# App
NODE_ENV=production
VITE_APP_ID=tete-house-hub
JWT_SECRET=qualquer_string_aleatoria_aqui
PORT=3000
```

**⚠️ IMPORTANTE:** 
- Substitua `[401bFr505*]` pela senha real do banco (se diferente)
- Ou copie a `DATABASE_URL` completa do Supabase Dashboard

---

## ✅ Após Criar .env

1. **Rebuild (se necessário):**
   ```bash
   pnpm build
   ```

2. **Testar:**
   ```bash
   pnpm start
   ```

---

## 🔧 Alternativa: Modificar Código

Já modifiquei o código para carregar `.env.local` também. Mas ainda é recomendado criar `.env` para produção.

---

**🚀 Execute: `cp .env.local .env` e depois `pnpm build && pnpm start`**






## 🎯 Problema

O `dotenv` por padrão carrega apenas `.env`, não `.env.local`. 

**Solução:** Crie um arquivo `.env` na raiz do projeto.

---

## 🚀 Opção 1: Copiar Manualmente (Recomendado)

Execute no terminal:

```bash
cp .env.local .env
```

---

## 🚀 Opção 2: Criar Manualmente

Crie um arquivo `.env` na raiz do projeto com este conteúdo:

```bash
# Supabase
VITE_SUPABASE_URL=https://siwapjqndevuwsluncnr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpd2FwanFuZGV2uwsluncnrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MDcwOTQsImV4cCI6MjA4MjA4MzA5NH0.TZY7Niw2qT-Pp3vMc2l5HO-Pq6dcEGvjKBrxBYQwm_4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpd2FwanFuZGV2uwsluncnrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImiYXQiOjE3NjY1MDcwOTQsImV4cCI6MjA4MjA4MzA5NH0.aS2tpEkxHEXZ3mbclUg1ol_DgaJzv3WulcvXokftUmo

# Database (pegar em Supabase → Settings → Database)
DATABASE_URL=postgresql://postgres:[401bFr505*]@db.siwapjqndevuwsluncnr.supabase.co:5432/postgres

# App
NODE_ENV=production
VITE_APP_ID=tete-house-hub
JWT_SECRET=qualquer_string_aleatoria_aqui
PORT=3000
```

**⚠️ IMPORTANTE:** 
- Substitua `[401bFr505*]` pela senha real do banco (se diferente)
- Ou copie a `DATABASE_URL` completa do Supabase Dashboard

---

## ✅ Após Criar .env

1. **Rebuild (se necessário):**
   ```bash
   pnpm build
   ```

2. **Testar:**
   ```bash
   pnpm start
   ```

---

## 🔧 Alternativa: Modificar Código

Já modifiquei o código para carregar `.env.local` também. Mas ainda é recomendado criar `.env` para produção.

---

**🚀 Execute: `cp .env.local .env` e depois `pnpm build && pnpm start`**






