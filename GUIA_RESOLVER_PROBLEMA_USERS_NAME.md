# 🔧 Guia: Resolver Problema com `users.name` nas Políticas

## 🎯 Objetivo
Corrigir as políticas de `staff` e `tutors` que ainda referenciam `users.name` incorretamente.

---

## 📋 Passo 1: Verificar a Função (CRÍTICO)

**Ação:** Execute a **Opção B** primeiro - inspecionar a função `extract_tutor_id_from_path`.

### 1.1 Buscar definição da função

Use o arquivo `RESPOSTA_VERIFICAR_FUNCAO.txt` para responder ao agente do Supabase, ou execute diretamente:

```sql
SELECT 
  proname as function_name,
  pg_get_functiondef(oid) as function_definition
FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace 
  AND proname = 'extract_tutor_id_from_path';
```

### 1.2 Verificar se a função está correta

A função deve:
- ✅ Receber `file_path text` como parâmetro
- ✅ Extrair o tutor ID do **caminho do arquivo** (usando `string_to_array(file_path, '/')`)
- ❌ **NÃO deve** referenciar `users.name` ou qualquer tabela `users`

**Exemplo de função CORRETA:**
```sql
CREATE OR REPLACE FUNCTION public.extract_tutor_id_from_path(
  file_path text  -- ✅ Recebe o caminho do arquivo
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
  
  path_parts := string_to_array(file_path, '/');  -- ✅ Divide o caminho
  
  IF array_length(path_parts, 1) >= 2 THEN
    tutor_id_str := path_parts[2];  -- ✅ Extrai o segundo elemento (tutorId)
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

**Exemplo de função INCORRETA (se encontrar algo assim):**
```sql
-- ❌ ERRADO: Referencia users.name
CREATE OR REPLACE FUNCTION public.extract_tutor_id_from_path(
  user_name text  -- ❌ Recebe nome do usuário
) RETURNS int
AS $$
  SELECT id FROM users WHERE name = user_name;  -- ❌ Busca na tabela users
$$;
```

---

## 🔧 Passo 2: Corrigir a Função (se necessário)

**Se a função estiver incorreta:**

1. Execute o script `SQL_RECRIAR_FUNCAO_CORRETA.sql` no SQL Editor
2. O script irá:
   - Remover a função incorreta
   - Criar a função correta
   - Testar a função com exemplos
   - Validar a definição

---

## 🔄 Passo 3: Forçar Recriação das Políticas

**Após verificar/corrigir a função:**

1. Execute o script `SQL_FORCAR_RECRIAR_POLITICAS.sql` no SQL Editor
2. O script irá:
   - Remover TODAS as políticas de `staff` e `tutors`
   - Recriar com a lógica correta
   - Validar que não há mais referências a `users.name`
   - Mostrar a definição completa usando `pg_get_policydef`

---

## ✅ Passo 4: Validação Final

### 4.1 Verificar se não há mais referências a `users.name`

```sql
SELECT 
  policyname,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND (
    qual LIKE '%users.name%' 
    OR with_check LIKE '%users.name%'
  );
```

**Resultado esperado:** 0 linhas

### 4.2 Verificar definição completa das políticas

```sql
SELECT 
  p.policyname,
  p.cmd as operation,
  pg_get_policydef(p.oid) as full_policy_definition
FROM pg_policies p
JOIN pg_policy pol ON pol.polname = p.policyname
WHERE p.schemaname = 'storage' 
  AND p.tablename = 'objects'
  AND p.policyname IN (
    'staff_policy_select',
    'staff_policy_insert',
    'staff_policy_update',
    'staff_policy_delete',
    'tutors_policy_select',
    'tutors_policy_insert',
    'tutors_policy_update',
    'tutors_policy_delete'
  )
ORDER BY p.policyname;
```

**Verificar que:**
- ✅ Todas as políticas usam `extract_tutor_id_from_path(name)` (não `users.name`)
- ✅ A expressão `name` se refere ao caminho do arquivo em `storage.objects`

---

## 🐛 Troubleshooting

### Problema: "Ainda mostra `users.name` após recriar"

**Possíveis causas:**
1. **Cache do PostgreSQL:** Aguardar alguns segundos e executar a query novamente
2. **Políticas duplicadas:** Verificar se há políticas com nomes similares (case-sensitive)
3. **Função incorreta:** A função ainda está incorreta - verificar novamente

**Solução:**
```sql
-- Listar TODAS as políticas (incluindo duplicatas)
SELECT 
  policyname,
  schemaname,
  tablename,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects'
  AND (
    policyname LIKE '%staff%' 
    OR policyname LIKE '%tutors%'
  )
