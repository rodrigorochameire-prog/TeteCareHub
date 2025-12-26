# 🤖 PROMPT PARA AGENTE DE IA DO SUPABASE

Copie e cole este prompt no agente de IA do Supabase para configurar automaticamente o projeto.

---

## 📋 PROMPT COMPLETO

```
Preciso configurar um projeto Supabase para uma aplicação chamada "Tete House Hub". 
Por favor, execute as seguintes configurações:

## 1. CRIAR TABELA USERS

Execute este SQL no banco de dados:

```sql
-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  auth_id VARCHAR(255) UNIQUE,
  "openId" VARCHAR(64) UNIQUE,
  name TEXT,
  email VARCHAR(320) UNIQUE,
  "passwordHash" VARCHAR(255),
  "loginMethod" VARCHAR(64) DEFAULT 'email' NOT NULL,
  "emailVerified" BOOLEAN DEFAULT false NOT NULL,
  role VARCHAR(20) DEFAULT 'user' NOT NULL CHECK (role IN ('user', 'admin')),
  phone VARCHAR(20),
  "stripe_customer_id" VARCHAR(255),
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "lastSignedIn" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_open_id ON users("openId");
```

## 2. CRIAR BUCKETS DE STORAGE

Crie dois buckets de storage:

1. Bucket "pets":
   - Nome: pets
   - Público: SIM (habilitado)
   - Permissões: Leitura pública permitida

2. Bucket "documents":
   - Nome: documents
   - Público: NÃO (privado)
   - Permissões: Apenas usuários autenticados podem acessar

## 3. CONFIGURAR POLÍTICAS DE STORAGE

Para o bucket "pets" (público), crie uma política que permita leitura pública:

```sql
CREATE POLICY "Public Access for pets bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'pets');
```

Para o bucket "documents" (privado), crie uma política que permita acesso apenas para usuários autenticados:

```sql
CREATE POLICY "Authenticated Access for documents bucket"
ON storage.objects FOR ALL
USING (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);
```

## 4. CONFIGURAR AUTHENTICATION

- Habilitar o provider "Email" na seção Authentication > Providers
- Configurar URLs:
  - Site URL: http://localhost:3000
  - Redirect URLs: http://localhost:3000/**
- Desabilitar confirmação de email para desenvolvimento (opcional, mas recomendado para testes)

## 5. VERIFICAR CONFIGURAÇÕES

Após executar, confirme:
- ✅ Tabela "users" criada com sucesso
- ✅ Buckets "pets" e "documents" criados
- ✅ Políticas de storage configuradas
- ✅ Email provider habilitado
- ✅ URLs de autenticação configuradas

## INFORMAÇÕES DO PROJETO

- Nome do projeto: tete-house-hub
- Aplicação será acessada em: http://localhost:3000 (desenvolvimento)
- A tabela users precisa ter a coluna "auth_id" para sincronizar com Supabase Auth

Por favor, execute todas essas configurações e me informe quando estiver concluído.
```

---

## 🎯 VERSÃO RESUMIDA (Se o agente pedir algo mais curto)

```
Configure meu projeto Supabase para "Tete House Hub":

1. Execute SQL para criar tabela "users" com coluna "auth_id" (UUID do Supabase Auth)
2. Crie bucket público "pets" e bucket privado "documents"
3. Configure políticas RLS para os buckets
4. Habilite Email provider e configure URLs (localhost:3000)
5. Confirme todas as configurações

A tabela users precisa sincronizar automaticamente com Supabase Auth via coluna auth_id.
```

---

## 📝 INSTRUÇÕES ADICIONAIS (Se necessário)

Se o agente pedir mais detalhes, adicione:

```
## DETALHES ADICIONAIS:

- A aplicação usa tRPC e Drizzle ORM
- A tabela users será populada automaticamente quando usuários se registrarem via Supabase Auth
- O campo "auth_id" armazena o UUID retornado por Supabase Auth (user.id)
- O campo "role" pode ser "user" ou "admin" (padrão: "user")
- Os buckets serão usados para armazenar fotos de pets (público) e documentos (privado)
```

---

## ✅ APÓS O AGENTE EXECUTAR

Depois que o agente confirmar que executou tudo, verifique:

1. **Table Editor** → Verifique se a tabela `users` existe
2. **Storage** → Verifique se os buckets `pets` e `documents` existem
3. **Authentication → Providers** → Verifique se Email está habilitado
4. **Authentication → URL Configuration** → Verifique as URLs

---

## 🚨 SE O AGENTE TIVER DIFICULDADES

Se o agente não conseguir executar alguma parte, você pode fazer manualmente:

1. **SQL**: Copie o SQL do arquivo `supabase-initial-schema.sql` e execute no SQL Editor
2. **Storage**: Crie os buckets manualmente em Storage
3. **Auth**: Configure manualmente em Authentication

Ou me avise qual parte teve problema e eu te ajudo a resolver!

---

## 💡 DICA

O agente de IA do Supabase geralmente funciona melhor com instruções claras e específicas. 
Use o prompt completo primeiro, e se ele pedir mais detalhes, adicione as informações adicionais.






