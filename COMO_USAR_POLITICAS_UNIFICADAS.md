# 📋 POLÍTICAS UNIFICADAS - GUIA DE USO

## 🎯 O QUE MUDOU

Agora cada bucket tem **UMA ÚNICA política** que cobre todas as 4 operações (SELECT, INSERT, UPDATE, DELETE).

### Antes:
- 4 políticas por bucket (select, insert, update, delete)
- Total: 48 políticas

### Agora:
- 1 política por bucket (unificada) para a maioria
- 2 políticas para wall, partnerships e marketing (devido a regras diferentes)
- Total: 14 políticas

---

## 📝 NOMES DAS POLÍTICAS

Cada bucket tem uma política com nome simples:

1. `pets_policy`
2. `daycare_photos_policy`
3. `documents_policy`
4. `financial_policy`
5. `reports_policy`
6. `products_policy`
7. `health_logs_policy`
8. `tutors_policy`
9. `staff_policy`
10. `wall_policy`
11. `partnerships_policy`
12. `marketing_policy`

---

## 🚀 COMO USAR

### Opção 1: Executar Tudo de Uma Vez (Recomendado)

1. Abra o arquivo `POLITICAS_SQL_UNIFICADAS.sql`
2. **Copie TODO o conteúdo** (Cmd+A, Cmd+C)
3. No Supabase Dashboard → **SQL Editor** → **New Query**
4. **Cole** o script completo (Cmd+V)
5. Clique em **RUN** (⚡) ou pressione `Cmd+Enter`
6. Aguarde a execução (30-60 segundos)

**Vantagem**: Cria todas as 12 políticas de uma vez!

---

### Opção 2: Executar Bucket por Bucket

1. Abra o arquivo `POLITICAS_SQL_UNIFICADAS.sql`
2. Encontre a seção do bucket desejado (ex: `-- BUCKET: pets`)
3. **Copie apenas essa seção** (do comentário até o próximo comentário)
4. Cole no SQL Editor e execute
5. Repita para cada bucket

**Vantagem**: Mais controle, pode verificar cada bucket individualmente

---

## ✅ VALIDAÇÃO

Após executar, valide com esta query:

```sql
SELECT 
  policyname,
  cmd as operation
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
ORDER BY policyname;
```

**Resultado esperado**: 14 políticas listadas

---

## 📊 ESTRUTURA DAS POLÍTICAS

Cada política unificada usa:
- `FOR ALL` - cobre todas as operações
- `USING` - para SELECT, UPDATE, DELETE
- `WITH CHECK` - para INSERT, UPDATE

### Exemplo (bucket pets):

```sql
CREATE POLICY "pets_policy"
ON storage.objects FOR ALL
TO authenticated
USING (
  -- SELECT, UPDATE, DELETE: Tutores do pet + Admins
  bucket_id = 'pets' 
  AND (
    public.is_admin((SELECT auth.uid()))
    OR
    public.is_tutor_of_pet(...)
  )
)
WITH CHECK (
  -- INSERT: Apenas Admins
  bucket_id = 'pets' 
  AND public.is_admin((SELECT auth.uid()))
);
```

---

## 🆘 TROUBLESHOOTING

### Erro: "must be owner of table objects"
→ Infelizmente, você precisará criar as políticas via Dashboard UI

### Erro: "function does not exist"
→ Execute primeiro o arquivo `SCRIPT_DIVIDIDO_PARTE1_FUNCOES.sql` para criar as funções auxiliares

### Erro: "policy already exists"
→ Normal, o script usa `DROP POLICY IF EXISTS` antes de criar

### Algumas políticas não foram criadas
→ Execute apenas a seção do bucket que falhou

---

## 🎯 VANTAGENS DAS POLÍTICAS UNIFICADAS

✅ **Mais simples**: 1 política por bucket (14 total, sendo 12 unificadas)  
✅ **Mais fácil de gerenciar**: Nomes simples e claros  
✅ **Menos código**: Menos linhas de SQL  
✅ **Mesma funcionalidade**: Cobre todas as operações