ORDER BY policyname;
```

### Problema: "Erro ao recriar políticas"

**Possíveis causas:**
1. **Permissões insuficientes:** Executar no SQL Editor (que tem permissões elevadas)
2. **Políticas em uso:** Tentar novamente após alguns segundos

**Solução:**
- Executar no **SQL Editor** do Supabase Dashboard (não na interface de Policies)
- Se persistir, tentar remover uma política por vez

---

## 📝 Checklist Final

- [ ] Função `extract_tutor_id_from_path` verificada
- [ ] Função corrigida (se necessário)
- [ ] Políticas de `staff` recriadas
- [ ] Políticas de `tutors` recriadas
- [ ] Validação executada (0 referências a `users.name`)
- [ ] Definições completas verificadas

---

## 🎯 Resultado Esperado

Após seguir todos os passos:

1. ✅ Função `extract_tutor_id_from_path` recebe `file_path text` e extrai do caminho
2. ✅ Políticas de `staff` usam `extract_tutor_id_from_path(name)` (não `users.name`)
3. ✅ Políticas de `tutors` usam `extract_tutor_id_from_path(name)` (não `users.name`)
4. ✅ Nenhuma política referencia `users.name`
5. ✅ Tutores conseguem acessar seus próprios arquivos

---

## 📞 Próximos Passos

Após resolver o problema:

1. **Testar funcionalidade:**
   - Criar tutor de teste
   - Fazer upload para `tutors/{tutorId}/arquivo.pdf`
   - Verificar se o tutor consegue acessar

2. **Monitorar logs:**
   - Verificar se há erros relacionados a `extract_tutor_id_from_path`
   - Verificar se tutores conseguem acessar arquivos

3. **Documentar estrutura:**
   - Garantir que o código cria arquivos como `tutors/{tutorId}/arquivo.ext`

---

**🚀 Boa sorte! Se precisar de ajuda, me informe o resultado de cada passo.**






## 🎯 Objetivo
Corrigir as políticas de `staff` e `tutors` que ainda referenciam `users.name` incorretamente.

---

## 📋 Passo 1: Verificar a Função (CRÍTICO)

**Ação:** Execute a **Opção B** primeiro - inspecionar a função `extract_tutor_id_from_path`.

### 1.1 Buscar definição da função

Use o arquivo `RESPOSTA_VERIFICAR_FUNCAO.txt` para responder ao agente do Supabase, ou execute diretamente:

```sql
SELECT 
  proname as function_name,
  pg_get_functiondef(oid) as function_definition
FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace 
  AND proname = 'extract_tutor_id_from_path';
