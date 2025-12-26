# 🔒 REVISÃO DE PRIVACIDADE E POLÍTICAS RLS DOS BUCKETS

## ✅ CORREÇÃO: Apenas o MURAL deve ser público

Você está **100% correto**! A maioria dos buckets deve ser **PRIVADA** para garantir comunicação individualizada entre creche e tutores de cada pet.

---

## 📋 REVISÃO COMPLETA DE PRIVACIDADE

### 🟢 BUCKETS PÚBLICOS (apenas 3)

| Bucket | Motivo | Acesso |
|--------|--------|--------|
| **wall** | Mural social/compartilhado | Todos os usuários autenticados |
| **partnerships** | Marketing/parcerias | Público geral |
| **marketing** | Marketing institucional | Público geral |

### 🔴 BUCKETS PRIVADOS (9 buckets)

| Bucket | Acesso Permitido | Motivo |
|--------|------------------|--------|
| **pets** | Tutores do pet específico + Admins | Fotos privadas de cada pet |
| **tutors** | Próprio tutor + Admins | Fotos de perfil privadas |
| **daycare-photos** | Tutores do pet específico + Admins | Comunicação privada creche ↔ tutor |
| **documents** | Tutores do pet específico + Admins | Documentos veterinários privados |
| **financial** | Tutores do pet específico + Admins | Comprovantes financeiros privados |
| **staff** | Próprio colaborador + Admins | Documentos trabalhistas privados |
| **reports** | Tutores do pet específico + Admins | Relatórios privados |
| **products** | Tutores do pet específico + Admins | Documentos de produtos privados |
| **health-logs** | Tutores do pet específico + Admins | Registros de saúde privados |

---

## 🔐 COMO GARANTIR INDIVIDUALIZAÇÃO POR PET

### Estrutura de Relacionamento no Banco:

```sql
-- Tabela de relacionamento N:N entre pets e tutores
pet_tutors (
  id,
  petId,      -- ID do pet
  tutorId,    -- ID do tutor (users.id)
  isPrimary   -- Tutor principal?
)
```

### Estratégia de Nomenclatura de Arquivos:

Para garantir que as políticas RLS funcionem, os arquivos devem seguir este padrão:

```
pets/{petId}/profile.jpg
pets/{petId}/photos/{photoId}.jpg

daycare-photos/{petId}/{date}/foto-{id}.jpg

documents/{petId}/vacina-{id}.pdf
documents/{petId}/exame-{id}.pdf

financial/{petId}/{year}/{month}/comprovante-{id}.pdf

reports/{petId}/{year}-{month}/relatorio-{id}.pdf

products/{petId}/certificado-{id}.pdf

health-logs/{petId}/{date}/foto-fezes-{id}.jpg

tutors/{tutorId}/profile.jpg

staff/{staffId}/documento.pdf
```

**Importante**: O `petId` deve estar no caminho do arquivo para que as políticas RLS possam extraí-lo e verificar se o usuário é tutor daquele pet.

---

## 🛡️ POLÍTICAS RLS COMPLETAS

### Função Helper para Verificar Tutor do Pet

```sql
-- Função auxiliar: verifica se o usuário é tutor de um pet específico
CREATE OR REPLACE FUNCTION public.is_tutor_of_pet(
  user_auth_id uuid,
  pet_id_param int
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users u
    JOIN public.pet_tutors pt ON pt.tutor_id = u.id
    WHERE u.auth_id = user_auth_id
      AND pt.pet_id = pet_id_param
  );
END;
$$;

-- Revogar acesso público
REVOKE EXECUTE ON FUNCTION public.is_tutor_of_pet(uuid, int) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_tutor_of_pet(uuid, int) TO service_role;
```

### Função Helper para Extrair PetId do Caminho

