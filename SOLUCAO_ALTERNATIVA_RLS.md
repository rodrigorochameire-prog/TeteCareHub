# 🔧 SOLUÇÃO ALTERNATIVA: POLÍTICAS RLS VIA DASHBOARD

## ⚠️ PROBLEMA

O SQL Editor do Supabase não tem permissões para criar políticas RLS diretamente em `storage.objects` via SQL.

## ✅ SOLUÇÃO: Usar Interface do Dashboard

O Supabase permite criar políticas RLS através da interface visual do Dashboard, que tem as permissões necessárias.

---

## 📋 PASSO A PASSO

### 1. Criar Funções Auxiliares (via SQL Editor)

**Isso ainda funciona no SQL Editor!** Execute apenas esta parte:

```sql
-- Remover funções existentes
DROP FUNCTION IF EXISTS public.is_tutor_of_pet(uuid, int) CASCADE;
DROP FUNCTION IF EXISTS public.extract_pet_id_from_path(text) CASCADE;
DROP FUNCTION IF EXISTS public.is_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.extract_tutor_id_from_path(text) CASCADE;

-- Criar função: is_tutor_of_pet
CREATE OR REPLACE FUNCTION public.is_tutor_of_pet(
  user_auth_id uuid,
  pet_id_param int
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  IF pet_id_param IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN EXISTS (
    SELECT 1
    FROM public.users u
    JOIN public.pet_tutors pt ON pt."tutorId" = u.id
    WHERE u.auth_id = user_auth_id
      AND pt."petId" = pet_id_param
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.is_tutor_of_pet(uuid, int) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_tutor_of_pet(uuid, int) TO service_role;

-- Criar função: extract_pet_id_from_path
CREATE OR REPLACE FUNCTION public.extract_pet_id_from_path(
  file_path text
) RETURNS int
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  path_parts text[];
  pet_id_str text;
BEGIN
  IF file_path IS NULL OR file_path = '' THEN
    RETURN NULL;
  END IF;
  
  path_parts := string_to_array(file_path, '/');
  
  IF array_length(path_parts, 1) >= 2 THEN
    pet_id_str := path_parts[2];
    BEGIN
      RETURN pet_id_str::int;
    EXCEPTION WHEN OTHERS THEN
      RETURN NULL;
    END;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Criar função: is_admin
CREATE OR REPLACE FUNCTION public.is_admin(
  user_auth_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  IF user_auth_id IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE auth_id = user_auth_id
      AND role = 'admin'
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO service_role;

-- Criar função: extract_tutor_id_from_path
CREATE OR REPLACE FUNCTION public.extract_tutor_id_from_path(
  file_path text
) RETURNS int
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  path_parts text[];
  tutor_id_str text;
BEGIN
  IF file_path IS NULL OR file_path = '' THEN
    RETURN NULL;
  END IF;
  
  path_parts := string_to_array(file_path, '/');
  
  IF array_length(path_parts, 1) >= 2 THEN
    tutor_id_str := path_parts[2];
    BEGIN
      RETURN tutor_id_str::int;
    EXCEPTION WHEN OTHERS THEN
      RETURN NULL;
    END;
  END IF;
  
  RETURN NULL;
END;
$$;
```

### 2. Habilitar RLS via Dashboard

1. Acesse **Storage** no menu lateral
2. Clique em qualquer bucket (ex: `pets`)
3. Vá na aba **"Policies"**
4. O RLS já deve estar habilitado automaticamente

### 3. Criar Políticas via Dashboard (Método Manual)

Para cada bucket, você precisa criar 4 políticas (SELECT, INSERT, UPDATE, DELETE):

#### Exemplo: Bucket `pets` (PRIVADO)

**Política 1: SELECT**
1. Clique no bucket `pets`
2. Aba **"Policies"** → **"New Policy"**
3. Selecione **"For full customization"**
4. Nome: `pets_select_tutors_and_admins`
5. Allowed operation: **SELECT**
6. Target roles: **authenticated**
7. USING expression:
```sql
bucket_id = 'pets' 
AND (
  public.is_admin(auth.uid())
  OR
  public.is_tutor_of_pet(
    auth.uid(),
    public.extract_pet_id_from_path(name)
  )
)
```
8. Clique em **"Review"** e **"Save policy"**

**Política 2: INSERT**
- Nome: `pets_insert_admins_only`
- Allowed operation: **INSERT**
- Target roles: **authenticated**
- WITH CHECK expression:
```sql
bucket_id = 'pets' 
AND public.is_admin(auth.uid())
```

**Política 3: UPDATE**
- Nome: `pets_update_admins_only`
- Allowed operation: **UPDATE**
- Target roles: **authenticated**
- USING expression:
```sql
bucket_id = 'pets' 
AND public.is_admin(auth.uid())
```

**Política 4: DELETE**
- Nome: `pets_delete_admins_only`
- Allowed operation: **DELETE**
- Target roles: **authenticated**
- USING expression:
```sql
bucket_id = 'pets' 
AND public.is_admin(auth.uid())
```

---

## 🚀 SOLUÇÃO MAIS RÁPIDA: Usar Supabase CLI

Se você tem o Supabase CLI instalado, pode executar o script completo:

```bash
# 1. Fazer login
supabase login

# 2. Linkar projeto
supabase link --project-ref seu-project-ref

# 3. Executar script
supabase db execute -f SQL_RLS_FINAL_COMPLETO.sql
```

---

## 📝 ARQUIVO COM TODAS AS POLÍTICAS

Criei um arquivo `POLITICAS_RLS_POR_BUCKET.md` com todas as políticas organizadas por bucket para facilitar a criação manual via Dashboard.

---

## ⚡ RECOMENDAÇÃO

