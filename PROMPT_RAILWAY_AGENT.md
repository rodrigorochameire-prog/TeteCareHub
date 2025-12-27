<<<<<<< Current (Your changes)
# 🤖 Prompt para Agente de IA do Railway

## 📋 Instruções para o Agente

Copie e cole este prompt completo no chat do agente de IA do Railway:

---

## 🎯 PROMPT PARA O AGENTE:

```
Preciso configurar as variáveis de ambiente para conectar minha aplicação Node.js ao banco de dados PostgreSQL do Supabase.

Por favor, adicione as seguintes variáveis de ambiente no projeto Railway:

### Variáveis Obrigatórias do Backend:

1. DATABASE_URL
   - Tipo: String de conexão PostgreSQL
   - Formato: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
   - Descrição: String de conexão direta ao banco PostgreSQL do Supabase
   - Onde obter: Supabase Dashboard → Settings → Database → Connection string → URI

2. SUPABASE_URL
   - Tipo: URL
   - Formato: https://[PROJECT_REF].supabase.co
   - Descrição: URL base do projeto Supabase
   - Onde obter: Supabase Dashboard → Settings → API → Project URL

3. SUPABASE_ANON_KEY
   - Tipo: JWT Token (string)
   - Formato: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   - Descrição: Chave pública anônima do Supabase (para uso no backend)
   - Onde obter: Supabase Dashboard → Settings → API → Project API keys → anon (public)

4. SUPABASE_SERVICE_ROLE_KEY
   - Tipo: JWT Token (string)
   - Formato: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   - Descrição: Chave secreta de service_role do Supabase (NUNCA expor no frontend)
   - Onde obter: Supabase Dashboard → Settings → API → Project API keys → service_role (secret)

5. NODE_ENV
   - Valor: production
   - Descrição: Ambiente de execução

### Variáveis para o Frontend (Build-time):

6. VITE_SUPABASE_URL
   - Tipo: URL
   - Valor: Mesmo valor do SUPABASE_URL
   - Descrição: URL do Supabase para o frontend (usado durante o build do Vite)

7. VITE_SUPABASE_ANON_KEY
   - Tipo: JWT Token (string)
   - Valor: Mesmo valor do SUPABASE_ANON_KEY
   - Descrição: Chave pública do Supabase para o frontend (usado durante o build do Vite)

### Variáveis Opcionais (se usar Stripe):

8. STRIPE_SECRET_KEY (opcional)
   - Tipo: String
   - Formato: sk_live_... ou sk_test_...
   - Descrição: Chave secreta do Stripe para pagamentos

9. STRIPE_WEBHOOK_SECRET (opcional)
   - Tipo: String
   - Formato: whsec_...
   - Descrição: Secret do webhook do Stripe

10. VITE_STRIPE_PUBLISHABLE_KEY (opcional)
    - Tipo: String
    - Formato: pk_live_... ou pk_test_...
    - Descrição: Chave pública do Stripe para o frontend

### Variáveis Opcionais (JWT/Session):

11. JWT_SECRET (opcional, mas recomendado)
    - Tipo: String aleatória
    - Descrição: Secret para assinar tokens JWT de sessão
    - Gerar: Use uma string aleatória segura (ex: openssl rand -hex 32)

---

## 📝 IMPORTANTE:

- Todas as variáveis que começam com `VITE_` são usadas durante o BUILD do frontend
- As variáveis sem `VITE_` são usadas apenas no servidor (runtime)
- O `DATABASE_URL` deve usar a conexão direta (porta 5432) ou session mode (pooler na porta 5432)
- NÃO use transaction mode (porta 6543) pois não suporta prepared statements do Drizzle ORM

## 🔍 Como Verificar:

Após adicionar as variáveis, o deploy deve mostrar nos logs:
- "[Database] Connected successfully"
- Se aparecer erro de conexão, verifique se o DATABASE_URL está correto

Por favor, adicione essas variáveis e me informe quais você conseguiu adicionar e quais precisam de valores específicos do meu projeto Supabase.
```

---

## 📋 Checklist de Valores que Você Precisa Fornecer

Antes de pedir ao agente, você precisa obter estes valores do Supabase:

### 1. **DATABASE_URL**
```
1. Vá em: Supabase Dashboard → Settings → Database
2. Role até "Connection string"
3. Selecione "URI" (não "Session mode" ou "Transaction mode")
4. Copie a string completa
```

**Exemplo:**
```
postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

### 2. **SUPABASE_URL**
```
1. Vá em: Supabase Dashboard → Settings → API
2. Copie o "Project URL"
```

**Exemplo:**
```
https://abcdefghijklmnop.supabase.co
```

### 3. **SUPABASE_ANON_KEY**
```
1. Vá em: Supabase Dashboard → Settings → API
2. Em "Project API keys"
3. Copie a chave "anon" (public)
```

**Exemplo:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTk4ODgwMCwiZXhwIjoxOTYxNTY0ODAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. **SUPABASE_SERVICE_ROLE_KEY**
```
1. Vá em: Supabase Dashboard → Settings → API
2. Em "Project API keys"
3. Copie a chave "service_role" (secret)
⚠️ CUIDADO: Esta chave tem acesso total ao banco!
```

**Exemplo:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjQ1OTg4ODAwLCJleHAiOjE5NjE1NjQ4MDB9.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
```

---

## 🚀 Versão Simplificada do Prompt

Se o agente não entender o prompt completo, use esta versão mais direta:

```
Preciso adicionar variáveis de ambiente no Railway para conectar ao Supabase.

Adicione estas variáveis (eu vou fornecer os valores):

1. DATABASE_URL - String de conexão PostgreSQL do Supabase
2. SUPABASE_URL - URL do projeto Supabase (https://[project].supabase.co)
3. SUPABASE_ANON_KEY - Chave pública anônima do Supabase
4. SUPABASE_SERVICE_ROLE_KEY - Chave secreta service_role do Supabase
5. NODE_ENV=production
6. VITE_SUPABASE_URL - Mesmo valor do SUPABASE_URL
7. VITE_SUPABASE_ANON_KEY - Mesmo valor do SUPABASE_ANON_KEY

Depois que você adicionar as variáveis, eu vou fornecer os valores específicos do meu projeto.
```

---

## 📝 Após o Agente Adicionar as Variáveis

Depois que o agente criar as variáveis (mesmo que vazias), você precisa:

1. **Preencher os valores** manualmente no Railway Dashboard:
   - Vá em **Variables**
   - Clique em cada variável
   - Cole o valor correspondente do Supabase

2. **Ou fornecer os valores ao agente:**
   ```
   Aqui estão os valores das variáveis:
   
   DATABASE_URL=postgresql://postgres.abc123:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
   SUPABASE_URL=https://abc123.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_SUPABASE_URL=https://abc123.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## ✅ Verificação Final

Após configurar tudo, verifique nos logs do Railway:

```
✅ [Database] Connected successfully (direct)
✅ [Database] Connected successfully (session-mode)
```

Se aparecer erro, verifique:
- ❌ `DATABASE_URL` está correto?
- ❌ Senha do banco está correta?
- ❌ Todas as variáveis foram adicionadas?

---

**Status**: Pronto para copiar e colar no agente do Railway! 🚀


# 🤖 Prompt para Agente de IA do Railway

## 📋 Instruções para o Agente

Copie e cole este prompt completo no chat do agente de IA do Railway:

---

## 🎯 PROMPT PARA O AGENTE:

```
Preciso configurar as variáveis de ambiente para conectar minha aplicação Node.js ao banco de dados PostgreSQL do Supabase.