```

### 1.2 Verificar se a função está correta

A função deve:
- ✅ Receber `file_path text` como parâmetro
- ✅ Extrair o tutor ID do **caminho do arquivo** (usando `string_to_array(file_path, '/')`)
- ❌ **NÃO deve** referenciar `users.name` ou qualquer tabela `users`

**Exemplo de função CORRETA:**
```sql
CREATE OR REPLACE FUNCTION public.extract_tutor_id_from_path(
  file_path text  -- ✅ Recebe o caminho do arquivo
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
  
  path_parts := string_to_array(file_path, '/');  -- ✅ Divide o caminho
  
  IF array_length(path_parts, 1) >= 2 THEN
    tutor_id_str := path_parts[2];  -- ✅ Extrai o segundo elemento (tutorId)
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

**Exemplo de função INCORRETA (se encontrar algo assim):**
```sql
-- ❌ ERRADO: Referencia users.name
CREATE OR REPLACE FUNCTION public.extract_tutor_id_from_path(
  user_name text  -- ❌ Recebe nome do usuário
) RETURNS int
AS $$
  SELECT id FROM users WHERE name = user_name;  -- ❌ Busca na tabela users
$$;
```

---

## 🔧 Passo 2: Corrigir a Função (se necessário)

**Se a função estiver incorreta:**

1. Execute o script `SQL_RECRIAR_FUNCAO_CORRETA.sql` no SQL Editor
2. O script irá:
   - Remover a função incorreta
   - Criar a função correta
   - Testar a função com exemplos
   - Validar a definição

---

## 🔄 Passo 3: Forçar Recriação das Políticas

**Após verificar/corrigir a função:**

1. Execute o script `SQL_FORCAR_RECRIAR_POLITICAS.sql` no SQL Editor
2. O script irá:
   - Remover TODAS as políticas de `staff` e `tutors`
   - Recriar com a lógica correta
   - Validar que não há mais referências a `users.name`
   - Mostrar a definição completa usando `pg_get_policydef`

---

## ✅ Passo 4: Validação Final

### 4.1 Verificar se não há mais referências a `users.name`

```sql
SELECT 
  policyname,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND (
    qual LIKE '%users.name%' 
    OR with_check LIKE '%users.name%'
  );
```

**Resultado esperado:** 0 linhas

### 4.2 Verificar definição completa das políticas

```sql
SELECT 
  p.policyname,
  p.cmd as operation,
  pg_get_policydef(p.oid) as full_policy_definition
FROM pg_policies p
JOIN pg_policy pol ON pol.polname = p.policyname
WHERE p.schemaname = 'storage' 
  AND p.tablename = 'objects'
  AND p.policyname IN (
    'staff_policy_select',
    'staff_policy_insert',
    'staff_policy_update',
    'staff_policy_delete',
    'tutors_policy_select',
    'tutors_policy_insert',
    'tutors_policy_update',
    'tutors_policy_delete'
  )
ORDER BY p.policyname;
```

**Verificar que:**
- ✅ Todas as políticas usam `extract_tutor_id_from_path(name)` (não `users.name`)
- ✅ A expressão `name` se refere ao caminho do arquivo em `storage.objects`

---

## 🐛 Troubleshooting

### Problema: "Ainda mostra `users.name` após recriar"

**Possíveis causas:**
1. **Cache do PostgreSQL:** Aguardar alguns segundos e executar a query novamente
2. **Políticas duplicadas:** Verificar se há políticas com nomes similares (case-sensitive)
3. **Função incorreta:** A função ainda está incorreta - verificar novamente

**Solução:**
```sql
-- Listar TODAS as políticas (incluindo duplicatas)
SELECT 
  policyname,
  schemaname,
  tablename,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects'
  AND (
    policyname LIKE '%staff%' 
    OR policyname LIKE '%tutors%'
  )
ORDER BY policyname;
```

### Problema: "Erro ao recriar políticas"

**Possíveis causas:**
1. **Permissões insuficientes:** Executar no SQL Editor (que tem permissões elevadas)
2. **Políticas em uso:** Tentar novamente após alguns segundos

**Solução:**
- Executar no **SQL Editor** do Supabase Dashboard (não na interface de Policies)
- Se persistir, tentar remover uma política por vez

---

## 📝 Checklist Final

- [ ] Função `extract_tutor_id_from_path` verificada
- [ ] Função corrigida (se necessário)
- [ ] Políticas de `staff` recriadas
- [ ] Políticas de `tutors` recriadas
- [ ] Validação executada (0 referências a `users.name`)
- [ ] Definições completas verificadas

---

## 🎯 Resultado Esperado

Após seguir todos os passos:

1. ✅ Função `extract_tutor_id_from_path` recebe `file_path text` e extrai do caminho
2. ✅ Políticas de `staff` usam `extract_tutor_id_from_path(name)` (não `users.name`)
3. ✅ Políticas de `tutors` usam `extract_tutor_id_from_path(name)` (não `users.name`)
4. ✅ Nenhuma política referencia `users.name`
5. ✅ Tutores conseguem acessar seus próprios arquivos

---

## 📞 Próximos Passos

Após resolver o problema:

1. **Testar funcionalidade:**
   - Criar tutor de teste
   - Fazer upload para `tutors/{tutorId}/arquivo.pdf`
   - Verificar se o tutor consegue acessar

2. **Monitorar logs:**
   - Verificar se há erros relacionados a `extract_tutor_id_from_path`
   - Verificar se tutores conseguem acessar arquivos

3. **Documentar estrutura:**
   - Garantir que o código cria arquivos como `tutors/{tutorId}/arquivo.ext`

---

**🚀 Boa sorte! Se precisar de ajuda, me informe o resultado de cada passo.**