**Use o Supabase CLI** se possível - é a forma mais rápida e confiável. Se não tiver o CLI instalado, use o método manual via Dashboard (mais trabalhoso, mas funciona).






## ⚠️ PROBLEMA

O SQL Editor do Supabase não tem permissões para criar políticas RLS diretamente em `storage.objects` via SQL.

## ✅ SOLUÇÃO: Usar Interface do Dashboard

O Supabase permite criar políticas RLS através da interface visual do Dashboard, que tem as permissões necessárias.

---

## 📋 PASSO A PASSO

### 1. Criar Funções Auxiliares (via SQL Editor)

**Isso ainda funciona no SQL Editor!** Execute apenas esta parte:

```sql
-- Remover funções existentes
DROP FUNCTION IF EXISTS public.is_tutor_of_pet(uuid, int) CASCADE;
DROP FUNCTION IF EXISTS public.extract_pet_id_from_path(text) CASCADE;
DROP FUNCTION IF EXISTS public.is_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.extract_tutor_id_from_path(text) CASCADE;

-- Criar função: is_tutor_of_pet
CREATE OR REPLACE FUNCTION public.is_tutor_of_pet(
  user_auth_id uuid,
  pet_id_param int
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  IF pet_id_param IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN EXISTS (
    SELECT 1
    FROM public.users u
    JOIN public.pet_tutors pt ON pt."tutorId" = u.id
    WHERE u.auth_id = user_auth_id
      AND pt."petId" = pet_id_param
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.is_tutor_of_pet(uuid, int) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_tutor_of_pet(uuid, int) TO service_role;

-- Criar função: extract_pet_id_from_path
CREATE OR REPLACE FUNCTION public.extract_pet_id_from_path(
  file_path text
) RETURNS int
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  path_parts text[];
  pet_id_str text;
BEGIN
  IF file_path IS NULL OR file_path = '' THEN
    RETURN NULL;
  END IF;
  
  path_parts := string_to_array(file_path, '/');
  
  IF array_length(path_parts, 1) >= 2 THEN
    pet_id_str := path_parts[2];
    BEGIN
      RETURN pet_id_str::int;
    EXCEPTION WHEN OTHERS THEN
      RETURN NULL;
    END;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Criar função: is_admin
CREATE OR REPLACE FUNCTION public.is_admin(
  user_auth_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  IF user_auth_id IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE auth_id = user_auth_id
      AND role = 'admin'
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO service_role;

-- Criar função: extract_tutor_id_from_path
CREATE OR REPLACE FUNCTION public.extract_tutor_id_from_path(
  file_path text
) RETURNS int
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  path_parts text[];
  tutor_id_str text;
BEGIN
  IF file_path IS NULL OR file_path = '' THEN
    RETURN NULL;
  END IF;
  
  path_parts := string_to_array(file_path, '/');
  
  IF array_length(path_parts, 1) >= 2 THEN
    tutor_id_str := path_parts[2];
    BEGIN
      RETURN tutor_id_str::int;
    EXCEPTION WHEN OTHERS THEN
      RETURN NULL;
    END;
  END IF;
  
  RETURN NULL;
END;
$$;
```

### 2. Habilitar RLS via Dashboard

1. Acesse **Storage** no menu lateral
2. Clique em qualquer bucket (ex: `pets`)
3. Vá na aba **"Policies"**
4. O RLS já deve estar habilitado automaticamente

### 3. Criar Políticas via Dashboard (Método Manual)

Para cada bucket, você precisa criar 4 políticas (SELECT, INSERT, UPDATE, DELETE):

#### Exemplo: Bucket `pets` (PRIVADO)

**Política 1: SELECT**
1. Clique no bucket `pets`
2. Aba **"Policies"** → **"New Policy"**
3. Selecione **"For full customization"**
4. Nome: `pets_select_tutors_and_admins`
5. Allowed operation: **SELECT**
6. Target roles: **authenticated**
7. USING expression:
```sql
bucket_id = 'pets' 
AND (
  public.is_admin(auth.uid())
  OR
  public.is_tutor_of_pet(
    auth.uid(),
    public.extract_pet_id_from_path(name)
  )
)
```
8. Clique em **"Review"** e **"Save policy"**

**Política 2: INSERT**
- Nome: `pets_insert_admins_only`
- Allowed operation: **INSERT**
- Target roles: **authenticated**
- WITH CHECK expression:
```sql
bucket_id = 'pets' 
AND public.is_admin(auth.uid())
```

**Política 3: UPDATE**
- Nome: `pets_update_admins_only`
- Allowed operation: **UPDATE**
- Target roles: **authenticated**
- USING expression:
```sql
bucket_id = 'pets' 
AND public.is_admin(auth.uid())
```

**Política 4: DELETE**
- Nome: `pets_delete_admins_only`
- Allowed operation: **DELETE**
- Target roles: **authenticated**
- USING expression:
```sql
bucket_id = 'pets' 
AND public.is_admin(auth.uid())
```

---

## 🚀 SOLUÇÃO MAIS RÁPIDA: Usar Supabase CLI

Se você tem o Supabase CLI instalado, pode executar o script completo:

```bash
# 1. Fazer login
supabase login

# 2. Linkar projeto
supabase link --project-ref seu-project-ref

# 3. Executar script
supabase db execute -f SQL_RLS_FINAL_COMPLETO.sql
```

---

## 📝 ARQUIVO COM TODAS AS POLÍTICAS

Criei um arquivo `POLITICAS_RLS_POR_BUCKET.md` com todas as políticas organizadas por bucket para facilitar a criação manual via Dashboard.

---

## ⚡ RECOMENDAÇÃO

**Use o Supabase CLI** se possível - é a forma mais rápida e confiável. Se não tiver o CLI instalado, use o método manual via Dashboard (mais trabalhoso, mas funciona).






