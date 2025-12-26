# ✅ Solução Final: Qualificar Coluna Explicitamente

## 🎯 Problema Identificado

- ✅ **Causa raiz:** PostgreSQL resolve `name` como `users.name` dentro da subquery `EXISTS`
- ✅ **Por que acontece:** O PostgreSQL tenta resolver referências não qualificadas primeiro no escopo da subquery (users), e só depois no escopo externo
- ✅ **Resultado:** A função recebe `users.name` em vez de `storage.objects.name`

---

## 🔧 Solução: Qualificar Explicitamente

Qualificar explicitamente a coluna `name` da tabela `storage.objects` usando `storage.objects.name` na expressão da política.

---

## 📋 Passo 1: Tentar via Agente (Recomendado)

Use o arquivo `RESPOSTA_QUALIFICAR_COLUNA_OBJECTS.txt` para confirmar que o agente pode prosseguir.

O agente irá:
1. Executar `ALTER POLICY` novamente para cada uma das 4 políticas
2. Usar `storage.objects.name` explicitamente qualificado
3. Validar que a correção funcionou

---

## 📋 Passo 2: Executar Manualmente (Se necessário)

Se o agente não conseguir ou preferir executar manualmente:

1. **Abrir SQL Editor do Supabase Dashboard**
2. **Executar o script `SQL_ALTER_POLICY_COLUNA_QUALIFICADA.sql`**
   - Contém os 4 comandos `ALTER POLICY` com `storage.objects.name`
   - Inclui validações completas

---

## ✅ Validação Esperada

Após executar a correção:

### Query 1: Verificar expressões armazenadas
```sql
SELECT 
  p.polname as policy_name,
  pg_get_expr(p.qual, p.polrelid) as stored_using_expression,
  pg_get_expr(p.polwithcheck, p.polrelid) as stored_with_check_expression
FROM pg_policy p
JOIN pg_class c ON c.oid = p.polrelid
WHERE c.relname = 'objects'
  AND c.relnamespace = 'storage'::regnamespace
  AND p.polname IN (
    'staff_policy_select',
    'tutors_policy_select',
    'tutors_policy_insert',
    'tutors_policy_update'
  )
ORDER BY p.polname;
```

**Verificar que:**
- ✅ Todas as expressões usam `extract_tutor_id_from_path(objects.name)` ou `extract_tutor_id_from_path(storage.objects.name)`
- ❌ Nenhuma expressão contém `extract_tutor_id_from_path(users.name)`

**Nota:** O PostgreSQL pode normalizar `storage.objects.name` para `objects.name` (sem o schema), mas o importante é que NÃO seja `users.name`.

### Query 2: Verificar que não usa `users.name`
```sql
SELECT 
  p.polname as policy_name,
  pg_get_expr(p.qual, p.polrelid) as using_expr,
  pg_get_expr(p.polwithcheck, p.polrelid) as with_check_expr
FROM pg_policy p
JOIN pg_class c ON c.oid = p.polrelid
WHERE c.relname = 'objects'
  AND c.relnamespace = 'storage'::regnamespace
  AND (
    pg_get_expr(p.qual, p.polrelid) LIKE '%extract_tutor_id_from_path(users.name)%'
    OR pg_get_expr(p.polwithcheck, p.polrelid) LIKE '%extract_tutor_id_from_path(users.name)%'
  );
```

**Resultado esperado:** 0 linhas

---

## 📝 Checklist Final

- [ ] Diagnóstico executado (✅ PostgreSQL resolve `name` como `users.name`)
- [ ] ALTER POLICY executado com `storage.objects.name` (via agente ou manualmente)
- [ ] Validação executada (0 referências a `users.name`)
- [ ] Expressões verificadas (todas usam `objects.name` ou `storage.objects.name`)

---

## 🎯 Resultado Esperado

Após a correção:

1. ✅ **Todas as políticas usam `extract_tutor_id_from_path(objects.name)` ou `extract_tutor_id_from_path(storage.objects.name)`**
   - A função recebe o caminho do arquivo (`name` da tabela `storage.objects`)
   - Extrai o tutor ID do caminho (ex: `tutors/123/arquivo.pdf` → `123`)

2. ✅ **Nenhuma política referencia `users.name`**
   - A validação retorna 0 linhas

3. ✅ **Tutores conseguem acessar seus próprios arquivos**
   - Arquivos em `tutors/{tutorId}/arquivo.ext` são acessíveis pelo tutor
   - Arquivos em `staff/{tutorId}/arquivo.ext` são acessíveis pelo tutor