Por favor, adicione as seguintes variáveis de ambiente no projeto Railway:

### Variáveis Obrigatórias do Backend:

1. DATABASE_URL
   - Tipo: String de conexão PostgreSQL
   - Formato: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
   - Descrição: String de conexão direta ao banco PostgreSQL do Supabase
   - Onde obter: Supabase Dashboard → Settings → Database → Connection string → URI

2. SUPABASE_URL
   - Tipo: URL
   - Formato: https://[PROJECT_REF].supabase.co
   - Descrição: URL base do projeto Supabase
   - Onde obter: Supabase Dashboard → Settings → API → Project URL

3. SUPABASE_ANON_KEY
   - Tipo: JWT Token (string)
   - Formato: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   - Descrição: Chave pública anônima do Supabase (para uso no backend)
   - Onde obter: Supabase Dashboard → Settings → API → Project API keys → anon (public)

4. SUPABASE_SERVICE_ROLE_KEY
   - Tipo: JWT Token (string)
   - Formato: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   - Descrição: Chave secreta de service_role do Supabase (NUNCA expor no frontend)
   - Onde obter: Supabase Dashboard → Settings → API → Project API keys → service_role (secret)

5. NODE_ENV
   - Valor: production
   - Descrição: Ambiente de execução

### Variáveis para o Frontend (Build-time):

6. VITE_SUPABASE_URL
   - Tipo: URL
   - Valor: Mesmo valor do SUPABASE_URL
   - Descrição: URL do Supabase para o frontend (usado durante o build do Vite)

7. VITE_SUPABASE_ANON_KEY
   - Tipo: JWT Token (string)
   - Valor: Mesmo valor do SUPABASE_ANON_KEY
   - Descrição: Chave pública do Supabase para o frontend (usado durante o build do Vite)

### Variáveis Opcionais (se usar Stripe):

8. STRIPE_SECRET_KEY (opcional)
   - Tipo: String
   - Formato: sk_live_... ou sk_test_...
   - Descrição: Chave secreta do Stripe para pagamentos

9. STRIPE_WEBHOOK_SECRET (opcional)
   - Tipo: String
   - Formato: whsec_...
   - Descrição: Secret do webhook do Stripe

10. VITE_STRIPE_PUBLISHABLE_KEY (opcional)
    - Tipo: String
    - Formato: pk_live_... ou pk_test_...
    - Descrição: Chave pública do Stripe para o frontend

### Variáveis Opcionais (JWT/Session):

11. JWT_SECRET (opcional, mas recomendado)
    - Tipo: String aleatória
    - Descrição: Secret para assinar tokens JWT de sessão
    - Gerar: Use uma string aleatória segura (ex: openssl rand -hex 32)

---

## 📝 IMPORTANTE:

- Todas as variáveis que começam com `VITE_` são usadas durante o BUILD do frontend
- As variáveis sem `VITE_` são usadas apenas no servidor (runtime)
- O `DATABASE_URL` deve usar a conexão direta (porta 5432) ou session mode (pooler na porta 5432)
- NÃO use transaction mode (porta 6543) pois não suporta prepared statements do Drizzle ORM

## 🔍 Como Verificar:

Após adicionar as variáveis, o deploy deve mostrar nos logs:
- "[Database] Connected successfully"
- Se aparecer erro de conexão, verifique se o DATABASE_URL está correto

Por favor, adicione essas variáveis e me informe quais você conseguiu adicionar e quais precisam de valores específicos do meu projeto Supabase.
```

---

## 📋 Checklist de Valores que Você Precisa Fornecer

Antes de pedir ao agente, você precisa obter estes valores do Supabase:

### 1. **DATABASE_URL**
```
1. Vá em: Supabase Dashboard → Settings → Database
2. Role até "Connection string"
3. Selecione "URI" (não "Session mode" ou "Transaction mode")
4. Copie a string completa
```

**Exemplo:**
```
postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

### 2. **SUPABASE_URL**
```
1. Vá em: Supabase Dashboard → Settings → API
2. Copie o "Project URL"
```

**Exemplo:**
```
https://abcdefghijklmnop.supabase.co
```

### 3. **SUPABASE_ANON_KEY**
```
1. Vá em: Supabase Dashboard → Settings → API
2. Em "Project API keys"
3. Copie a chave "anon" (public)
```

**Exemplo:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTk4ODgwMCwiZXhwIjoxOTYxNTY0ODAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. **SUPABASE_SERVICE_ROLE_KEY**
```
1. Vá em: Supabase Dashboard → Settings → API
2. Em "Project API keys"
3. Copie a chave "service_role" (secret)
⚠️ CUIDADO: Esta chave tem acesso total ao banco!
```

**Exemplo:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjQ1OTg4ODAwLCJleHAiOjE5NjE1NjQ4MDB9.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
```

---

## 🚀 Versão Simplificada do Prompt

Se o agente não entender o prompt completo, use esta versão mais direta:

```
Preciso adicionar variáveis de ambiente no Railway para conectar ao Supabase.

Adicione estas variáveis (eu vou fornecer os valores):