```sql
-- Função auxiliar: extrai petId do caminho do arquivo
-- Exemplo: "pets/123/profile.jpg" -> 123
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
  -- Divide o caminho por "/"
  path_parts := string_to_array(file_path, '/');
  
  -- Se o caminho tem pelo menos 2 partes e a primeira é o bucket
  -- e a segunda é o petId, retorna o petId
  IF array_length(path_parts, 1) >= 2 THEN
    pet_id_str := path_parts[2];
    -- Tenta converter para int
    BEGIN
      RETURN pet_id_str::int;
    EXCEPTION WHEN OTHERS THEN
      RETURN NULL;
    END;
  END IF;
  
  RETURN NULL;
END;
$$;
```

---

## 📦 POLÍTICAS RLS POR BUCKET

### 1. **pets** (PRIVADO)

```sql
-- SELECT: Tutores do pet + Admins
CREATE POLICY "pets_select_tutors_and_admins"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'pets' AND (
    -- Admin pode ver tudo
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
    OR
    -- Tutor do pet específico pode ver
    public.is_tutor_of_pet(
      auth.uid(),
      public.extract_pet_id_from_path(name)
    )
  )
);

-- INSERT: Admins apenas
CREATE POLICY "pets_insert_admins_only"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'pets' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_id = auth.uid() AND role = 'admin'
  )
);

-- UPDATE: Admins apenas
CREATE POLICY "pets_update_admins_only"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'pets' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_id = auth.uid() AND role = 'admin'
  )
);

-- DELETE: Admins apenas
CREATE POLICY "pets_delete_admins_only"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'pets' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_id = auth.uid() AND role = 'admin'
  )
);
```

### 2. **daycare-photos** (PRIVADO)

```sql
-- SELECT: Tutores do pet + Admins
CREATE POLICY "daycare_photos_select_tutors_and_admins"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'daycare-photos' AND (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
    OR
    public.is_tutor_of_pet(
      auth.uid(),
      public.extract_pet_id_from_path(name)
    )
  )
);

-- INSERT: Admins apenas
CREATE POLICY "daycare_photos_insert_admins_only"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'daycare-photos' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_id = auth.uid() AND role = 'admin'
  )
);

-- UPDATE/DELETE: Admins apenas (similar aos anteriores)
```

### 3. **documents** (PRIVADO)

```sql
-- SELECT: Tutores do pet + Admins
CREATE POLICY "documents_select_tutors_and_admins"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
    OR
    public.is_tutor_of_pet(
      auth.uid(),
      public.extract_pet_id_from_path(name)
    )
  )
);

-- INSERT: Tutores do pet + Admins
CREATE POLICY "documents_insert_tutors_and_admins"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
    OR
    public.is_tutor_of_pet(
      auth.uid(),
      public.extract_pet_id_from_path(name)
    )
  )
);
```

### 4. **financial** (PRIVADO)

```sql
-- SELECT: Tutores do pet + Admins
CREATE POLICY "financial_select_tutors_and_admins"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'financial' AND (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
    OR
    public.is_tutor_of_pet(
      auth.uid(),
      public.extract_pet_id_from_path(name)
    )
  )
);

-- INSERT/UPDATE/DELETE: Admins apenas
```

### 5. **reports** (PRIVADO)

```sql
-- SELECT: Tutores do pet + Admins
CREATE POLICY "reports_select_tutors_and_admins"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'reports' AND (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
    OR
    public.is_tutor_of_pet(
      auth.uid(),
      public.extract_pet_id_from_path(name)
    )
  )
);

-- INSERT: Admins apenas (geração de relatórios)
```

### 6. **products** (PRIVADO)

```sql
-- SELECT: Tutores do pet + Admins
CREATE POLICY "products_select_tutors_and_admins"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'products' AND (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
    OR
    public.is_tutor_of_pet(
      auth.uid(),
      public.extract_pet_id_from_path(name)
    )
  )
);

-- INSERT: Tutores do pet + Admins
```

### 7. **health-logs** (PRIVADO)

```sql
-- SELECT: Tutores do pet + Admins
CREATE POLICY "health_logs_select_tutors_and_admins"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'health-logs' AND (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
    OR
    public.is_tutor_of_pet(
      auth.uid(),
      public.extract_pet_id_from_path(name)
    )
  )
);

-- INSERT: Tutores do pet + Admins
```

