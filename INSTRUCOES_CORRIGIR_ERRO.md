# 🔧 CORRIGIR ERRO DE SINTAXE SQL

## ❌ ERRO IDENTIFICADO

O erro `syntax error at or near "POLICY"` geralmente ocorre quando:

1. **Você está usando a interface do Dashboard** (Storage → Policies) ao invés do SQL Editor
2. **Há caracteres invisíveis** ou formatação incorreta no SQL copiado
3. **O SQL está sendo executado em partes** que não estão completas

---

## ✅ SOLUÇÃO

### **IMPORTANTE: Use o SQL Editor, NÃO a interface de Policies!**

1. **Acesse SQL Editor** (não Storage → Policies)
   - Dashboard → **SQL Editor** → **New Query**

2. **Use o arquivo `POLITICAS_SQL_VALIDADO.sql`**
   - Este arquivo foi validado e está limpo
   - Copie TODO o conteúdo
   - Cole no SQL Editor
   - Execute de uma vez

3. **OU execute bucket por bucket**
   - Copie apenas uma seção completa (ex: apenas o bucket "pets")
   - Execute
   - Repita para cada bucket

---

## 🚫 NÃO FAÇA

- ❌ Não use a interface **Storage → Policies → New Policy**
- ❌ Não copie apenas partes do SQL
- ❌ Não execute via Dashboard UI

---

## ✅ FAÇA

- ✅ Use **SQL Editor** (menu lateral)
- ✅ Copie o SQL completo ou seções completas
- ✅ Execute tudo de uma vez

---

## 📝 ARQUIVO CORRETO

Use o arquivo **`POLITICAS_SQL_VALIDADO.sql`** que foi criado com sintaxe validada e limpa.

---

## 🆘 SE AINDA DER ERRO

Execute apenas o primeiro bucket (pets) para testar:

```sql
-- Apenas bucket pets
DROP POLICY IF EXISTS "pets_policy_select" ON storage.objects;
DROP POLICY IF EXISTS "pets_policy_insert" ON storage.objects;
DROP POLICY IF EXISTS "pets_policy_update" ON storage.objects;
DROP POLICY IF EXISTS "pets_policy_delete" ON storage.objects;

CREATE POLICY "pets_policy_select"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'pets' 
  AND (
    public.is_admin((SELECT auth.uid()))
    OR
    public.is_tutor_of_pet(
      (SELECT auth.uid()),
      public.extract_pet_id_from_path(name)
    )
  )
);

CREATE POLICY "pets_policy_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'pets' 
  AND public.is_admin((SELECT auth.uid()))
);

CREATE POLICY "pets_policy_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'pets' 
  AND public.is_admin((SELECT auth.uid()))
);

CREATE POLICY "pets_policy_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'pets' 
  AND public.is_admin((SELECT auth.uid()))
);
```

Se este funcionar, continue com os outros buckets.






## ❌ ERRO IDENTIFICADO

O erro `syntax error at or near "POLICY"` geralmente ocorre quando:

1. **Você está usando a interface do Dashboard** (Storage → Policies) ao invés do SQL Editor
2. **Há caracteres invisíveis** ou formatação incorreta no SQL copiado
3. **O SQL está sendo executado em partes** que não estão completas

---

## ✅ SOLUÇÃO

### **IMPORTANTE: Use o SQL Editor, NÃO a interface de Policies!**

1. **Acesse SQL Editor** (não Storage → Policies)
   - Dashboard → **SQL Editor** → **New Query**

2. **Use o arquivo `POLITICAS_SQL_VALIDADO.sql`**
   - Este arquivo foi validado e está limpo
   - Copie TODO o conteúdo
   - Cole no SQL Editor
   - Execute de uma vez

3. **OU execute bucket por bucket**
   - Copie apenas uma seção completa (ex: apenas o bucket "pets")
   - Execute
   - Repita para cada bucket

---

## 🚫 NÃO FAÇA

- ❌ Não use a interface **Storage → Policies → New Policy**
- ❌ Não copie apenas partes do SQL
- ❌ Não execute via Dashboard UI

---

## ✅ FAÇA

- ✅ Use **SQL Editor** (menu lateral)
- ✅ Copie o SQL completo ou seções completas
- ✅ Execute tudo de uma vez

---

## 📝 ARQUIVO CORRETO

Use o arquivo **`POLITICAS_SQL_VALIDADO.sql`** que foi criado com sintaxe validada e limpa.

---

## 🆘 SE AINDA DER ERRO

Execute apenas o primeiro bucket (pets) para testar:

```sql
-- Apenas bucket pets
DROP POLICY IF EXISTS "pets_policy_select" ON storage.objects;
DROP POLICY IF EXISTS "pets_policy_insert" ON storage.objects;
DROP POLICY IF EXISTS "pets_policy_update" ON storage.objects;
DROP POLICY IF EXISTS "pets_policy_delete" ON storage.objects;

CREATE POLICY "pets_policy_select"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'pets' 
  AND (
    public.is_admin((SELECT auth.uid()))
    OR
    public.is_tutor_of_pet(
      (SELECT auth.uid()),
      public.extract_pet_id_from_path(name)
    )
  )
);

CREATE POLICY "pets_policy_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'pets' 
  AND public.is_admin((SELECT auth.uid()))
);

CREATE POLICY "pets_policy_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'pets' 
  AND public.is_admin((SELECT auth.uid()))
);

CREATE POLICY "pets_policy_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'pets' 
  AND public.is_admin((SELECT auth.uid()))
);
```

Se este funcionar, continue com os outros buckets.






