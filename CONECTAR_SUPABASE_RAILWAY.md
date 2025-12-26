# 🔗 Como Conectar o Supabase (PostgreSQL) ao Railway

## 📋 Visão Geral

O Railway **já está conectado** ao Supabase através da variável `DATABASE_URL` que você configurou!

Mas vamos verificar e garantir que está tudo correto.

---

## ✅ Verificação Rápida

### 1. No Railway Dashboard:

1. Vá em: **Variables** (Variáveis)
2. Procure por: **`DATABASE_URL`**
3. Verifique se o valor está preenchido

**Formato esperado:**
```
postgresql://postgres:[SENHA]@db.[PROJECT_REF].supabase.co:5432/postgres
```

ou

```
postgresql://postgres.abcdefghijklmnop:[SENHA]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

---

## 🔧 Se a DATABASE_URL não estiver configurada:

### Passo 1: Obter a Connection String do Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em: **Settings** → **Database**
4. Role até a seção **"Connection string"**
5. Selecione a aba **"URI"** (não "Session mode" ou "Transaction mode")
6. Copie a string completa

**Exemplo:**
```
postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

### Passo 2: Substituir [YOUR-PASSWORD]

A string que você copiou tem `[YOUR-PASSWORD]`. Você precisa substituir por sua senha real do banco.

**Como obter a senha:**
1. No Supabase Dashboard → **Settings** → **Database**
2. Role até **"Database password"**
3. Se você não lembra a senha:
   - Clique em **"Reset database password"**
   - Anote a nova senha (ela só aparece uma vez!)

### Passo 3: Adicionar no Railway

1. No Railway Dashboard → **Variables**
2. Clique em **"New Variable"**
3. Nome: `DATABASE_URL`
4. Valor: Cole a string completa (com a senha substituída)
5. Clique em **"Add"**

**Exemplo completo:**
```
postgresql://postgres.abcdefghijklmnop:MinhaSenha123@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

---

## 🔍 Verificar Conexão

### Opção 1: Via Logs do Railway

1. No Railway Dashboard → **Deployments** → Selecione o último deploy
2. Veja os logs
3. Procure por: `[Database] Connected successfully`

Se aparecer essa mensagem, está conectado! ✅

### Opção 2: Via Teste Manual

Execute este comando no Railway (via CLI ou Terminal):

```bash
railway run node -e "
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect()
  .then(() => console.log('✅ Conectado ao Supabase!'))
  .catch(err => console.error('❌ Erro:', err.message))
  .finally(() => client.end());
"
```

---

## 🎯 Variáveis Necessárias (Checklist)

Certifique-se de ter todas estas variáveis no Railway:

### ✅ Obrigatórias:

- [ ] `DATABASE_URL` - String de conexão PostgreSQL
- [ ] `SUPABASE_URL` - URL do projeto (ex: `https://xxx.supabase.co`)
- [ ] `SUPABASE_ANON_KEY` - Chave pública "anon"
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Chave de serviço (secret)
- [ ] `NODE_ENV` - Valor: `production`

### ✅ Para o Frontend (Build-time):

- [ ] `VITE_SUPABASE_URL` - Mesmo valor de `SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY` - Mesmo valor de `SUPABASE_ANON_KEY`

### ✅ Já configuradas (provavelmente):

- [x] `JWT_SECRET`
- [x] `STRIPE_SECRET_KEY`
- [x] `STRIPE_PUBLISHABLE_KEY`
- [x] `STRIPE_WEBHOOK_SECRET`

---

## 🔐 Segurança

### ⚠️ IMPORTANTE:

1. **NUNCA** exponha `DATABASE_URL` ou `SUPABASE_SERVICE_ROLE_KEY` no frontend
2. **NUNCA** commite essas variáveis no Git
3. Use apenas variáveis de ambiente no Railway

### ✅ Boas Práticas:

- `DATABASE_URL` → Apenas no backend (Railway)
- `SUPABASE_SERVICE_ROLE_KEY` → Apenas no backend (Railway)
- `SUPABASE_ANON_KEY` → Pode ir no frontend (é pública)
- `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` → Frontend (build-time)

---

## 🚀 Após Configurar

1. **Faça um novo deploy** no Railway
2. **Verifique os logs** para confirmar conexão
3. **Teste a aplicação** em `https://tetecare.up.railway.app`

---

## 📝 Resumo

**O Railway se conecta ao Supabase através da variável `DATABASE_URL`.**

Se você já tem essa variável configurada com a string de conexão correta do Supabase, **está tudo pronto!** 🎉

A aplicação já deve estar funcionando. Se não estiver, verifique:
1. Se a `DATABASE_URL` está correta
2. Se a senha está correta
3. Se todas as variáveis do Supabase estão configuradas