### 8. **tutors** (PRIVADO)

```sql
-- SELECT: Próprio tutor + Admins
CREATE POLICY "tutors_select_own_and_admins"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'tutors' AND (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
    OR
    -- Extrai tutorId do caminho: "tutors/{tutorId}/profile.jpg"
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid()
        AND id::text = (string_to_array(name, '/'))[2]
    )
  )
);

-- INSERT: Próprio tutor + Admins
CREATE POLICY "tutors_insert_own_and_admins"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'tutors' AND (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid()
        AND id::text = (string_to_array(name, '/'))[2]
    )
  )
);
```

### 9. **staff** (PRIVADO)

```sql
-- SELECT: Próprio colaborador + Admins
CREATE POLICY "staff_select_own_and_admins"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'staff' AND (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid()
        AND id::text = (string_to_array(name, '/'))[2]
    )
  )
);

-- INSERT/UPDATE/DELETE: Admins apenas
```

### 10. **wall** (PÚBLICO - para usuários autenticados)

```sql
-- SELECT: Todos os usuários autenticados
CREATE POLICY "wall_select_authenticated"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'wall');

-- INSERT: Admins e tutores (para posts)
CREATE POLICY "wall_insert_authenticated"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'wall');

-- UPDATE/DELETE: Apenas quem criou o post (via metadados) + Admins
-- (Implementar lógica de ownership via metadados do arquivo)
```

### 11. **partnerships** (PÚBLICO)

```sql
-- SELECT: Público (qualquer um)
CREATE POLICY "partnerships_select_public"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'partnerships');

-- INSERT/UPDATE/DELETE: Admins apenas
```

### 12. **marketing** (PÚBLICO)

```sql
-- SELECT: Público (qualquer um)
CREATE POLICY "marketing_select_public"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'marketing');

-- INSERT/UPDATE/DELETE: Admins apenas
```

---

## ⚠️ IMPORTANTE: ADAPTAÇÕES NECESSÁRIAS

### 1. Nomes de Colunas no PostgreSQL

O schema atual usa `camelCase` (ex: `petId`, `tutorId`), mas o PostgreSQL pode ter criado as colunas em `snake_case` (ex: `pet_id`, `tutor_id`).