---

**Pronto para usar!** 🚀


## 🎯 O QUE MUDOU

Agora cada bucket tem **UMA ÚNICA política** que cobre todas as 4 operações (SELECT, INSERT, UPDATE, DELETE).

### Antes:
- 4 políticas por bucket (select, insert, update, delete)
- Total: 48 políticas

### Agora:
- 1 política por bucket (unificada) para a maioria
- 2 políticas para wall, partnerships e marketing (devido a regras diferentes)
- Total: 14 políticas

---

## 📝 NOMES DAS POLÍTICAS

Cada bucket tem uma política com nome simples:

1. `pets_policy`
2. `daycare_photos_policy`
3. `documents_policy`
4. `financial_policy`
5. `reports_policy`
6. `products_policy`
7. `health_logs_policy`
8. `tutors_policy`
9. `staff_policy`
10. `wall_policy`
11. `partnerships_policy`
12. `marketing_policy`

---

## 🚀 COMO USAR

### Opção 1: Executar Tudo de Uma Vez (Recomendado)

1. Abra o arquivo `POLITICAS_SQL_UNIFICADAS.sql`
2. **Copie TODO o conteúdo** (Cmd+A, Cmd+C)
3. No Supabase Dashboard → **SQL Editor** → **New Query**
4. **Cole** o script completo (Cmd+V)
5. Clique em **RUN** (⚡) ou pressione `Cmd+Enter`
6. Aguarde a execução (30-60 segundos)

**Vantagem**: Cria todas as 12 políticas de uma vez!

---

### Opção 2: Executar Bucket por Bucket

1. Abra o arquivo `POLITICAS_SQL_UNIFICADAS.sql`
2. Encontre a seção do bucket desejado (ex: `-- BUCKET: pets`)
3. **Copie apenas essa seção** (do comentário até o próximo comentário)
4. Cole no SQL Editor e execute
5. Repita para cada bucket

**Vantagem**: Mais controle, pode verificar cada bucket individualmente

---

## ✅ VALIDAÇÃO

Após executar, valide com esta query:

```sql
SELECT 
  policyname,
  cmd as operation
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
ORDER BY policyname;
```

**Resultado esperado**: 14 políticas listadas

---

## 📊 ESTRUTURA DAS POLÍTICAS

Cada política unificada usa:
- `FOR ALL` - cobre todas as operações
- `USING` - para SELECT, UPDATE, DELETE
- `WITH CHECK` - para INSERT, UPDATE

### Exemplo (bucket pets):

```sql
CREATE POLICY "pets_policy"
ON storage.objects FOR ALL
TO authenticated
USING (
  -- SELECT, UPDATE, DELETE: Tutores do pet + Admins
  bucket_id = 'pets' 
  AND (
    public.is_admin((SELECT auth.uid()))
    OR
    public.is_tutor_of_pet(...)
  )
)
WITH CHECK (
  -- INSERT: Apenas Admins
  bucket_id = 'pets' 
  AND public.is_admin((SELECT auth.uid()))
);
```

---

## 🆘 TROUBLESHOOTING

### Erro: "must be owner of table objects"
→ Infelizmente, você precisará criar as políticas via Dashboard UI

### Erro: "function does not exist"
→ Execute primeiro o arquivo `SCRIPT_DIVIDIDO_PARTE1_FUNCOES.sql` para criar as funções auxiliares

### Erro: "policy already exists"
→ Normal, o script usa `DROP POLICY IF EXISTS` antes de criar

### Algumas políticas não foram criadas
→ Execute apenas a seção do bucket que falhou

---

## 🎯 VANTAGENS DAS POLÍTICAS UNIFICADAS

✅ **Mais simples**: 1 política por bucket (14 total, sendo 12 unificadas)  
✅ **Mais fácil de gerenciar**: Nomes simples e claros  
✅ **Menos código**: Menos linhas de SQL  
✅ **Mesma funcionalidade**: Cobre todas as operações

---

**Pronto para usar!** 🚀

