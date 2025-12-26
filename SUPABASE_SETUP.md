# 🚀 GUIA COMPLETO DE CONFIGURAÇÃO DO SUPABASE

Este guia vai te ajudar a configurar o Supabase do zero para o Tete House Hub.

---

## 📋 PRÉ-REQUISITOS

✅ Conta no Supabase (criar em https://supabase.com se ainda não tiver)

---

## 🎯 PASSO 1: CRIAR PROJETO NO SUPABASE (5min)

### 1.1 Acessar Dashboard

1. Acesse https://supabase.com/dashboard
2. Faça login (ou crie uma conta se necessário)
3. Clique em **"New Project"**

### 1.2 Configurar Projeto

Preencha os campos:

- **Name**: `tete-house-hub`
- **Database Password**: 
  - ⚠️ **IMPORTANTE**: Crie uma senha forte e ANOTE ELA! Você vai precisar para a `DATABASE_URL`
  - Exemplo: `MinhaSenh@F0rt3!2024`
- **Region**: Selecione `South America (São Paulo)` (ou a região mais próxima)
- **Pricing Plan**: Escolha **Free** (para começar)

### 1.3 Aguardar Criação

- Clique em **"Create new project"**
- Aguarde 2-3 minutos enquanto o Supabase cria o projeto
- Você verá uma tela de loading com o progresso

---

## 🗄️ PASSO 2: EXECUTAR SCRIPT SQL (10min)

### 2.1 Acessar SQL Editor

1. No menu lateral esquerdo, clique em **"SQL Editor"**
2. Clique no botão **"New query"** (canto superior direito)

### 2.2 Preparar Script SQL

⚠️ **IMPORTANTE**: Você precisa criar o script SQL baseado no seu schema atual.

Como o schema ainda está em MySQL, você tem duas opções:

#### Opção A: Usar o Script SQL Inicial (Recomendado para começar)

1. No projeto, abra o arquivo `supabase-initial-schema.sql`
2. Copie TODO o conteúdo do arquivo
3. Cole no SQL Editor do Supabase

Este script cria a tabela `users` inicial que é essencial para o sistema funcionar.

#### Opção B: Usar Drizzle Kit para gerar migrações completas

Depois de migrar o schema para PostgreSQL, você pode usar:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

⚠️ **Nota**: O script inicial cria apenas a tabela `users`. Você precisará criar as outras tabelas conforme necessário ou usar o Drizzle Kit para gerar todas as migrações.

### 2.3 Executar Script

1. Cole o script SQL no editor
2. Clique no botão **"RUN"** (⚡) ou pressione `Ctrl+Enter` (Windows/Linux) ou `Cmd+Enter` (Mac)
3. Aguarde a execução (1-2 minutos)
4. Verifique se apareceu a mensagem: **"Success. No rows returned"**

### 2.4 Verificar Tabelas Criadas

1. No menu lateral, clique em **"Table Editor"**
2. Você deve ver a tabela `users` listada
3. Clique nela para ver a estrutura

---

## 📦 PASSO 3: CONFIGURAR STORAGE (5min)

### 3.1 Criar Bucket "pets"

1. No menu lateral, clique em **"Storage"**
2. Clique em **"New bucket"**
3. Configure:
   - **Name**: `pets`
   - **Public bucket**: ✅ **SIM** (marque esta opção)
4. Clique em **"Create bucket"**

### 3.2 Criar Bucket "documents"

1. Clique novamente em **"New bucket"**
2. Configure:
   - **Name**: `documents`
   - **Public bucket**: ❌ **NÃO** (deixe desmarcado)
3. Clique em **"Create bucket"**

### 3.3 Configurar Políticas de Acesso (Opcional, mas Recomendado)

Para o bucket `pets` (público):

1. Clique no bucket `pets`
2. Vá na aba **"Policies"**
3. Clique em **"New Policy"**
4. Selecione **"For full customization"**
5. Cole esta política (permite leitura pública):

```sql
-- Policy para leitura pública do bucket pets
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'pets');
```

6. Clique em **"Review"** e depois **"Save policy"**

Para o bucket `documents` (privado):

1. Clique no bucket `documents`
2. Vá na aba **"Policies"**
3. Clique em **"New Policy"**
4. Selecione **"For full customization"**
5. Cole esta política (permite acesso apenas para usuários autenticados):

```sql
-- Policy para acesso autenticado ao bucket documents
CREATE POLICY "Authenticated Access"
ON storage.objects FOR ALL
USING (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);
```

6. Clique em **"Review"** e depois **"Save policy"**

---

## 🔐 PASSO 4: CONFIGURAR AUTHENTICATION (5min)

### 4.1 Habilitar Email Provider

1. No menu lateral, clique em **"Authentication"**
2. Clique em **"Providers"** (ou vá direto em **"URL Configuration"**)
3. Encontre **"Email"** na lista de providers
4. Certifique-se que está **habilitado** (toggle verde)

### 4.2 Configurar URLs

1. Ainda em **"Authentication"**, clique em **"URL Configuration"**
2. Configure:

**Site URL:**
```
http://localhost:3000
```

**Redirect URLs:**
```
http://localhost:3000/**
https://*.vercel.app/**
```

⚠️ **Nota**: Quando fizer deploy no Vercel, você precisará atualizar essas URLs com o domínio de produção.

### 4.3 Configurar Email (Opcional)

Por padrão, o Supabase usa um SMTP de teste. Para produção, você precisará configurar:

1. Vá em **"Settings"** → **"Auth"** → **"SMTP Settings"**
2. Configure seu provedor de email (SendGrid, AWS SES, etc.)
3. Para desenvolvimento, você pode usar o SMTP de teste do Supabase

---

## 🔑 PASSO 5: COPIAR CREDENCIAIS (2min)

### 5.1 Acessar Settings

1. No menu lateral, clique em **"Settings"** (ícone de engrenagem)
2. Clique em **"API"**

### 5.2 Copiar Credenciais

Você verá três seções importantes:

#### **Project URL**
```
https://siwapjqndevuwsluncnr.supabase.co
```
✅ Já está no seu `.env.local` como `VITE_SUPABASE_URL`

#### **anon public key**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
✅ Já está no seu `.env.local` como `VITE_SUPABASE_ANON_KEY`

#### **service_role key** (⚠️ SECRET!)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
✅ Já está no seu `.env.local` como `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **IMPORTANTE**: A `service_role key` é SECRETA! Nunca exponha no frontend.

### 5.3 Copiar Database Connection String

1. Ainda em **"Settings"**, clique em **"Database"**
2. Role até encontrar **"Connection string"**
3. Selecione a aba **"URI"**
4. Você verá algo como:

```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

5. Substitua `[YOUR-PASSWORD]` pela senha que você criou no Passo 1.2
6. Copie a string completa

Exemplo:
```
postgresql://postgres:MinhaSenh@F0rt3!2024@db.siwapjqndevuwsluncnr.supabase.co:5432/postgres
```

7. Atualize o `.env.local` com esta string na variável `DATABASE_URL`

---

## ✅ PASSO 6: VERIFICAR CONFIGURAÇÃO (2min)

### Checklist Final

Antes de testar, verifique:

- [ ] Projeto criado no Supabase
- [ ] Tabela `users` criada (verificar em Table Editor)
- [ ] Bucket `pets` criado e configurado como público
- [ ] Bucket `documents` criado e configurado como privado
- [ ] Email provider habilitado
- [ ] URLs configuradas (localhost:3000)
- [ ] Credenciais copiadas para `.env.local`
- [ ] `DATABASE_URL` atualizada com a senha correta

---

## 🧪 PASSO 7: TESTAR CONEXÃO

### 7.1 Testar Database

No terminal, você pode testar a conexão:

```bash
# Se tiver psql instalado
psql "postgresql://postgres:SUA_SENHA@db.siwapjqndevuwsluncnr.supabase.co:5432/postgres"

# Ou usar o Supabase SQL Editor para testar
```

### 7.2 Testar Auth

1. No Supabase Dashboard, vá em **"Authentication"** → **"Users"**
2. Clique em **"Add user"** → **"Create new user"**
3. Crie um usuário de teste:
   - Email: `teste@example.com`
   - Password: `senha123`
4. Verifique se o usuário aparece na lista

---

## 🚨 TROUBLESHOOTING

### Erro: "Invalid API key"

- Verifique se copiou as chaves corretas
- Certifique-se que não há espaços extras
- Recopie do Dashboard do Supabase

### Erro: "Database connection failed"

- Verifique se a senha na `DATABASE_URL` está correta
- Certifique-se que substituiu `[YOUR-PASSWORD]` pela senha real
- Teste a conexão no SQL Editor do Supabase

### Erro: "Bucket not found"

- Verifique se criou os buckets `pets` e `documents`
- Certifique-se que os nomes estão exatamente como no código

### Erro: "Auth provider not enabled"

- Vá em Authentication → Providers
- Certifique-se que "Email" está habilitado

---

## 📞 PRÓXIMOS PASSOS

Após configurar tudo:

1. **Instalar dependências**: `pnpm install` ou `npm install`
2. **Iniciar servidor**: `pnpm run dev` ou `npm run dev`
3. **Testar login**: Acesse http://localhost:3000 e teste o componente Auth
4. **Criar primeiro admin**: Via SQL Editor ou Table Editor

---

## 💡 DICAS ÚTEIS

- **Backup**: Configure backups automáticos no Supabase (Settings → Database → Backups)
- **Monitoramento**: Use o Dashboard para monitorar uso e performance
- **Logs**: Verifique logs em Settings → Logs
- **Documentação**: Consulte https://supabase.com/docs para mais detalhes

---

**🎉 Pronto! Seu Supabase está configurado!**

Qualquer dúvida, consulte a documentação oficial ou este guia.


Este guia vai te ajudar a configurar o Supabase do zero para o Tete House Hub.

---

## 📋 PRÉ-REQUISITOS

✅ Conta no Supabase (criar em https://supabase.com se ainda não tiver)

---

## 🎯 PASSO 1: CRIAR PROJETO NO SUPABASE (5min)

### 1.1 Acessar Dashboard

1. Acesse https://supabase.com/dashboard
2. Faça login (ou crie uma conta se necessário)
3. Clique em **"New Project"**

### 1.2 Configurar Projeto

Preencha os campos:

- **Name**: `tete-house-hub`
- **Database Password**: 
  - ⚠️ **IMPORTANTE**: Crie uma senha forte e ANOTE ELA! Você vai precisar para a `DATABASE_URL`
  - Exemplo: `MinhaSenh@F0rt3!2024`
- **Region**: Selecione `South America (São Paulo)` (ou a região mais próxima)
- **Pricing Plan**: Escolha **Free** (para começar)

### 1.3 Aguardar Criação

- Clique em **"Create new project"**
- Aguarde 2-3 minutos enquanto o Supabase cria o projeto
- Você verá uma tela de loading com o progresso

---

## 🗄️ PASSO 2: EXECUTAR SCRIPT SQL (10min)

### 2.1 Acessar SQL Editor

1. No menu lateral esquerdo, clique em **"SQL Editor"**
2. Clique no botão **"New query"** (canto superior direito)

### 2.2 Preparar Script SQL

⚠️ **IMPORTANTE**: Você precisa criar o script SQL baseado no seu schema atual.

Como o schema ainda está em MySQL, você tem duas opções:

#### Opção A: Usar o Script SQL Inicial (Recomendado para começar)

1. No projeto, abra o arquivo `supabase-initial-schema.sql`
2. Copie TODO o conteúdo do arquivo
3. Cole no SQL Editor do Supabase

Este script cria a tabela `users` inicial que é essencial para o sistema funcionar.

#### Opção B: Usar Drizzle Kit para gerar migrações completas

Depois de migrar o schema para PostgreSQL, você pode usar:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

⚠️ **Nota**: O script inicial cria apenas a tabela `users`. Você precisará criar as outras tabelas conforme necessário ou usar o Drizzle Kit para gerar todas as migrações.

### 2.3 Executar Script

1. Cole o script SQL no editor
2. Clique no botão **"RUN"** (⚡) ou pressione `Ctrl+Enter` (Windows/Linux) ou `Cmd+Enter` (Mac)
3. Aguarde a execução (1-2 minutos)
4. Verifique se apareceu a mensagem: **"Success. No rows returned"**

### 2.4 Verificar Tabelas Criadas

1. No menu lateral, clique em **"Table Editor"**
2. Você deve ver a tabela `users` listada
3. Clique nela para ver a estrutura

---

## 📦 PASSO 3: CONFIGURAR STORAGE (5min)

### 3.1 Criar Bucket "pets"

1. No menu lateral, clique em **"Storage"**
2. Clique em **"New bucket"**
3. Configure:
   - **Name**: `pets`
   - **Public bucket**: ✅ **SIM** (marque esta opção)
4. Clique em **"Create bucket"**

### 3.2 Criar Bucket "documents"

1. Clique novamente em **"New bucket"**
2. Configure:
   - **Name**: `documents`
   - **Public bucket**: ❌ **NÃO** (deixe desmarcado)
3. Clique em **"Create bucket"**

### 3.3 Configurar Políticas de Acesso (Opcional, mas Recomendado)

Para o bucket `pets` (público):

1. Clique no bucket `pets`
2. Vá na aba **"Policies"**
3. Clique em **"New Policy"**
4. Selecione **"For full customization"**
5. Cole esta política (permite leitura pública):

```sql
-- Policy para leitura pública do bucket pets
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'pets');
```

6. Clique em **"Review"** e depois **"Save policy"**

Para o bucket `documents` (privado):

1. Clique no bucket `documents`
2. Vá na aba **"Policies"**
3. Clique em **"New Policy"**
4. Selecione **"For full customization"**
5. Cole esta política (permite acesso apenas para usuários autenticados):

```sql
-- Policy para acesso autenticado ao bucket documents
CREATE POLICY "Authenticated Access"
ON storage.objects FOR ALL
USING (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);
```

6. Clique em **"Review"** e depois **"Save policy"**

---

## 🔐 PASSO 4: CONFIGURAR AUTHENTICATION (5min)

### 4.1 Habilitar Email Provider

1. No menu lateral, clique em **"Authentication"**
2. Clique em **"Providers"** (ou vá direto em **"URL Configuration"**)
3. Encontre **"Email"** na lista de providers
4. Certifique-se que está **habilitado** (toggle verde)

### 4.2 Configurar URLs

1. Ainda em **"Authentication"**, clique em **"URL Configuration"**
2. Configure:

**Site URL:**
```
http://localhost:3000
```

**Redirect URLs:**
```
http://localhost:3000/**
https://*.vercel.app/**
```

⚠️ **Nota**: Quando fizer deploy no Vercel, você precisará atualizar essas URLs com o domínio de produção.

### 4.3 Configurar Email (Opcional)

Por padrão, o Supabase usa um SMTP de teste. Para produção, você precisará configurar:

1. Vá em **"Settings"** → **"Auth"** → **"SMTP Settings"**
2. Configure seu provedor de email (SendGrid, AWS SES, etc.)
3. Para desenvolvimento, você pode usar o SMTP de teste do Supabase

---

## 🔑 PASSO 5: COPIAR CREDENCIAIS (2min)

### 5.1 Acessar Settings

1. No menu lateral, clique em **"Settings"** (ícone de engrenagem)
2. Clique em **"API"**

### 5.2 Copiar Credenciais

Você verá três seções importantes:

#### **Project URL**
```
https://siwapjqndevuwsluncnr.supabase.co
```
✅ Já está no seu `.env.local` como `VITE_SUPABASE_URL`

#### **anon public key**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
✅ Já está no seu `.env.local` como `VITE_SUPABASE_ANON_KEY`

#### **service_role key** (⚠️ SECRET!)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
✅ Já está no seu `.env.local` como `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **IMPORTANTE**: A `service_role key` é SECRETA! Nunca exponha no frontend.

### 5.3 Copiar Database Connection String

1. Ainda em **"Settings"**, clique em **"Database"**
2. Role até encontrar **"Connection string"**
3. Selecione a aba **"URI"**
4. Você verá algo como:

```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

5. Substitua `[YOUR-PASSWORD]` pela senha que você criou no Passo 1.2
6. Copie a string completa

Exemplo:
```
postgresql://postgres:MinhaSenh@F0rt3!2024@db.siwapjqndevuwsluncnr.supabase.co:5432/postgres
```

7. Atualize o `.env.local` com esta string na variável `DATABASE_URL`

---

## ✅ PASSO 6: VERIFICAR CONFIGURAÇÃO (2min)

### Checklist Final

Antes de testar, verifique:

- [ ] Projeto criado no Supabase
- [ ] Tabela `users` criada (verificar em Table Editor)
- [ ] Bucket `pets` criado e configurado como público
- [ ] Bucket `documents` criado e configurado como privado
- [ ] Email provider habilitado
- [ ] URLs configuradas (localhost:3000)
- [ ] Credenciais copiadas para `.env.local`
- [ ] `DATABASE_URL` atualizada com a senha correta

---

## 🧪 PASSO 7: TESTAR CONEXÃO

### 7.1 Testar Database

No terminal, você pode testar a conexão:

```bash
# Se tiver psql instalado
psql "postgresql://postgres:SUA_SENHA@db.siwapjqndevuwsluncnr.supabase.co:5432/postgres"

# Ou usar o Supabase SQL Editor para testar
```

### 7.2 Testar Auth

1. No Supabase Dashboard, vá em **"Authentication"** → **"Users"**
2. Clique em **"Add user"** → **"Create new user"**
3. Crie um usuário de teste:
   - Email: `teste@example.com`
   - Password: `senha123`
4. Verifique se o usuário aparece na lista

---

## 🚨 TROUBLESHOOTING

### Erro: "Invalid API key"

- Verifique se copiou as chaves corretas
- Certifique-se que não há espaços extras
- Recopie do Dashboard do Supabase

### Erro: "Database connection failed"

- Verifique se a senha na `DATABASE_URL` está correta
- Certifique-se que substituiu `[YOUR-PASSWORD]` pela senha real
- Teste a conexão no SQL Editor do Supabase

### Erro: "Bucket not found"

- Verifique se criou os buckets `pets` e `documents`
- Certifique-se que os nomes estão exatamente como no código

### Erro: "Auth provider not enabled"

- Vá em Authentication → Providers
- Certifique-se que "Email" está habilitado

---

## 📞 PRÓXIMOS PASSOS

Após configurar tudo:

1. **Instalar dependências**: `pnpm install` ou `npm install`
2. **Iniciar servidor**: `pnpm run dev` ou `npm run dev`
3. **Testar login**: Acesse http://localhost:3000 e teste o componente Auth
4. **Criar primeiro admin**: Via SQL Editor ou Table Editor

---

## 💡 DICAS ÚTEIS

- **Backup**: Configure backups automáticos no Supabase (Settings → Database → Backups)
- **Monitoramento**: Use o Dashboard para monitorar uso e performance
- **Logs**: Verifique logs em Settings → Logs
- **Documentação**: Consulte https://supabase.com/docs para mais detalhes

---

**🎉 Pronto! Seu Supabase está configurado!**

Qualquer dúvida, consulte a documentação oficial ou este guia.