**Verifique no Supabase**:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'pet_tutors';
```

**Ajuste as funções conforme necessário**:
- Se for `pet_id` → use `pt.pet_id`
- Se for `petId` → use `pt."petId"` (com aspas)

### 2. Tipo de auth_id

Se `users.auth_id` for `uuid` (como configurado), use:
```sql
WHERE u.auth_id = auth.uid()
```

Se for `text`, use:
```sql
WHERE u.auth_id = auth.uid()::text
```

---

## 🧪 TESTE DAS POLÍTICAS

### Script de Teste:

```sql
-- 1. Criar usuário de teste (tutor)
-- 2. Criar pet de teste
-- 3. Vincular tutor ao pet
-- 4. Tentar acessar arquivo do pet (deve funcionar)
-- 5. Tentar acessar arquivo de outro pet (deve falhar)
-- 6. Verificar que admin pode acessar tudo
```

---

## 📝 CHECKLIST FINAL

- [ ] Criar buckets com configuração correta (público/privado)
- [ ] Criar função `is_tutor_of_pet()`
- [ ] Criar função `extract_pet_id_from_path()`
- [ ] Aplicar políticas RLS em todos os buckets
- [ ] Testar acesso de tutor ao próprio pet
- [ ] Testar que tutor NÃO acessa pet de outro
- [ ] Testar que admin acessa tudo
- [ ] Verificar nomenclatura de arquivos no código

---

## 🎯 RESUMO

✅ **Apenas 3 buckets públicos**: `wall`, `partnerships`, `marketing`  
✅ **9 buckets privados**: Acesso apenas aos tutores do pet específico + admins  
✅ **Individualização garantida**: Via função `is_tutor_of_pet()` que verifica `pet_tutors`  
✅ **Estrutura de pastas**: `{bucket}/{petId}/...` para extrair petId automaticamente






## ✅ CORREÇÃO: Apenas o MURAL deve ser público

Você está **100% correto**! A maioria dos buckets deve ser **PRIVADA** para garantir comunicação individualizada entre creche e tutores de cada pet.

---

## 📋 REVISÃO COMPLETA DE PRIVACIDADE

### 🟢 BUCKETS PÚBLICOS (apenas 3)

| Bucket | Motivo | Acesso |
|--------|--------|--------|
| **wall** | Mural social/compartilhado | Todos os usuários autenticados |
| **partnerships** | Marketing/parcerias | Público geral |
| **marketing** | Marketing institucional | Público geral |

### 🔴 BUCKETS PRIVADOS (9 buckets)

| Bucket | Acesso Permitido | Motivo |
|--------|------------------|--------|
| **pets** | Tutores do pet específico + Admins | Fotos privadas de cada pet |
| **tutors** | Próprio tutor + Admins | Fotos de perfil privadas |
| **daycare-photos** | Tutores do pet específico + Admins | Comunicação privada creche ↔ tutor |
| **documents** | Tutores do pet específico + Admins | Documentos veterinários privados |
| **financial** | Tutores do pet específico + Admins | Comprovantes financeiros privados |
| **staff** | Próprio colaborador + Admins | Documentos trabalhistas privados |
| **reports** | Tutores do pet específico + Admins | Relatórios privados |
| **products** | Tutores do pet específico + Admins | Documentos de produtos privados |
| **health-logs** | Tutores do pet específico + Admins | Registros de saúde privados |

---

## 🔐 COMO GARANTIR INDIVIDUALIZAÇÃO POR PET

### Estrutura de Relacionamento no Banco:

```sql
-- Tabela de relacionamento N:N entre pets e tutores
pet_tutors (
  id,
  petId,      -- ID do pet
  tutorId,    -- ID do tutor (users.id)
  isPrimary   -- Tutor principal?
)
```

### Estratégia de Nomenclatura de Arquivos:

Para garantir que as políticas RLS funcionem, os arquivos devem seguir este padrão:

```
pets/{petId}/profile.jpg
pets/{petId}/photos/{photoId}.jpg

daycare-photos/{petId}/{date}/foto-{id}.jpg

documents/{petId}/vacina-{id}.pdf
documents/{petId}/exame-{id}.pdf

financial/{petId}/{year}/{month}/comprovante-{id}.pdf

reports/{petId}/{year}-{month}/relatorio-{id}.pdf

products/{petId}/certificado-{id}.pdf

health-logs/{petId}/{date}/foto-fezes-{id}.jpg

tutors/{tutorId}/profile.jpg

staff/{staffId}/documento.pdf
```

**Importante**: O `petId` deve estar no caminho do arquivo para que as políticas RLS possam extraí-lo e verificar se o usuário é tutor daquele pet.

---

## 🛡️ POLÍTICAS RLS COMPLETAS

### Função Helper para Verificar Tutor do Pet

```sql
-- Função auxiliar: verifica se o usuário é tutor de um pet específico
CREATE OR REPLACE FUNCTION public.is_tutor_of_pet(
  user_auth_id uuid,
  pet_id_param int
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users u
    JOIN public.pet_tutors pt ON pt.tutor_id = u.id
    WHERE u.auth_id = user_auth_id
      AND pt.pet_id = pet_id_param
  );
END;
$$;

-- Revogar acesso público
REVOKE EXECUTE ON FUNCTION public.is_tutor_of_pet(uuid, int) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_tutor_of_pet(uuid, int) TO service_role;
```

### Função Helper para Extrair PetId do Caminho

```sql
-- Função auxiliar: extrai petId do caminho do arquivo
-- Exemplo: "pets/123/profile.jpg" -> 123
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
  -- Divide o caminho por "/"
  path_parts := string_to_array(file_path, '/');
  
  -- Se o caminho tem pelo menos 2 partes e a primeira é o bucket
  -- e a segunda é o petId, retorna o petId
  IF array_length(path_parts, 1) >= 2 THEN
    pet_id_str := path_parts[2];
    -- Tenta converter para int
    BEGIN
      RETURN pet_id_str::int;
    EXCEPTION WHEN OTHERS THEN
      RETURN NULL;
    END;
  END IF;
  
  RETURN NULL;