---

## 🔍 Explicação Técnica

### Por que o PostgreSQL resolve `name` como `users.name`?

Quando você escreve:
```sql
EXISTS (
  SELECT 1 FROM public.users 
  WHERE users.auth_id = (SELECT auth.uid())
    AND users.id = public.extract_tutor_id_from_path(name)  -- ❌ 'name' é resolvido como users.name
)
```

O PostgreSQL:
1. Procura `name` primeiro no escopo da subquery (`users`)
2. Encontra `users.name` e usa isso
3. Não verifica o escopo externo (`storage.objects`)

### Solução: Qualificar explicitamente

```sql
EXISTS (
  SELECT 1 FROM public.users 
  WHERE users.auth_id = (SELECT auth.uid())
    AND users.id = public.extract_tutor_id_from_path(storage.objects.name)  -- ✅ Qualificado explicitamente
)
```

Agora o PostgreSQL:
1. Reconhece `storage.objects.name` como uma referência qualificada
2. Usa a coluna `name` da tabela `storage.objects` (caminho do arquivo)
3. Passa o caminho correto para a função

---

## 🆘 Troubleshooting

### Problema: "Ainda mostra `users.name` após qualificar"

**Causa:** Cache do PostgreSQL ou política não foi atualizada.

**Solução:**
1. Aguardar alguns segundos
2. Executar a query de validação novamente
3. Verificar se o `ALTER POLICY` foi executado com sucesso

### Problema: "Column 'storage.objects.name' does not exist"

**Causa:** Nome do schema ou tabela incorreto.

**Solução:**
1. Verificar o schema correto: `SELECT schemaname FROM pg_tables WHERE tablename = 'objects';`
2. Usar o schema correto (geralmente `storage`)

---

## 📞 Próximos Passos

Após resolver:

1. **Testar funcionalidade:**
   - Criar tutor de teste
   - Fazer upload para `tutors/{tutorId}/arquivo.pdf`
   - Verificar se o tutor consegue acessar

2. **Monitorar logs:**
   - Verificar se há erros relacionados
   - Verificar se tutores conseguem acessar arquivos

---

**🚀 Após completar a correção, todas as políticas RLS estarão funcionando corretamente!**






## 🎯 Problema Identificado

- ✅ **Causa raiz:** PostgreSQL resolve `name` como `users.name` dentro da subquery `EXISTS`
- ✅ **Por que acontece:** O PostgreSQL tenta resolver referências não qualificadas primeiro no escopo da subquery (users), e só depois no escopo externo
- ✅ **Resultado:** A função recebe `users.name` em vez de `storage.objects.name`

---

## 🔧 Solução: Qualificar Explicitamente

Qualificar explicitamente a coluna `name` da tabela `storage.objects` usando `storage.objects.name` na expressão da política.

---

## 📋 Passo 1: Tentar via Agente (Recomendado)

Use o arquivo `RESPOSTA_QUALIFICAR_COLUNA_OBJECTS.txt` para confirmar que o agente pode prosseguir.

O agente irá:
1. Executar `ALTER POLICY` novamente para cada uma das 4 políticas
2. Usar `storage.objects.name` explicitamente qualificado
3. Validar que a correção funcionou

---

## 📋 Passo 2: Executar Manualmente (Se necessário)

Se o agente não conseguir ou preferir executar manualmente:

1. **Abrir SQL Editor do Supabase Dashboard**
2. **Executar o script `SQL_ALTER_POLICY_COLUNA_QUALIFICADA.sql`**
   - Contém os 4 comandos `ALTER POLICY` com `storage.objects.name`
   - Inclui validações completas

---

## ✅ Validação Esperada

Após executar a correção:

### Query 1: Verificar expressões armazenadas
```sql
SELECT 
  p.polname as policy_name,
  pg_get_expr(p.qual, p.polrelid) as stored_using_expression,
  pg_get_expr(p.polwithcheck, p.polrelid) as stored_with_check_expression
FROM pg_policy p
JOIN pg_class c ON c.oid = p.polrelid
WHERE c.relname = 'objects'
  AND c.relnamespace = 'storage'::regnamespace
  AND p.polname IN (
    'staff_policy_select',
    'tutors_policy_select',
    'tutors_policy_insert',
    'tutors_policy_update'
  )
ORDER BY p.polname;
```

