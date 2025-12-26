# 📋 COMO USAR: POLITICAS_SQL_POR_BUCKET.sql

## 🎯 OBJETIVO

Este arquivo contém scripts SQL prontos para copiar e colar no SQL Editor do Supabase. Cada seção cria as 4 políticas (SELECT, INSERT, UPDATE, DELETE) para um bucket específico.

---

## 📝 INSTRUÇÕES

### Opção 1: Executar Tudo de Uma Vez (Recomendado)

1. Abra o arquivo `POLITICAS_SQL_POR_BUCKET.sql`
2. **Copie TODO o conteúdo** (Cmd+A, Cmd+C)
3. No Supabase Dashboard → **SQL Editor** → **New Query**
4. **Cole** o script completo (Cmd+V)
5. Clique em **RUN** (⚡) ou pressione `Cmd+Enter`
6. Aguarde a execução (1-2 minutos)

**Vantagem**: Cria todas as 48 políticas de uma vez!

---

### Opção 2: Executar Bucket por Bucket

Se preferir executar um bucket por vez:

1. Abra o arquivo `POLITICAS_SQL_POR_BUCKET.sql`
2. Encontre a seção do bucket desejado (ex: `-- BUCKET: pets`)
3. **Copie apenas essa seção** (do comentário até o próximo comentário)
4. Cole no SQL Editor e execute
5. Repita para cada bucket

**Vantagem**: Mais controle, pode verificar cada bucket individualmente

---

## ✅ VALIDAÇÃO

Após executar, valide com esta query:

```sql
SELECT COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects';
```

**Resultado esperado**: `total_policies = 48`

---

## 📊 ESTRUTURA DO ARQUIVO

O arquivo está organizado em 12 seções, uma para cada bucket:

1. **pets** (PRIVADO)
2. **daycare-photos** (PRIVADO)
3. **documents** (PRIVADO)
4. **financial** (PRIVADO)
5. **reports** (PRIVADO)
6. **products** (PRIVADO)
7. **health-logs** (PRIVADO)
8. **tutors** (PRIVADO)
9. **staff** (PRIVADO)
10. **wall** (PÚBLICO - autenticados)
11. **partnerships** (PÚBLICO)
12. **marketing** (PÚBLICO)

Cada seção contém:
- `DROP POLICY IF EXISTS` (remove políticas antigas)
- 4 políticas `CREATE POLICY` (SELECT, INSERT, UPDATE, DELETE)

---

## 🆘 TROUBLESHOOTING

### Erro: "must be owner of table objects"
→ Infelizmente, você precisará criar as políticas via Dashboard UI (use `POLITICAS_UI_DASHBOARD.md`)

### Erro: "function does not exist"
→ Execute primeiro o arquivo `SCRIPT_DIVIDIDO_PARTE1_FUNCOES.sql` para criar as funções auxiliares

### Erro: "policy already exists"
→ Normal, o script usa `DROP POLICY IF EXISTS` antes de criar

### Algumas políticas não foram criadas
→ Execute apenas a seção do bucket que falhou

---

## 🎯 RECOMENDAÇÃO

**Tente a Opção 1 primeiro** (executar tudo de uma vez). Se der erro de permissão, use a Opção 2 (bucket por bucket) ou crie via Dashboard UI.

---

**Pronto para usar!** 🚀






## 🎯 OBJETIVO

Este arquivo contém scripts SQL prontos para copiar e colar no SQL Editor do Supabase. Cada seção cria as 4 políticas (SELECT, INSERT, UPDATE, DELETE) para um bucket específico.

---

## 📝 INSTRUÇÕES

### Opção 1: Executar Tudo de Uma Vez (Recomendado)

1. Abra o arquivo `POLITICAS_SQL_POR_BUCKET.sql`
2. **Copie TODO o conteúdo** (Cmd+A, Cmd+C)
3. No Supabase Dashboard → **SQL Editor** → **New Query**
4. **Cole** o script completo (Cmd+V)
5. Clique em **RUN** (⚡) ou pressione `Cmd+Enter`
6. Aguarde a execução (1-2 minutos)

**Vantagem**: Cria todas as 48 políticas de uma vez!

---

### Opção 2: Executar Bucket por Bucket

Se preferir executar um bucket por vez:

1. Abra o arquivo `POLITICAS_SQL_POR_BUCKET.sql`
2. Encontre a seção do bucket desejado (ex: `-- BUCKET: pets`)
3. **Copie apenas essa seção** (do comentário até o próximo comentário)
4. Cole no SQL Editor e execute
5. Repita para cada bucket

**Vantagem**: Mais controle, pode verificar cada bucket individualmente

---

## ✅ VALIDAÇÃO

Após executar, valide com esta query:

```sql
SELECT COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects';
```

**Resultado esperado**: `total_policies = 48`

---

## 📊 ESTRUTURA DO ARQUIVO

O arquivo está organizado em 12 seções, uma para cada bucket:

1. **pets** (PRIVADO)
2. **daycare-photos** (PRIVADO)
3. **documents** (PRIVADO)
4. **financial** (PRIVADO)
5. **reports** (PRIVADO)
6. **products** (PRIVADO)
7. **health-logs** (PRIVADO)
8. **tutors** (PRIVADO)
9. **staff** (PRIVADO)
10. **wall** (PÚBLICO - autenticados)
11. **partnerships** (PÚBLICO)
12. **marketing** (PÚBLICO)

Cada seção contém:
- `DROP POLICY IF EXISTS` (remove políticas antigas)
- 4 políticas `CREATE POLICY` (SELECT, INSERT, UPDATE, DELETE)

---

## 🆘 TROUBLESHOOTING

### Erro: "must be owner of table objects"
→ Infelizmente, você precisará criar as políticas via Dashboard UI (use `POLITICAS_UI_DASHBOARD.md`)

### Erro: "function does not exist"
→ Execute primeiro o arquivo `SCRIPT_DIVIDIDO_PARTE1_FUNCOES.sql` para criar as funções auxiliares

### Erro: "policy already exists"
→ Normal, o script usa `DROP POLICY IF EXISTS` antes de criar

### Algumas políticas não foram criadas
→ Execute apenas a seção do bucket que falhou

---

## 🎯 RECOMENDAÇÃO

**Tente a Opção 1 primeiro** (executar tudo de uma vez). Se der erro de permissão, use a Opção 2 (bucket por bucket) ou crie via Dashboard UI.

---

**Pronto para usar!** 🚀