END;
$$;
```

---

## 📦 POLÍTICAS RLS POR BUCKET

### 1. **pets** (PRIVADO)

```sql
-- SELECT: Tutores do pet + Admins
CREATE POLICY "pets_select_tutors_and_admins"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'pets' AND (
    -- Admin pode ver tudo
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
    OR
    -- Tutor do pet específico pode ver
    public.is_tutor_of_pet(
      auth.uid(),
      public.extract_pet_id_from_path(name)
    )
  )
);

-- INSERT: Admins apenas
CREATE POLICY "pets_insert_admins_only"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'pets' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_id = auth.uid() AND role = 'admin'
  )
);

-- UPDATE: Admins apenas
CREATE POLICY "pets_update_admins_only"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'pets' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_id = auth.uid() AND role = 'admin'
  )
);

-- DELETE: Admins apenas
CREATE POLICY "pets_delete_admins_only"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'pets' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_id = auth.uid() AND role = 'admin'
  )
);
```

### 2. **daycare-photos** (PRIVADO)

```sql
-- SELECT: Tutores do pet + Admins
CREATE POLICY "daycare_photos_select_tutors_and_admins"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'daycare-photos' AND (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
    OR
    public.is_tutor_of_pet(
      auth.uid(),
      public.extract_pet_id_from_path(name)
    )
  )
);

-- INSERT: Admins apenas
CREATE POLICY "daycare_photos_insert_admins_only"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'daycare-photos' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_id = auth.uid() AND role = 'admin'
  )
);

-- UPDATE/DELETE: Admins apenas (similar aos anteriores)
```

### 3. **documents** (PRIVADO)

```sql
-- SELECT: Tutores do pet + Admins
CREATE POLICY "documents_select_tutors_and_admins"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
    OR
    public.is_tutor_of_pet(
      auth.uid(),
      public.extract_pet_id_from_path(name)
    )
  )
);

-- INSERT: Tutores do pet + Admins
CREATE POLICY "documents_insert_tutors_and_admins"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
    OR
    public.is_tutor_of_pet(
      auth.uid(),
      public.extract_pet_id_from_path(name)
    )
  )
);
```

### 4. **financial** (PRIVADO)

```sql
-- SELECT: Tutores do pet + Admins
CREATE POLICY "financial_select_tutors_and_admins"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'financial' AND (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
    OR
    public.is_tutor_of_pet(
      auth.uid(),
      public.extract_pet_id_from_path(name)
    )
  )
);

-- INSERT/UPDATE/DELETE: Admins apenas
```

### 5. **reports** (PRIVADO)

```sql
-- SELECT: Tutores do pet + Admins
CREATE POLICY "reports_select_tutors_and_admins"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'reports' AND (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
    OR
    public.is_tutor_of_pet(
      auth.uid(),
      public.extract_pet_id_from_path(name)
    )
  )
);

-- INSERT: Admins apenas (geração de relatórios)
```

### 6. **products** (PRIVADO)

```sql
-- SELECT: Tutores do pet + Admins
CREATE POLICY "products_select_tutors_and_admins"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'products' AND (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
    OR
    public.is_tutor_of_pet(
      auth.uid(),
      public.extract_pet_id_from_path(name)
    )
  )
);

-- INSERT: Tutores do pet + Admins
```

### 7. **health-logs** (PRIVADO)

```sql
-- SELECT: Tutores do pet + Admins
CREATE POLICY "health_logs_select_tutors_and_admins"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'health-logs' AND (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
    OR
    public.is_tutor_of_pet(
      auth.uid(),
      public.extract_pet_id_from_path(name)
    )
  )
);