**Verificar que:**
- ✅ Todas as expressões usam `extract_tutor_id_from_path(objects.name)` ou `extract_tutor_id_from_path(storage.objects.name)`
- ❌ Nenhuma expressão contém `extract_tutor_id_from_path(users.name)`

**Nota:** O PostgreSQL pode normalizar `storage.objects.name` para `objects.name` (sem o schema), mas o importante é que NÃO seja `users.name`.

### Query 2: Verificar que não usa `users.name`
```sql
SELECT 
  p.polname as policy_name,
  pg_get_expr(p.qual, p.polrelid) as using_expr,
  pg_get_expr(p.polwithcheck, p.polrelid) as with_check_expr
FROM pg_policy p
JOIN pg_class c ON c.oid = p.polrelid
WHERE c.relname = 'objects'
  AND c.relnamespace = 'storage'::regnamespace
  AND (
    pg_get_expr(p.qual, p.polrelid) LIKE '%extract_tutor_id_from_path(users.name)%'
    OR pg_get_expr(p.polwithcheck, p.polrelid) LIKE '%extract_tutor_id_from_path(users.name)%'
  );
```

**Resultado esperado:** 0 linhas

---

## 📝 Checklist Final

- [ ] Diagnóstico executado (✅ PostgreSQL resolve `name` como `users.name`)
- [ ] ALTER POLICY executado com `storage.objects.name` (via agente ou manualmente)
- [ ] Validação executada (0 referências a `users.name`)
- [ ] Expressões verificadas (todas usam `objects.name` ou `storage.objects.name`)

---

## 🎯 Resultado Esperado

Após a correção:

1. ✅ **Todas as políticas usam `extract_tutor_id_from_path(objects.name)` ou `extract_tutor_id_from_path(storage.objects.name)`**
   - A função recebe o caminho do arquivo (`name` da tabela `storage.objects`)
   - Extrai o tutor ID do caminho (ex: `tutors/123/arquivo.pdf` → `123`)

2. ✅ **Nenhuma política referencia `users.name`**
   - A validação retorna 0 linhas

3. ✅ **Tutores conseguem acessar seus próprios arquivos**
   - Arquivos em `tutors/{tutorId}/arquivo.ext` são acessíveis pelo tutor
   - Arquivos em `staff/{tutorId}/arquivo.ext` são acessíveis pelo tutor

---

## 🔍 Explicação Técnica

### Por que o PostgreSQL resolve `name` como `users.name`?

Quando você escreve:
```sql
EXISTS (
  SELECT 1 FROM public.users 
  WHERE users.auth_id = (SELECT auth.uid())
    AND users.id = public.extract_tutor_id_from_path(name)  -- ❌ 'name' é resolvido como users.name
)
```

O PostgreSQL:
1. Procura `name` primeiro no escopo da subquery (`users`)
2. Encontra `users.name` e usa isso
3. Não verifica o escopo externo (`storage.objects`)

### Solução: Qualificar explicitamente

```sql
EXISTS (
  SELECT 1 FROM public.users 
  WHERE users.auth_id = (SELECT auth.uid())
    AND users.id = public.extract_tutor_id_from_path(storage.objects.name)  -- ✅ Qualificado explicitamente
)
```

Agora o PostgreSQL:
1. Reconhece `storage.objects.name` como uma referência qualificada
2. Usa a coluna `name` da tabela `storage.objects` (caminho do arquivo)
3. Passa o caminho correto para a função

---

## 🆘 Troubleshooting

### Problema: "Ainda mostra `users.name` após qualificar"

**Causa:** Cache do PostgreSQL ou política não foi atualizada.

**Solução:**
1. Aguardar alguns segundos
2. Executar a query de validação novamente
3. Verificar se o `ALTER POLICY` foi executado com sucesso

### Problema: "Column 'storage.objects.name' does not exist"

**Causa:** Nome do schema ou tabela incorreto.

**Solução:**
1. Verificar o schema correto: `SELECT schemaname FROM pg_tables WHERE tablename = 'objects';`
2. Usar o schema correto (geralmente `storage`)

---

## 📞 Próximos Passos

Após resolver:

1. **Testar funcionalidade:**
   - Criar tutor de teste
   - Fazer upload para `tutors/{tutorId}/arquivo.pdf`
   - Verificar se o tutor consegue acessar

2. **Monitorar logs:**
   - Verificar se há erros relacionados
   - Verificar se tutores conseguem acessar arquivos

---

**🚀 Após completar a correção, todas as políticas RLS estarão funcionando corretamente!**






