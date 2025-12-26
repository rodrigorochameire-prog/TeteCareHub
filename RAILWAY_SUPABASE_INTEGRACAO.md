# 🔗 Integração Railway + Supabase Database

## 📋 Como Funciona

O **Railway** e o **Supabase** são serviços separados, mas trabalham juntos:

- **Supabase**: Hospeda o banco de dados PostgreSQL
- **Railway**: Hospeda a aplicação Node.js/Express
- **Conexão**: A aplicação no Railway se conecta ao banco do Supabase via `DATABASE_URL`

## 🔑 Variável de Ambiente: DATABASE_URL

### Onde Obter

No **Supabase Dashboard**:

1. Vá em **Settings** → **Database**
2. Role até **Connection string**
3. Selecione **URI** (não "Session mode")
4. Copie a string de conexão

**Formato:**
```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

### Como Configurar no Railway

1. No **Railway Dashboard**, vá em seu projeto
2. Clique em **Variables**
3. Adicione a variável:
   - **Nome**: `DATABASE_URL`
   - **Valor**: Cole a string de conexão do Supabase
4. Clique em **Add**

### ⚠️ IMPORTANTE: Senha do Banco

A senha está na string de conexão. Se não souber:

1. **Supabase Dashboard** → **Settings** → **Database**
2. Role até **Database password**
3. Se não souber, pode **resetar** a senha
4. Atualize a `DATABASE_URL` com a nova senha

---

## 🔐 Outras Variáveis do Supabase Necessárias

Além do `DATABASE_URL`, você também precisa:

### 1. **SUPABASE_URL**
```
https://[PROJECT_REF].supabase.co
```
- Onde encontrar: **Settings** → **API** → **Project URL**

### 2. **SUPABASE_ANON_KEY** (Publishable Key)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- Onde encontrar: **Settings** → **API** → **Project API keys** → **anon** `public`

### 3. **SUPABASE_SERVICE_ROLE_KEY** (Secret Key)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- Onde encontrar: **Settings** → **API** → **Project API keys** → **service_role** `secret`
- ⚠️ **NUNCA** exponha esta chave no frontend!

### 4. **VITE_SUPABASE_URL** (para o frontend)
```
https://[PROJECT_REF].supabase.co
```
- Mesmo valor do `SUPABASE_URL`

### 5. **VITE_SUPABASE_ANON_KEY** (para o frontend)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- Mesmo valor do `SUPABASE_ANON_KEY`

---

## 📊 Checklist de Variáveis no Railway

Adicione todas estas variáveis no Railway:

### Backend (Server):
- [ ] `DATABASE_URL` - String de conexão PostgreSQL do Supabase
- [ ] `SUPABASE_URL` - URL do projeto Supabase
- [ ] `SUPABASE_ANON_KEY` - Chave pública (anon)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Chave secreta (service_role)
- [ ] `NODE_ENV=production`
- [ ] `PORT=3000` (Railway define automaticamente, mas pode definir manualmente)

### Frontend (Build-time):
- [ ] `VITE_SUPABASE_URL` - URL do projeto Supabase
- [ ] `VITE_SUPABASE_ANON_KEY` - Chave pública (anon)

### Opcionais (se usar):
- [ ] `STRIPE_SECRET_KEY` - Se usar pagamentos
- [ ] `STRIPE_WEBHOOK_SECRET` - Se usar webhooks do Stripe
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` - Chave pública do Stripe (frontend)

---

## 🔍 Como Verificar se Está Funcionando

### 1. **Verificar Conexão no Logs do Railway**

Após o deploy, veja os logs. Deve aparecer:
```
[Database] Connected successfully
```

### 2. **Testar no Browser**

Acesse: `https://tetecare.up.railway.app`

Se carregar, a conexão está funcionando!

### 3. **Verificar Erros**

Se houver erros de conexão:
- ❌ `ECONNREFUSED` → `DATABASE_URL` incorreta ou banco inacessível
- ❌ `password authentication failed` → Senha incorreta
- ❌ `database does not exist` → Nome do banco errado

---

## 🛠️ Estrutura da Conexão

```
┌─────────────┐         ┌──────────────┐
│   Railway   │────────▶│   Supabase   │
│  (App Node) │ DATABASE_URL │  (PostgreSQL) │
└─────────────┘         └──────────────┘
     │                          │
     │                          │
  Express.js              PostgreSQL
  tRPC API                Database
  WebSocket
```

**Fluxo:**
1. Railway inicia a aplicação Node.js
2. Aplicação lê `DATABASE_URL` das variáveis de ambiente
3. Conecta ao PostgreSQL do Supabase usando `postgres-js`
4. Todas as queries vão para o Supabase

---

## ⚙️ Configuração Atual

O código já está configurado para usar `DATABASE_URL`:

```typescript
// server/db.ts
const client = postgres(process.env.DATABASE_URL, {
  max: 20,
  // ...
});
```

**Não precisa mudar nada no código!** Apenas configure as variáveis no Railway.

---

## 🚀 Passos para Configurar

1. **Obter `DATABASE_URL` do Supabase**
   - Dashboard → Settings → Database → Connection string (URI)

2. **Adicionar no Railway**
   - Dashboard → Variables → Add Variable
   - Nome: `DATABASE_URL`
   - Valor: Cole a string de conexão

3. **Adicionar outras variáveis do Supabase**
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. **Fazer Redeploy**
   - Railway detecta novas variáveis automaticamente
   - Ou clique em **Redeploy** manualmente

5. **Verificar Logs**
   - Deve aparecer: `[Database] Connected successfully`

---

## 📝 Nota Importante

**O banco de dados continua no Supabase!**

- ✅ Railway **NÃO** cria um novo banco
- ✅ Railway apenas **conecta** ao banco do Supabase
- ✅ Todos os dados ficam no Supabase
- ✅ Migrações devem ser aplicadas no banco do Supabase

**Para aplicar migrações:**
```bash
# Via Railway CLI (recomendado)
railway run pnpm db:migrate

# Ou localmente (conectando ao Supabase)
DATABASE_URL="postgresql://..." pnpm db:migrate
```

---

## ✅ Status

- ✅ Código já está preparado para usar `DATABASE_URL`
- ⏳ **Falta apenas configurar as variáveis no Railway**

**Próximo passo:** Adicione `DATABASE_URL` e outras variáveis do Supabase no Railway Dashboard!
