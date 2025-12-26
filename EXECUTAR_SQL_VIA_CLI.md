# 🔧 EXECUTAR SQL VIA CLI - SOLUÇÕES

## ❌ Problema

O comando `supabase db execute -f arquivo.sql` não existe no Supabase CLI.

---

## ✅ SOLUÇÃO 1: Usar psql (Recomendado)

Se você tem `psql` instalado, pode executar o script diretamente:

### 1. Obter Connection String

No Supabase Dashboard:
1. Vá em **Settings** → **Database**
2. Copie a **Connection string** (URI format)
3. Ela deve ser algo como: `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres`

### 2. Executar Script

```bash
# Substitua [CONNECTION_STRING] pela sua connection string
psql "[CONNECTION_STRING]" -f SQL_RLS_FINAL_COMPLETO.sql
```

**OU** se preferir usar variável de ambiente:

```bash
# Ler connection string do .env.local
export DATABASE_URL=$(grep DATABASE_URL .env.local | cut -d '=' -f2-)

# Executar script
psql "$DATABASE_URL" -f SQL_RLS_FINAL_COMPLETO.sql
```

---

## ✅ SOLUÇÃO 2: Usar SQL Editor (Mais Simples)

1. Abra o arquivo `SQL_RLS_FINAL_COMPLETO.sql`
2. Copie TODO o conteúdo
3. No Supabase Dashboard, vá em **SQL Editor**
4. Cole o script completo
5. Clique em **RUN** (⚡)

**Nota**: Mesmo que dê erro de "must be owner", o CLI já linkou o projeto, então pode funcionar agora.

---

## ✅ SOLUÇÃO 3: Dividir em Partes

Se o script completo falhar, execute em partes:

### Parte 1: Funções (deve funcionar)
```bash
# Copiar apenas as funções do arquivo SQL_FUNCOES_OTIMIZADO.sql
# Colar no SQL Editor e executar
```

### Parte 2: Políticas (via Dashboard)
```bash
# Usar o arquivo POLITICAS_UI_DASHBOARD.md
# Criar políticas manualmente via Dashboard
```

---

## ✅ SOLUÇÃO 4: Instalar psql (se não tiver)

Se você não tem `psql` instalado:

```bash
# Via Homebrew
brew install postgresql@15

# Ou versão mais recente
brew install postgresql
```

Depois adicione ao PATH:
```bash
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zprofile
source ~/.zprofile
```

---

## 🎯 RECOMENDAÇÃO FINAL

**Use a SOLUÇÃO 2 (SQL Editor)** - é a mais simples e direta. O projeto já está linkado, então pode funcionar agora.

Se ainda der erro de permissão, use a **SOLUÇÃO 3** (dividir em partes).






## ❌ Problema

O comando `supabase db execute -f arquivo.sql` não existe no Supabase CLI.

---

## ✅ SOLUÇÃO 1: Usar psql (Recomendado)

Se você tem `psql` instalado, pode executar o script diretamente:

### 1. Obter Connection String

No Supabase Dashboard:
1. Vá em **Settings** → **Database**
2. Copie a **Connection string** (URI format)
3. Ela deve ser algo como: `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres`

### 2. Executar Script

```bash
# Substitua [CONNECTION_STRING] pela sua connection string
psql "[CONNECTION_STRING]" -f SQL_RLS_FINAL_COMPLETO.sql
```

**OU** se preferir usar variável de ambiente:

```bash
# Ler connection string do .env.local
export DATABASE_URL=$(grep DATABASE_URL .env.local | cut -d '=' -f2-)

# Executar script
psql "$DATABASE_URL" -f SQL_RLS_FINAL_COMPLETO.sql
```

---

## ✅ SOLUÇÃO 2: Usar SQL Editor (Mais Simples)

1. Abra o arquivo `SQL_RLS_FINAL_COMPLETO.sql`
2. Copie TODO o conteúdo
3. No Supabase Dashboard, vá em **SQL Editor**
4. Cole o script completo
5. Clique em **RUN** (⚡)

**Nota**: Mesmo que dê erro de "must be owner", o CLI já linkou o projeto, então pode funcionar agora.

---

## ✅ SOLUÇÃO 3: Dividir em Partes

Se o script completo falhar, execute em partes:

### Parte 1: Funções (deve funcionar)
```bash
# Copiar apenas as funções do arquivo SQL_FUNCOES_OTIMIZADO.sql
# Colar no SQL Editor e executar
```

### Parte 2: Políticas (via Dashboard)
```bash
# Usar o arquivo POLITICAS_UI_DASHBOARD.md
# Criar políticas manualmente via Dashboard
```

---

## ✅ SOLUÇÃO 4: Instalar psql (se não tiver)

Se você não tem `psql` instalado:

```bash
# Via Homebrew
brew install postgresql@15

# Ou versão mais recente
brew install postgresql
```

Depois adicione ao PATH:
```bash
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zprofile
source ~/.zprofile
```

---

## 🎯 RECOMENDAÇÃO FINAL

**Use a SOLUÇÃO 2 (SQL Editor)** - é a mais simples e direta. O projeto já está linkado, então pode funcionar agora.

Se ainda der erro de permissão, use a **SOLUÇÃO 3** (dividir em partes).