Copie e cole este prompt no agente de IA do Supabase para configurar automaticamente o projeto.

---

## 📋 PROMPT COMPLETO

```
Preciso configurar um projeto Supabase para uma aplicação chamada "Tete House Hub". 
Por favor, execute as seguintes configurações:

## 1. CRIAR TABELA USERS

Execute este SQL no banco de dados:

```sql
-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  auth_id VARCHAR(255) UNIQUE,
  "openId" VARCHAR(64) UNIQUE,
  name TEXT,
  email VARCHAR(320) UNIQUE,
  "passwordHash" VARCHAR(255),
  "loginMethod" VARCHAR(64) DEFAULT 'email' NOT NULL,
  "emailVerified" BOOLEAN DEFAULT false NOT NULL,
  role VARCHAR(20) DEFAULT 'user' NOT NULL CHECK (role IN ('user', 'admin')),
  phone VARCHAR(20),
  "stripe_customer_id" VARCHAR(255),
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "lastSignedIn" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_open_id ON users("openId");
```

## 2. CRIAR BUCKETS DE STORAGE

Crie dois buckets de storage:

1. Bucket "pets":
   - Nome: pets
   - Público: SIM (habilitado)
   - Permissões: Leitura pública permitida

2. Bucket "documents":
   - Nome: documents
   - Público: NÃO (privado)
   - Permissões: Apenas usuários autenticados podem acessar

## 3. CONFIGURAR POLÍTICAS DE STORAGE

Para o bucket "pets" (público), crie uma política que permita leitura pública:

```sql
CREATE POLICY "Public Access for pets bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'pets');
```

Para o bucket "documents" (privado), crie uma política que permita acesso apenas para usuários autenticados:

```sql
CREATE POLICY "Authenticated Access for documents bucket"
ON storage.objects FOR ALL
USING (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);
```

## 4. CONFIGURAR AUTHENTICATION

- Habilitar o provider "Email" na seção Authentication > Providers
- Configurar URLs:
  - Site URL: http://localhost:3000
  - Redirect URLs: http://localhost:3000/**
- Desabilitar confirmação de email para desenvolvimento (opcional, mas recomendado para testes)

## 5. VERIFICAR CONFIGURAÇÕES

Após executar, confirme:
- ✅ Tabela "users" criada com sucesso
- ✅ Buckets "pets" e "documents" criados
- ✅ Políticas de storage configuradas
- ✅ Email provider habilitado
- ✅ URLs de autenticação configuradas

## INFORMAÇÕES DO PROJETO

- Nome do projeto: tete-house-hub
- Aplicação será acessada em: http://localhost:3000 (desenvolvimento)
- A tabela users precisa ter a coluna "auth_id" para sincronizar com Supabase Auth

Por favor, execute todas essas configurações e me informe quando estiver concluído.
```

---

## 🎯 VERSÃO RESUMIDA (Se o agente pedir algo mais curto)

```
Configure meu projeto Supabase para "Tete House Hub":

1. Execute SQL para criar tabela "users" com coluna "auth_id" (UUID do Supabase Auth)
2. Crie bucket público "pets" e bucket privado "documents"
3. Configure políticas RLS para os buckets
4. Habilite Email provider e configure URLs (localhost:3000)
5. Confirme todas as configurações

A tabela users precisa sincronizar automaticamente com Supabase Auth via coluna auth_id.
```

---

## 📝 INSTRUÇÕES ADICIONAIS (Se necessário)

Se o agente pedir mais detalhes, adicione:

```
## DETALHES ADICIONAIS:

- A aplicação usa tRPC e Drizzle ORM
- A tabela users será populada automaticamente quando usuários se registrarem via Supabase Auth
- O campo "auth_id" armazena o UUID retornado por Supabase Auth (user.id)
- O campo "role" pode ser "user" ou "admin" (padrão: "user")
- Os buckets serão usados para armazenar fotos de pets (público) e documentos (privado)
```

---

## ✅ APÓS O AGENTE EXECUTAR

Depois que o agente confirmar que executou tudo, verifique:

1. **Table Editor** → Verifique se a tabela `users` existe
2. **Storage** → Verifique se os buckets `pets` e `documents` existem
3. **Authentication → Providers** → Verifique se Email está habilitado
4. **Authentication → URL Configuration** → Verifique as URLs

---

## 🚨 SE O AGENTE TIVER DIFICULDADES

Se o agente não conseguir executar alguma parte, você pode fazer manualmente:

1. **SQL**: Copie o SQL do arquivo `supabase-initial-schema.sql` e execute no SQL Editor
2. **Storage**: Crie os buckets manualmente em Storage
3. **Auth**: Configure manualmente em Authentication

Ou me avise qual parte teve problema e eu te ajudo a resolver!

---

## 💡 DICA

O agente de IA do Supabase geralmente funciona melhor com instruções claras e específicas. 
Use o prompt completo primeiro, e se ele pedir mais detalhes, adicione as informações adicionais.