-- INSERT: Tutores do pet + Admins
```

### 8. **tutors** (PRIVADO)

```sql
-- SELECT: Próprio tutor + Admins
CREATE POLICY "tutors_select_own_and_admins"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'tutors' AND (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
    OR
    -- Extrai tutorId do caminho: "tutors/{tutorId}/profile.jpg"
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid()
        AND id::text = (string_to_array(name, '/'))[2]
    )
  )
);

-- INSERT: Próprio tutor + Admins
CREATE POLICY "tutors_insert_own_and_admins"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'tutors' AND (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid()
        AND id::text = (string_to_array(name, '/'))[2]
    )
  )
);
```

### 9. **staff** (PRIVADO)

```sql
-- SELECT: Próprio colaborador + Admins
CREATE POLICY "staff_select_own_and_admins"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'staff' AND (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid()
        AND id::text = (string_to_array(name, '/'))[2]
    )
  )
);

-- INSERT/UPDATE/DELETE: Admins apenas
```

### 10. **wall** (PÚBLICO - para usuários autenticados)

```sql
-- SELECT: Todos os usuários autenticados
CREATE POLICY "wall_select_authenticated"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'wall');

-- INSERT: Admins e tutores (para posts)
CREATE POLICY "wall_insert_authenticated"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'wall');

-- UPDATE/DELETE: Apenas quem criou o post (via metadados) + Admins
-- (Implementar lógica de ownership via metadados do arquivo)
```

### 11. **partnerships** (PÚBLICO)

```sql
-- SELECT: Público (qualquer um)
CREATE POLICY "partnerships_select_public"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'partnerships');

-- INSERT/UPDATE/DELETE: Admins apenas
```

### 12. **marketing** (PÚBLICO)

```sql
-- SELECT: Público (qualquer um)
CREATE POLICY "marketing_select_public"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'marketing');

-- INSERT/UPDATE/DELETE: Admins apenas
```

---

## ⚠️ IMPORTANTE: ADAPTAÇÕES NECESSÁRIAS

### 1. Nomes de Colunas no PostgreSQL

O schema atual usa `camelCase` (ex: `petId`, `tutorId`), mas o PostgreSQL pode ter criado as colunas em `snake_case` (ex: `pet_id`, `tutor_id`).

**Verifique no Supabase**:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'pet_tutors';
```

**Ajuste as funções conforme necessário**:
- Se for `pet_id` → use `pt.pet_id`
- Se for `petId` → use `pt."petId"` (com aspas)

### 2. Tipo de auth_id

Se `users.auth_id` for `uuid` (como configurado), use:
```sql
WHERE u.auth_id = auth.uid()
```

Se for `text`, use:
```sql
WHERE u.auth_id = auth.uid()::text
```

---

## 🧪 TESTE DAS POLÍTICAS

### Script de Teste:

```sql
-- 1. Criar usuário de teste (tutor)
-- 2. Criar pet de teste
-- 3. Vincular tutor ao pet
-- 4. Tentar acessar arquivo do pet (deve funcionar)
-- 5. Tentar acessar arquivo de outro pet (deve falhar)
-- 6. Verificar que admin pode acessar tudo
```

---

## 📝 CHECKLIST FINAL

- [ ] Criar buckets com configuração correta (público/privado)
- [ ] Criar função `is_tutor_of_pet()`
- [ ] Criar função `extract_pet_id_from_path()`
- [ ] Aplicar políticas RLS em todos os buckets
- [ ] Testar acesso de tutor ao próprio pet
- [ ] Testar que tutor NÃO acessa pet de outro
- [ ] Testar que admin acessa tudo
- [ ] Verificar nomenclatura de arquivos no código

---

## 🎯 RESUMO

✅ **Apenas 3 buckets públicos**: `wall`, `partnerships`, `marketing`  
✅ **9 buckets privados**: Acesso apenas aos tutores do pet específico + admins  
✅ **Individualização garantida**: Via função `is_tutor_of_pet()` que verifica `pet_tutors`  
✅ **Estrutura de pastas**: `{bucket}/{petId}/...` para extrair petId automaticamente