1. DATABASE_URL - String de conexão PostgreSQL do Supabase
2. SUPABASE_URL - URL do projeto Supabase (https://[project].supabase.co)
3. SUPABASE_ANON_KEY - Chave pública anônima do Supabase
4. SUPABASE_SERVICE_ROLE_KEY - Chave secreta service_role do Supabase
5. NODE_ENV=production
6. VITE_SUPABASE_URL - Mesmo valor do SUPABASE_URL
7. VITE_SUPABASE_ANON_KEY - Mesmo valor do SUPABASE_ANON_KEY

Depois que você adicionar as variáveis, eu vou fornecer os valores específicos do meu projeto.
```

---

## 📝 Após o Agente Adicionar as Variáveis

Depois que o agente criar as variáveis (mesmo que vazias), você precisa:

1. **Preencher os valores** manualmente no Railway Dashboard:
   - Vá em **Variables**
   - Clique em cada variável
   - Cole o valor correspondente do Supabase

2. **Ou fornecer os valores ao agente:**
   ```
   Aqui estão os valores das variáveis:
   
   DATABASE_URL=postgresql://postgres.abc123:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
   SUPABASE_URL=https://abc123.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_SUPABASE_URL=https://abc123.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## ✅ Verificação Final

Após configurar tudo, verifique nos logs do Railway:

```
✅ [Database] Connected successfully (direct)
✅ [Database] Connected successfully (session-mode)
```

Se aparecer erro, verifique:
- ❌ `DATABASE_URL` está correto?
- ❌ Senha do banco está correta?
- ❌ Todas as variáveis foram adicionadas?

---

**Status**: Pronto para copiar e colar no agente do Railway! 🚀



# 🤖 Prompt para Agente de IA do Railway

## 📋 Instruções para o Agente

Copie e cole este prompt completo no chat do agente de IA do Railway:

---

## 🎯 PROMPT PARA O AGENTE:

```
Preciso configurar as variáveis de ambiente para conectar minha aplicação Node.js ao banco de dados PostgreSQL do Supabase.

Por favor, adicione as seguintes variáveis de ambiente no projeto Railway:

### Variáveis Obrigatórias do Backend:

1. DATABASE_URL
   - Tipo: String de conexão PostgreSQL
   - Formato: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
   - Descrição: String de conexão direta ao banco PostgreSQL do Supabase
   - Onde obter: Supabase Dashboard → Settings → Database → Connection string → URI

2. SUPABASE_URL
   - Tipo: URL
   - Formato: https://[PROJECT_REF].supabase.co
   - Descrição: URL base do projeto Supabase
   - Onde obter: Supabase Dashboard → Settings → API → Project URL

3. SUPABASE_ANON_KEY
   - Tipo: JWT Token (string)
   - Formato: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   - Descrição: Chave pública anônima do Supabase (para uso no backend)
   - Onde obter: Supabase Dashboard → Settings → API → Project API keys → anon (public)

4. SUPABASE_SERVICE_ROLE_KEY
   - Tipo: JWT Token (string)
   - Formato: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   - Descrição: Chave secreta de service_role do Supabase (NUNCA expor no frontend)
   - Onde obter: Supabase Dashboard → Settings → API → Project API keys → service_role (secret)

5. NODE_ENV
   - Valor: production
   - Descrição: Ambiente de execução

### Variáveis para o Frontend (Build-time):

6. VITE_SUPABASE_URL
   - Tipo: URL
   - Valor: Mesmo valor do SUPABASE_URL
   - Descrição: URL do Supabase para o frontend (usado durante o build do Vite)

7. VITE_SUPABASE_ANON_KEY
   - Tipo: JWT Token (string)
   - Valor: Mesmo valor do SUPABASE_ANON_KEY
   - Descrição: Chave pública do Supabase para o frontend (usado durante o build do Vite)

### Variáveis Opcionais (se usar Stripe):

8. STRIPE_SECRET_KEY (opcional)
   - Tipo: String
   - Formato: sk_live_... ou sk_test_...
   - Descrição: Chave secreta do Stripe para pagamentos

9. STRIPE_WEBHOOK_SECRET (opcional)
   - Tipo: String
   - Formato: whsec_...
   - Descrição: Secret do webhook do Stripe

10. VITE_STRIPE_PUBLISHABLE_KEY (opcional)
    - Tipo: String
    - Formato: pk_live_... ou pk_test_...
    - Descrição: Chave pública do Stripe para o frontend

### Variáveis Opcionais (JWT/Session):

11. JWT_SECRET (opcional, mas recomendado)
    - Tipo: String aleatória
    - Descrição: Secret para assinar tokens JWT de sessão
    - Gerar: Use uma string aleatória segura (ex: openssl rand -hex 32)

---

## 📝 IMPORTANTE:

- Todas as variáveis que começam com `VITE_` são usadas durante o BUILD do frontend
- As variáveis sem `VITE_` são usadas apenas no servidor (runtime)
- O `DATABASE_URL` deve usar a conexão direta (porta 5432) ou session mode (pooler na porta 5432)
- NÃO use transaction mode (porta 6543) pois não suporta prepared statements do Drizzle ORM

## 🔍 Como Verificar:

Após adicionar as variáveis, o deploy deve mostrar nos logs:
- "[Database] Connected successfully"
- Se aparecer erro de conexão, verifique se o DATABASE_URL está correto

Por favor, adicione essas variáveis e me informe quais você conseguiu adicionar e quais precisam de valores específicos do meu projeto Supabase.
```

---

## 📋 Checklist de Valores que Você Precisa Fornecer

Antes de pedir ao agente, você precisa obter estes valores do Supabase:

### 1. **DATABASE_URL**
```
1. Vá em: Supabase Dashboard → Settings → Database
2. Role até "Connection string"
3. Selecione "URI" (não "Session mode" ou "Transaction mode")
4. Copie a string completa
```

**Exemplo:**
```
postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

### 2. **SUPABASE_URL**
```
1. Vá em: Supabase Dashboard → Settings → API
2. Copie o "Project URL"
```

**Exemplo:**
```
https://abcdefghijklmnop.supabase.co
```

### 3. **SUPABASE_ANON_KEY**
```
1. Vá em: Supabase Dashboard → Settings → API
2. Em "Project API keys"
3. Copie a chave "anon" (public)
```

**Exemplo:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTk4ODgwMCwiZXhwIjoxOTYxNTY0ODAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. **SUPABASE_SERVICE_ROLE_KEY**
```
1. Vá em: Supabase Dashboard → Settings → API
2. Em "Project API keys"
3. Copie a chave "service_role" (secret)
⚠️ CUIDADO: Esta chave tem acesso total ao banco!
```

**Exemplo:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjQ1OTg4ODAwLCJleHAiOjE5NjE1NjQ4MDB9.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
```

---

## 🚀 Versão Simplificada do Prompt

Se o agente não entender o prompt completo, use esta versão mais direta:

```
Preciso adicionar variáveis de ambiente no Railway para conectar ao Supabase.

Adicione estas variáveis (eu vou fornecer os valores):

1. DATABASE_URL - String de conexão PostgreSQL do Supabase
2. SUPABASE_URL - URL do projeto Supabase (https://[project].supabase.co)
3. SUPABASE_ANON_KEY - Chave pública anônima do Supabase
4. SUPABASE_SERVICE_ROLE_KEY - Chave secreta service_role do Supabase
5. NODE_ENV=production
6. VITE_SUPABASE_URL - Mesmo valor do SUPABASE_URL
7. VITE_SUPABASE_ANON_KEY - Mesmo valor do SUPABASE_ANON_KEY

Depois que você adicionar as variáveis, eu vou fornecer os valores específicos do meu projeto.
```

---

## 📝 Após o Agente Adicionar as Variáveis

Depois que o agente criar as variáveis (mesmo que vazias), você precisa:

1. **Preencher os valores** manualmente no Railway Dashboard:
   - Vá em **Variables**
   - Clique em cada variável
   - Cole o valor correspondente do Supabase

2. **Ou fornecer os valores ao agente:**
   ```
   Aqui estão os valores das variáveis:
   
   DATABASE_URL=postgresql://postgres.abc123:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
   SUPABASE_URL=https://abc123.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_SUPABASE_URL=https://abc123.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## ✅ Verificação Final

Após configurar tudo, verifique nos logs do Railway:

```
✅ [Database] Connected successfully (direct)
✅ [Database] Connected successfully (session-mode)
```

Se aparecer erro, verifique:
- ❌ `DATABASE_URL` está correto?
- ❌ Senha do banco está correta?
- ❌ Todas as variáveis foram adicionadas?

---

**Status**: Pronto para copiar e colar no agente do Railway! 🚀


# 🤖 Prompt para Agente de IA do Railway

## 📋 Instruções para o Agente

Copie e cole este prompt completo no chat do agente de IA do Railway:

---

## 🎯 PROMPT PARA O AGENTE:

```
Preciso configurar as variáveis de ambiente para conectar minha aplicação Node.js ao banco de dados PostgreSQL do Supabase.

Por favor, adicione as seguintes variáveis de ambiente no projeto Railway:

### Variáveis Obrigatórias do Backend:

1. DATABASE_URL
   - Tipo: String de conexão PostgreSQL
   - Formato: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
   - Descrição: String de conexão direta ao banco PostgreSQL do Supabase
   - Onde obter: Supabase Dashboard → Settings → Database → Connection string → URI

2. SUPABASE_URL
   - Tipo: URL
   - Formato: https://[PROJECT_REF].supabase.co
   - Descrição: URL base do projeto Supabase
   - Onde obter: Supabase Dashboard → Settings → API → Project URL

3. SUPABASE_ANON_KEY
   - Tipo: JWT Token (string)
   - Formato: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   - Descrição: Chave pública anônima do Supabase (para uso no backend)
   - Onde obter: Supabase Dashboard → Settings → API → Project API keys → anon (public)

4. SUPABASE_SERVICE_ROLE_KEY
   - Tipo: JWT Token (string)
   - Formato: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   - Descrição: Chave secreta de service_role do Supabase (NUNCA expor no frontend)
   - Onde obter: Supabase Dashboard → Settings → API → Project API keys → service_role (secret)

5. NODE_ENV
   - Valor: production
   - Descrição: Ambiente de execução

### Variáveis para o Frontend (Build-time):

6. VITE_SUPABASE_URL
   - Tipo: URL
   - Valor: Mesmo valor do SUPABASE_URL
   - Descrição: URL do Supabase para o frontend (usado durante o build do Vite)

7. VITE_SUPABASE_ANON_KEY
   - Tipo: JWT Token (string)
   - Valor: Mesmo valor do SUPABASE_ANON_KEY
   - Descrição: Chave pública do Supabase para o frontend (usado durante o build do Vite)

### Variáveis Opcionais (se usar Stripe):

8. STRIPE_SECRET_KEY (opcional)
   - Tipo: String
   - Formato: sk_live_... ou sk_test_...
   - Descrição: Chave secreta do Stripe para pagamentos

9. STRIPE_WEBHOOK_SECRET (opcional)
   - Tipo: String
   - Formato: whsec_...
   - Descrição: Secret do webhook do Stripe

10. VITE_STRIPE_PUBLISHABLE_KEY (opcional)
    - Tipo: String
    - Formato: pk_live_... ou pk_test_...
    - Descrição: Chave pública do Stripe para o frontend

### Variáveis Opcionais (JWT/Session):

11. JWT_SECRET (opcional, mas recomendado)
    - Tipo: String aleatória
    - Descrição: Secret para assinar tokens JWT de sessão
    - Gerar: Use uma string aleatória segura (ex: openssl rand -hex 32)

---

## 📝 IMPORTANTE:

- Todas as variáveis que começam com `VITE_` são usadas durante o BUILD do frontend
- As variáveis sem `VITE_` são usadas apenas no servidor (runtime)
- O `DATABASE_URL` deve usar a conexão direta (porta 5432) ou session mode (pooler na porta 5432)
- NÃO use transaction mode (porta 6543) pois não suporta prepared statements do Drizzle ORM

## 🔍 Como Verificar:

Após adicionar as variáveis, o deploy deve mostrar nos logs:
- "[Database] Connected successfully"
- Se aparecer erro de conexão, verifique se o DATABASE_URL está correto

Por favor, adicione essas variáveis e me informe quais você conseguiu adicionar e quais precisam de valores específicos do meu projeto Supabase.
```

---

## 📋 Checklist de Valores que Você Precisa Fornecer

Antes de pedir ao agente, você precisa obter estes valores do Supabase:

### 1. **DATABASE_URL**
```
1. Vá em: Supabase Dashboard → Settings → Database
2. Role até "Connection string"
3. Selecione "URI" (não "Session mode" ou "Transaction mode")
4. Copie a string completa
```

**Exemplo:**
```
postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

### 2. **SUPABASE_URL**
```
1. Vá em: Supabase Dashboard → Settings → API
2. Copie o "Project URL"
```

**Exemplo:**
```
https://abcdefghijklmnop.supabase.co
```

### 3. **SUPABASE_ANON_KEY**
```
1. Vá em: Supabase Dashboard → Settings → API
2. Em "Project API keys"
3. Copie a chave "anon" (public)
```

**Exemplo:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTk4ODgwMCwiZXhwIjoxOTYxNTY0ODAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. **SUPABASE_SERVICE_ROLE_KEY**
```
1. Vá em: Supabase Dashboard → Settings → API
2. Em "Project API keys"
3. Copie a chave "service_role" (secret)
⚠️ CUIDADO: Esta chave tem acesso total ao banco!
```

**Exemplo:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjQ1OTg4ODAwLCJleHAiOjE5NjE1NjQ4MDB9.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
```

---

## 🚀 Versão Simplificada do Prompt

Se o agente não entender o prompt completo, use esta versão mais direta:

```
Preciso adicionar variáveis de ambiente no Railway para conectar ao Supabase.

Adicione estas variáveis (eu vou fornecer os valores):

1. DATABASE_URL - String de conexão PostgreSQL do Supabase
2. SUPABASE_URL - URL do projeto Supabase (https://[project].supabase.co)
3. SUPABASE_ANON_KEY - Chave pública anônima do Supabase
4. SUPABASE_SERVICE_ROLE_KEY - Chave secreta service_role do Supabase
5. NODE_ENV=production
6. VITE_SUPABASE_URL - Mesmo valor do SUPABASE_URL
7. VITE_SUPABASE_ANON_KEY - Mesmo valor do SUPABASE_ANON_KEY

Depois que você adicionar as variáveis, eu vou fornecer os valores específicos do meu projeto.
```

---

## 📝 Após o Agente Adicionar as Variáveis

Depois que o agente criar as variáveis (mesmo que vazias), você precisa:

1. **Preencher os valores** manualmente no Railway Dashboard:
   - Vá em **Variables**
   - Clique em cada variável
   - Cole o valor correspondente do Supabase

2. **Ou fornecer os valores ao agente:**
   ```
   Aqui estão os valores das variáveis:
   
   DATABASE_URL=postgresql://postgres.abc123:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
   SUPABASE_URL=https://abc123.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_SUPABASE_URL=https://abc123.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## ✅ Verificação Final

Após configurar tudo, verifique nos logs do Railway:

```
✅ [Database] Connected successfully (direct)
✅ [Database] Connected successfully (session-mode)
```

Se aparecer erro, verifique:
- ❌ `DATABASE_URL` está correto?
- ❌ Senha do banco está correta?
- ❌ Todas as variáveis foram adicionadas?

---

**Status**: Pronto para copiar e colar no agente do Railway! 🚀



# 🤖 Prompt para Agente de IA do Railway

## 📋 Instruções para o Agente

Copie e cole este prompt completo no chat do agente de IA do Railway:

---

## 🎯 PROMPT PARA O AGENTE:

```
Preciso configurar as variáveis de ambiente para conectar minha aplicação Node.js ao banco de dados PostgreSQL do Supabase.

Por favor, adicione as seguintes variáveis de ambiente no projeto Railway:

### Variáveis Obrigatórias do Backend:

1. DATABASE_URL
   - Tipo: String de conexão PostgreSQL
   - Formato: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
   - Descrição: String de conexão direta ao banco PostgreSQL do Supabase
   - Onde obter: Supabase Dashboard → Settings → Database → Connection string → URI

2. SUPABASE_URL
   - Tipo: URL
   - Formato: https://[PROJECT_REF].supabase.co
   - Descrição: URL base do projeto Supabase
   - Onde obter: Supabase Dashboard → Settings → API → Project URL

3. SUPABASE_ANON_KEY
   - Tipo: JWT Token (string)
   - Formato: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   - Descrição: Chave pública anônima do Supabase (para uso no backend)
   - Onde obter: Supabase Dashboard → Settings → API → Project API keys → anon (public)

4. SUPABASE_SERVICE_ROLE_KEY
   - Tipo: JWT Token (string)
   - Formato: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   - Descrição: Chave secreta de service_role do Supabase (NUNCA expor no frontend)
   - Onde obter: Supabase Dashboard → Settings → API → Project API keys → service_role (secret)

5. NODE_ENV
   - Valor: production
   - Descrição: Ambiente de execução

### Variáveis para o Frontend (Build-time):

6. VITE_SUPABASE_URL
   - Tipo: URL
   - Valor: Mesmo valor do SUPABASE_URL
   - Descrição: URL do Supabase para o frontend (usado durante o build do Vite)

7. VITE_SUPABASE_ANON_KEY
   - Tipo: JWT Token (string)
   - Valor: Mesmo valor do SUPABASE_ANON_KEY
   - Descrição: Chave pública do Supabase para o frontend (usado durante o build do Vite)

### Variáveis Opcionais (se usar Stripe):

8. STRIPE_SECRET_KEY (opcional)
   - Tipo: String
   - Formato: sk_live_... ou sk_test_...
   - Descrição: Chave secreta do Stripe para pagamentos

9. STRIPE_WEBHOOK_SECRET (opcional)
   - Tipo: String
   - Formato: whsec_...
   - Descrição: Secret do webhook do Stripe

10. VITE_STRIPE_PUBLISHABLE_KEY (opcional)
    - Tipo: String
    - Formato: pk_live_... ou pk_test_...
    - Descrição: Chave pública do Stripe para o frontend

### Variáveis Opcionais (JWT/Session):

11. JWT_SECRET (opcional, mas recomendado)
    - Tipo: String aleatória
    - Descrição: Secret para assinar tokens JWT de sessão
    - Gerar: Use uma string aleatória segura (ex: openssl rand -hex 32)

---

## 📝 IMPORTANTE:

- Todas as variáveis que começam com `VITE_` são usadas durante o BUILD do frontend
- As variáveis sem `VITE_` são usadas apenas no servidor (runtime)
- O `DATABASE_URL` deve usar a conexão direta (porta 5432) ou session mode (pooler na porta 5432)
- NÃO use transaction mode (porta 6543) pois não suporta prepared statements do Drizzle ORM

## 🔍 Como Verificar:

Após adicionar as variáveis, o deploy deve mostrar nos logs:
- "[Database] Connected successfully"
- Se aparecer erro de conexão, verifique se o DATABASE_URL está correto

Por favor, adicione essas variáveis e me informe quais você conseguiu adicionar e quais precisam de valores específicos do meu projeto Supabase.
```

---

## 📋 Checklist de Valores que Você Precisa Fornecer

Antes de pedir ao agente, você precisa obter estes valores do Supabase:

### 1. **DATABASE_URL**
```
1. Vá em: Supabase Dashboard → Settings → Database
2. Role até "Connection string"
3. Selecione "URI" (não "Session mode" ou "Transaction mode")
4. Copie a string completa
```

**Exemplo:**
```
postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

### 2. **SUPABASE_URL**
```
1. Vá em: Supabase Dashboard → Settings → API
2. Copie o "Project URL"
```

**Exemplo:**
```
https://abcdefghijklmnop.supabase.co
```

### 3. **SUPABASE_ANON_KEY**
```
1. Vá em: Supabase Dashboard → Settings → API
2. Em "Project API keys"
3. Copie a chave "anon" (public)
```

**Exemplo:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTk4ODgwMCwiZXhwIjoxOTYxNTY0ODAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. **SUPABASE_SERVICE_ROLE_KEY**
```
1. Vá em: Supabase Dashboard → Settings → API
2. Em "Project API keys"
3. Copie a chave "service_role" (secret)
⚠️ CUIDADO: Esta chave tem acesso total ao banco!
```

**Exemplo:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjQ1OTg4ODAwLCJleHAiOjE5NjE1NjQ4MDB9.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
```

---

## 🚀 Versão Simplificada do Prompt

Se o agente não entender o prompt completo, use esta versão mais direta:

```
Preciso adicionar variáveis de ambiente no Railway para conectar ao Supabase.

Adicione estas variáveis (eu vou fornecer os valores):

1. DATABASE_URL - String de conexão PostgreSQL do Supabase
2. SUPABASE_URL - URL do projeto Supabase (https://[project].supabase.co)
3. SUPABASE_ANON_KEY - Chave pública anônima do Supabase
4. SUPABASE_SERVICE_ROLE_KEY - Chave secreta service_role do Supabase
5. NODE_ENV=production
6. VITE_SUPABASE_URL - Mesmo valor do SUPABASE_URL
7. VITE_SUPABASE_ANON_KEY - Mesmo valor do SUPABASE_ANON_KEY

Depois que você adicionar as variáveis, eu vou fornecer os valores específicos do meu projeto.
```

---

## 📝 Após o Agente Adicionar as Variáveis

Depois que o agente criar as variáveis (mesmo que vazias), você precisa:

1. **Preencher os valores** manualmente no Railway Dashboard:
   - Vá em **Variables**
   - Clique em cada variável
   - Cole o valor correspondente do Supabase

2. **Ou fornecer os valores ao agente:**
   ```
   Aqui estão os valores das variáveis:
   
   DATABASE_URL=postgresql://postgres.abc123:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
   SUPABASE_URL=https://abc123.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_SUPABASE_URL=https://abc123.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## ✅ Verificação Final

Após configurar tudo, verifique nos logs do Railway:

```
✅ [Database] Connected successfully (direct)
✅ [Database] Connected successfully (session-mode)
```

Se aparecer erro, verifique:
- ❌ `DATABASE_URL` está correto?
- ❌ Senha do banco está correta?
- ❌ Todas as variáveis foram adicionadas?

---

**Status**: Pronto para copiar e colar no agente do Railway! 🚀


# 🤖 Prompt para Agente de IA do Railway

## 📋 Instruções para o Agente

Copie e cole este prompt completo no chat do agente de IA do Railway:

---

## 🎯 PROMPT PARA O AGENTE:

```
Preciso configurar as variáveis de ambiente para conectar minha aplicação Node.js ao banco de dados PostgreSQL do Supabase.

Por favor, adicione as seguintes variáveis de ambiente no projeto Railway:

### Variáveis Obrigatórias do Backend:

1. DATABASE_URL
   - Tipo: String de conexão PostgreSQL
   - Formato: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
   - Descrição: String de conexão direta ao banco PostgreSQL do Supabase
   - Onde obter: Supabase Dashboard → Settings → Database → Connection string → URI

2. SUPABASE_URL
   - Tipo: URL
   - Formato: https://[PROJECT_REF].supabase.co
   - Descrição: URL base do projeto Supabase
   - Onde obter: Supabase Dashboard → Settings → API → Project URL

3. SUPABASE_ANON_KEY
   - Tipo: JWT Token (string)
   - Formato: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   - Descrição: Chave pública anônima do Supabase (para uso no backend)
   - Onde obter: Supabase Dashboard → Settings → API → Project API keys → anon (public)

4. SUPABASE_SERVICE_ROLE_KEY
   - Tipo: JWT Token (string)
   - Formato: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   - Descrição: Chave secreta de service_role do Supabase (NUNCA expor no frontend)
   - Onde obter: Supabase Dashboard → Settings → API → Project API keys → service_role (secret)

5. NODE_ENV
   - Valor: production
   - Descrição: Ambiente de execução

### Variáveis para o Frontend (Build-time):

6. VITE_SUPABASE_URL
   - Tipo: URL
   - Valor: Mesmo valor do SUPABASE_URL
   - Descrição: URL do Supabase para o frontend (usado durante o build do Vite)

7. VITE_SUPABASE_ANON_KEY
   - Tipo: JWT Token (string)
   - Valor: Mesmo valor do SUPABASE_ANON_KEY
   - Descrição: Chave pública do Supabase para o frontend (usado durante o build do Vite)

### Variáveis Opcionais (se usar Stripe):

8. STRIPE_SECRET_KEY (opcional)
   - Tipo: String
   - Formato: sk_live_... ou sk_test_...
   - Descrição: Chave secreta do Stripe para pagamentos

9. STRIPE_WEBHOOK_SECRET (opcional)
   - Tipo: String
   - Formato: whsec_...
   - Descrição: Secret do webhook do Stripe

10. VITE_STRIPE_PUBLISHABLE_KEY (opcional)
    - Tipo: String
    - Formato: pk_live_... ou pk_test_...
    - Descrição: Chave pública do Stripe para o frontend

### Variáveis Opcionais (JWT/Session):

11. JWT_SECRET (opcional, mas recomendado)
    - Tipo: String aleatória
    - Descrição: Secret para assinar tokens JWT de sessão
    - Gerar: Use uma string aleatória segura (ex: openssl rand -hex 32)

---

## 📝 IMPORTANTE:

- Todas as variáveis que começam com `VITE_` são usadas durante o BUILD do frontend
- As variáveis sem `VITE_` são usadas apenas no servidor (runtime)
- O `DATABASE_URL` deve usar a conexão direta (porta 5432) ou session mode (pooler na porta 5432)
- NÃO use transaction mode (porta 6543) pois não suporta prepared statements do Drizzle ORM

## 🔍 Como Verificar:

Após adicionar as variáveis, o deploy deve mostrar nos logs:
- "[Database] Connected successfully"
- Se aparecer erro de conexão, verifique se o DATABASE_URL está correto

Por favor, adicione essas variáveis e me informe quais você conseguiu adicionar e quais precisam de valores específicos do meu projeto Supabase.
```

---

## 📋 Checklist de Valores que Você Precisa Fornecer

Antes de pedir ao agente, você precisa obter estes valores do Supabase:

### 1. **DATABASE_URL**
```
1. Vá em: Supabase Dashboard → Settings → Database
2. Role até "Connection string"
3. Selecione "URI" (não "Session mode" ou "Transaction mode")
4. Copie a string completa
```

**Exemplo:**
```
postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

### 2. **SUPABASE_URL**
```
1. Vá em: Supabase Dashboard → Settings → API
2. Copie o "Project URL"
```

**Exemplo:**
```
https://abcdefghijklmnop.supabase.co
```

### 3. **SUPABASE_ANON_KEY**
```
1. Vá em: Supabase Dashboard → Settings → API
2. Em "Project API keys"
3. Copie a chave "anon" (public)
```

**Exemplo:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTk4ODgwMCwiZXhwIjoxOTYxNTY0ODAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. **SUPABASE_SERVICE_ROLE_KEY**
```
1. Vá em: Supabase Dashboard → Settings → API
2. Em "Project API keys"
3. Copie a chave "service_role" (secret)
⚠️ CUIDADO: Esta chave tem acesso total ao banco!
```

**Exemplo:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjQ1OTg4ODAwLCJleHAiOjE5NjE1NjQ4MDB9.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
```

---

## 🚀 Versão Simplificada do Prompt

Se o agente não entender o prompt completo, use esta versão mais direta:

```
Preciso adicionar variáveis de ambiente no Railway para conectar ao Supabase.

Adicione estas variáveis (eu vou fornecer os valores):

1. DATABASE_URL - String de conexão PostgreSQL do Supabase
2. SUPABASE_URL - URL do projeto Supabase (https://[project].supabase.co)
3. SUPABASE_ANON_KEY - Chave pública anônima do Supabase
4. SUPABASE_SERVICE_ROLE_KEY - Chave secreta service_role do Supabase
5. NODE_ENV=production
6. VITE_SUPABASE_URL - Mesmo valor do SUPABASE_URL
7. VITE_SUPABASE_ANON_KEY - Mesmo valor do SUPABASE_ANON_KEY

Depois que você adicionar as variáveis, eu vou fornecer os valores específicos do meu projeto.
```

---

## 📝 Após o Agente Adicionar as Variáveis

Depois que o agente criar as variáveis (mesmo que vazias), você precisa:

1. **Preencher os valores** manualmente no Railway Dashboard:
   - Vá em **Variables**
   - Clique em cada variável
   - Cole o valor correspondente do Supabase

2. **Ou fornecer os valores ao agente:**
   ```
   Aqui estão os valores das variáveis:
   
   DATABASE_URL=postgresql://postgres.abc123:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
   SUPABASE_URL=https://abc123.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_SUPABASE_URL=https://abc123.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## ✅ Verificação Final

Após configurar tudo, verifique nos logs do Railway:

```
✅ [Database] Connected successfully (direct)
✅ [Database] Connected successfully (session-mode)
```

Se aparecer erro, verifique:
- ❌ `DATABASE_URL` está correto?
- ❌ Senha do banco está correta?
- ❌ Todas as variáveis foram adicionadas?

---

**Status**: Pronto para copiar e colar no agente do Railway! 🚀



# 🤖 Prompt para Agente de IA do Railway

## 📋 Instruções para o Agente

Copie e cole este prompt completo no chat do agente de IA do Railway:

---

## 🎯 PROMPT PARA O AGENTE:

```
Preciso configurar as variáveis de ambiente para conectar minha aplicação Node.js ao banco de dados PostgreSQL do Supabase.

Por favor, adicione as seguintes variáveis de ambiente no projeto Railway:

### Variáveis Obrigatórias do Backend:

1. DATABASE_URL
   - Tipo: String de conexão PostgreSQL
   - Formato: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
   - Descrição: String de conexão direta ao banco PostgreSQL do Supabase
   - Onde obter: Supabase Dashboard → Settings → Database → Connection string → URI

2. SUPABASE_URL
   - Tipo: URL
   - Formato: https://[PROJECT_REF].supabase.co
   - Descrição: URL base do projeto Supabase
   - Onde obter: Supabase Dashboard → Settings → API → Project URL

3. SUPABASE_ANON_KEY
   - Tipo: JWT Token (string)
   - Formato: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   - Descrição: Chave pública anônima do Supabase (para uso no backend)
   - Onde obter: Supabase Dashboard → Settings → API → Project API keys → anon (public)

4. SUPABASE_SERVICE_ROLE_KEY
   - Tipo: JWT Token (string)
   - Formato: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   - Descrição: Chave secreta de service_role do Supabase (NUNCA expor no frontend)
   - Onde obter: Supabase Dashboard → Settings → API → Project API keys → service_role (secret)

5. NODE_ENV
   - Valor: production
   - Descrição: Ambiente de execução

### Variáveis para o Frontend (Build-time):

6. VITE_SUPABASE_URL
   - Tipo: URL
   - Valor: Mesmo valor do SUPABASE_URL
   - Descrição: URL do Supabase para o frontend (usado durante o build do Vite)

7. VITE_SUPABASE_ANON_KEY
   - Tipo: JWT Token (string)
   - Valor: Mesmo valor do SUPABASE_ANON_KEY
   - Descrição: Chave pública do Supabase para o frontend (usado durante o build do Vite)

### Variáveis Opcionais (se usar Stripe):

8. STRIPE_SECRET_KEY (opcional)
   - Tipo: String
   - Formato: sk_live_... ou sk_test_...
   - Descrição: Chave secreta do Stripe para pagamentos

9. STRIPE_WEBHOOK_SECRET (opcional)
   - Tipo: String
   - Formato: whsec_...
   - Descrição: Secret do webhook do Stripe

10. VITE_STRIPE_PUBLISHABLE_KEY (opcional)
    - Tipo: String
    - Formato: pk_live_... ou pk_test_...
    - Descrição: Chave pública do Stripe para o frontend

### Variáveis Opcionais (JWT/Session):

11. JWT_SECRET (opcional, mas recomendado)
    - Tipo: String aleatória
    - Descrição: Secret para assinar tokens JWT de sessão
    - Gerar: Use uma string aleatória segura (ex: openssl rand -hex 32)

---

## 📝 IMPORTANTE:

- Todas as variáveis que começam com `VITE_` são usadas durante o BUILD do frontend
- As variáveis sem `VITE_` são usadas apenas no servidor (runtime)
- O `DATABASE_URL` deve usar a conexão direta (porta 5432) ou session mode (pooler na porta 5432)
- NÃO use transaction mode (porta 6543) pois não suporta prepared statements do Drizzle ORM

## 🔍 Como Verificar:

Após adicionar as variáveis, o deploy deve mostrar nos logs:
- "[Database] Connected successfully"
- Se aparecer erro de conexão, verifique se o DATABASE_URL está correto

Por favor, adicione essas variáveis e me informe quais você conseguiu adicionar e quais precisam de valores específicos do meu projeto Supabase.
```

---

## 📋 Checklist de Valores que Você Precisa Fornecer

Antes de pedir ao agente, você precisa obter estes valores do Supabase:

### 1. **DATABASE_URL**
```
1. Vá em: Supabase Dashboard → Settings → Database
2. Role até "Connection string"
3. Selecione "URI" (não "Session mode" ou "Transaction mode")
4. Copie a string completa
```

**Exemplo:**
```
postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

### 2. **SUPABASE_URL**
```
1. Vá em: Supabase Dashboard → Settings → API
2. Copie o "Project URL"
```

**Exemplo:**
```
https://abcdefghijklmnop.supabase.co
```

### 3. **SUPABASE_ANON_KEY**
```
1. Vá em: Supabase Dashboard → Settings → API
2. Em "Project API keys"
3. Copie a chave "anon" (public)
```

**Exemplo:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTk4ODgwMCwiZXhwIjoxOTYxNTY0ODAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. **SUPABASE_SERVICE_ROLE_KEY**
```
1. Vá em: Supabase Dashboard → Settings → API
2. Em "Project API keys"
3. Copie a chave "service_role" (secret)
⚠️ CUIDADO: Esta chave tem acesso total ao banco!
```

**Exemplo:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjQ1OTg4ODAwLCJleHAiOjE5NjE1NjQ4MDB9.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
```

---

## 🚀 Versão Simplificada do Prompt

Se o agente não entender o prompt completo, use esta versão mais direta:

```
Preciso adicionar variáveis de ambiente no Railway para conectar ao Supabase.

Adicione estas variáveis (eu vou fornecer os valores):

1. DATABASE_URL - String de conexão PostgreSQL do Supabase
2. SUPABASE_URL - URL do projeto Supabase (https://[project].supabase.co)
3. SUPABASE_ANON_KEY - Chave pública anônima do Supabase
4. SUPABASE_SERVICE_ROLE_KEY - Chave secreta service_role do Supabase
5. NODE_ENV=production
6. VITE_SUPABASE_URL - Mesmo valor do SUPABASE_URL
7. VITE_SUPABASE_ANON_KEY - Mesmo valor do SUPABASE_ANON_KEY

Depois que você adicionar as variáveis, eu vou fornecer os valores específicos do meu projeto.
```

---

## 📝 Após o Agente Adicionar as Variáveis

Depois que o agente criar as variáveis (mesmo que vazias), você precisa:

1. **Preencher os valores** manualmente no Railway Dashboard:
   - Vá em **Variables**
   - Clique em cada variável
   - Cole o valor correspondente do Supabase

2. **Ou fornecer os valores ao agente:**
   ```
   Aqui estão os valores das variáveis:
   
   DATABASE_URL=postgresql://postgres.abc123:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
   SUPABASE_URL=https://abc123.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_SUPABASE_URL=https://abc123.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## ✅ Verificação Final

Após configurar tudo, verifique nos logs do Railway:

```
✅ [Database] Connected successfully (direct)
✅ [Database] Connected successfully (session-mode)
```

Se aparecer erro, verifique:
- ❌ `DATABASE_URL` está correto?
- ❌ Senha do banco está correta?
- ❌ Todas as variáveis foram adicionadas?

---

**Status**: Pronto para copiar e colar no agente do Railway! 🚀


# 🤖 Prompt para Agente de IA do Railway

## 📋 Instruções para o Agente

Copie e cole este prompt completo no chat do agente de IA do Railway:

---

## 🎯 PROMPT PARA O AGENTE:

```
Preciso configurar as variáveis de ambiente para conectar minha aplicação Node.js ao banco de dados PostgreSQL do Supabase.

Por favor, adicione as seguintes variáveis de ambiente no projeto Railway:

### Variáveis Obrigatórias do Backend:

1. DATABASE_URL
   - Tipo: String de conexão PostgreSQL
   - Formato: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
   - Descrição: String de conexão direta ao banco PostgreSQL do Supabase
   - Onde obter: Supabase Dashboard → Settings → Database → Connection string → URI

2. SUPABASE_URL
   - Tipo: URL
   - Formato: https://[PROJECT_REF].supabase.co
   - Descrição: URL base do projeto Supabase
   - Onde obter: Supabase Dashboard → Settings → API → Project URL

3. SUPABASE_ANON_KEY
   - Tipo: JWT Token (string)
   - Formato: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   - Descrição: Chave pública anônima do Supabase (para uso no backend)
   - Onde obter: Supabase Dashboard → Settings → API → Project API keys → anon (public)

4. SUPABASE_SERVICE_ROLE_KEY
   - Tipo: JWT Token (string)
   - Formato: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   - Descrição: Chave secreta de service_role do Supabase (NUNCA expor no frontend)
   - Onde obter: Supabase Dashboard → Settings → API → Project API keys → service_role (secret)

5. NODE_ENV
   - Valor: production
   - Descrição: Ambiente de execução

### Variáveis para o Frontend (Build-time):

6. VITE_SUPABASE_URL
   - Tipo: URL
   - Valor: Mesmo valor do SUPABASE_URL
   - Descrição: URL do Supabase para o frontend (usado durante o build do Vite)

7. VITE_SUPABASE_ANON_KEY
   - Tipo: JWT Token (string)
   - Valor: Mesmo valor do SUPABASE_ANON_KEY
   - Descrição: Chave pública do Supabase para o frontend (usado durante o build do Vite)

### Variáveis Opcionais (se usar Stripe):

8. STRIPE_SECRET_KEY (opcional)
   - Tipo: String
   - Formato: sk_live_... ou sk_test_...
   - Descrição: Chave secreta do Stripe para pagamentos

9. STRIPE_WEBHOOK_SECRET (opcional)
   - Tipo: String
   - Formato: whsec_...
   - Descrição: Secret do webhook do Stripe

10. VITE_STRIPE_PUBLISHABLE_KEY (opcional)
    - Tipo: String
    - Formato: pk_live_... ou pk_test_...
    - Descrição: Chave pública do Stripe para o frontend

### Variáveis Opcionais (JWT/Session):

11. JWT_SECRET (opcional, mas recomendado)
    - Tipo: String aleatória
    - Descrição: Secret para assinar tokens JWT de sessão
    - Gerar: Use uma string aleatória segura (ex: openssl rand -hex 32)

---

## 📝 IMPORTANTE:

- Todas as variáveis que começam com `VITE_` são usadas durante o BUILD do frontend
- As variáveis sem `VITE_` são usadas apenas no servidor (runtime)
- O `DATABASE_URL` deve usar a conexão direta (porta 5432) ou session mode (pooler na porta 5432)
- NÃO use transaction mode (porta 6543) pois não suporta prepared statements do Drizzle ORM

## 🔍 Como Verificar:

Após adicionar as variáveis, o deploy deve mostrar nos logs:
- "[Database] Connected successfully"
- Se aparecer erro de conexão, verifique se o DATABASE_URL está correto

Por favor, adicione essas variáveis e me informe quais você conseguiu adicionar e quais precisam de valores específicos do meu projeto Supabase.
```

---

## 📋 Checklist de Valores que Você Precisa Fornecer

Antes de pedir ao agente, você precisa obter estes valores do Supabase:

### 1. **DATABASE_URL**
```
1. Vá em: Supabase Dashboard → Settings → Database
2. Role até "Connection string"
3. Selecione "URI" (não "Session mode" ou "Transaction mode")
4. Copie a string completa
```

**Exemplo:**
```
postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

### 2. **SUPABASE_URL**
```
1. Vá em: Supabase Dashboard → Settings → API
2. Copie o "Project URL"
```

**Exemplo:**
```
https://abcdefghijklmnop.supabase.co
```

### 3. **SUPABASE_ANON_KEY**
```
1. Vá em: Supabase Dashboard → Settings → API
2. Em "Project API keys"
3. Copie a chave "anon" (public)
```

**Exemplo:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTk4ODgwMCwiZXhwIjoxOTYxNTY0ODAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. **SUPABASE_SERVICE_ROLE_KEY**
```
1. Vá em: Supabase Dashboard → Settings → API
2. Em "Project API keys"
3. Copie a chave "service_role" (secret)
⚠️ CUIDADO: Esta chave tem acesso total ao banco!
```

**Exemplo:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjQ1OTg4ODAwLCJleHAiOjE5NjE1NjQ4MDB9.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
```

---

## 🚀 Versão Simplificada do Prompt

Se o agente não entender o prompt completo, use esta versão mais direta:

```
Preciso adicionar variáveis de ambiente no Railway para conectar ao Supabase.

Adicione estas variáveis (eu vou fornecer os valores):

1. DATABASE_URL - String de conexão PostgreSQL do Supabase
2. SUPABASE_URL - URL do projeto Supabase (https://[project].supabase.co)
3. SUPABASE_ANON_KEY - Chave pública anônima do Supabase
4. SUPABASE_SERVICE_ROLE_KEY - Chave secreta service_role do Supabase
5. NODE_ENV=production
6. VITE_SUPABASE_URL - Mesmo valor do SUPABASE_URL
7. VITE_SUPABASE_ANON_KEY - Mesmo valor do SUPABASE_ANON_KEY

Depois que você adicionar as variáveis, eu vou fornecer os valores específicos do meu projeto.
```

---

## 📝 Após o Agente Adicionar as Variáveis

Depois que o agente criar as variáveis (mesmo que vazias), você precisa:

1. **Preencher os valores** manualmente no Railway Dashboard:
   - Vá em **Variables**
   - Clique em cada variável
   - Cole o valor correspondente do Supabase

2. **Ou fornecer os valores ao agente:**
   ```
   Aqui estão os valores das variáveis:
   
   DATABASE_URL=postgresql://postgres.abc123:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
   SUPABASE_URL=https://abc123.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_SUPABASE_URL=https://abc123.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## ✅ Verificação Final

Após configurar tudo, verifique nos logs do Railway:

```
✅ [Database] Connected successfully (direct)
✅ [Database] Connected successfully (session-mode)
```

Se aparecer erro, verifique:
- ❌ `DATABASE_URL` está correto?
- ❌ Senha do banco está correta?
- ❌ Todas as variáveis foram adicionadas?

---

**Status**: Pronto para copiar e colar no agente do Railway! 🚀





=======
>>>>>>> Incoming (Background Agent changes)
