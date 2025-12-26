# 🔧 Guia: Resolver Problema de Ownership nas Políticas

## 🎯 Problema Identificado

Mesmo após `DROP + CREATE`, as políticas ainda mostram `users.name`. Isso geralmente indica:
1. **Problema de ownership** - As políticas pertencem a outro role
2. **Políticas duplicadas** - Há múltiplas políticas com o mesmo nome
3. **Cache/Display issue** - As expressões estão corretas mas exibidas incorretamente

---

## 📋 Passo 1: Diagnóstico Completo

### 1.1 Executar Diagnóstico

Execute o script `SQL_DIAGNOSTICO_COMPLETO_POLITICAS.sql` no SQL Editor do Supabase.

Este script irá mostrar:
- **Policy Owner:** Qual role é o owner das políticas
- **Stored Expressions:** Expressões exatamente como estão armazenadas
- **Policy OIDs:** Identificadores únicos
- **Duplicatas:** Se há políticas duplicadas

### 1.2 Analisar Resultados

**Cenário A: Políticas pertencem a outro role (ex: `supabase_admin`)**
- **Solução:** Executar DROP/CREATE como o role correto
- **Ação:** Usar `SET ROLE` ou executar via Supabase Dashboard (que geralmente tem permissões elevadas)

**Cenário B: Há políticas duplicadas**
- **Solução:** Remover todas as duplicatas e recriar
- **Ação:** Usar `SQL_REMOVER_DUPLICATAS_E_RECRIAR.sql`

**Cenário C: Expressões estão corretas mas exibidas incorretamente**
- **Solução:** Usar `ALTER POLICY` para forçar atualização
- **Ação:** Usar `SQL_ALTER_POLICY_FORCAR_CORRECAO.sql`

---

## 🔧 Passo 2: Aplicar Correção Baseada no Diagnóstico

### Opção 1: Se as políticas pertencem a outro role

**Solução:** Executar como o role correto

```sql
-- Verificar role atual
SELECT current_user, session_user;

-- Se necessário, usar SET ROLE (requer permissões)
SET ROLE supabase_admin;  -- ou o role correto

-- Executar DROP + CREATE
-- ... (usar SQL_RECRIAR_4_POLITICAS_FINAIS.sql)
```

**Alternativa:** Executar via Supabase Dashboard (SQL Editor geralmente tem permissões elevadas)

### Opção 2: Se há políticas duplicadas

**Solução:** Remover todas e recriar

Execute o script `SQL_REMOVER_DUPLICATAS_E_RECRIAR.sql`:
1. Remove TODAS as políticas com os nomes especificados
2. Verifica que foram removidas
3. Recria apenas uma versão correta de cada uma
4. Valida que não há mais referências a `users.name`

### Opção 3: Se as expressões estão corretas mas exibidas incorretamente

**Solução:** Usar `ALTER POLICY` para forçar atualização

Execute o script `SQL_ALTER_POLICY_FORCAR_CORRECAO.sql`:
1. Usa `ALTER POLICY` em vez de `DROP/CREATE`
2. Força atualização das expressões armazenadas
3. Valida que a correção funcionou

---

## ✅ Passo 3: Validação Final

Após aplicar a correção, execute:

```sql
-- Verificar que não há mais referências a users.name
SELECT 
  p.polname as policy_name,
  pg_get_expr(p.qual, p.polrelid) as using_expr,
  pg_get_expr(p.polwithcheck, p.polrelid) as with_check_expr
FROM pg_policy p
JOIN pg_class c ON c.oid = p.polrelid
WHERE c.relname = 'objects'
  AND c.relnamespace = 'storage'::regnamespace
  AND (
    pg_get_expr(p.qual, p.polrelid) LIKE '%users.name%'
    OR pg_get_expr(p.polwithcheck, p.polrelid) LIKE '%users.name%'
  );
```

**Resultado esperado:** 0 linhas

---

## 🐛 Troubleshooting

### Problema: "Permission denied" ao executar DROP POLICY

**Causa:** Você não é o owner das políticas.

**Solução:**
1. Executar via Supabase Dashboard (SQL Editor tem permissões elevadas)
2. Ou usar `SET ROLE` para o role correto (se tiver permissões)

### Problema: "Policy does not exist" mas ainda aparece na query

**Causa:** Cache do PostgreSQL ou políticas em outro schema.

**Solução:**
1. Aguardar alguns segundos
2. Executar a query novamente
3. Verificar se há políticas em outros schemas

### Problema: "Multiple policies with same name"

**Causa:** Há políticas duplicadas com owners diferentes.

**Solução:**
1. Usar `SQL_REMOVER_DUPLICATAS_E_RECRIAR.sql`
2. Isso remove TODAS as versões e recria apenas uma

---

## 📝 Checklist Final

- [ ] Diagnóstico executado
- [ ] Causa identificada (ownership/duplicatas/display)
- [ ] Correção aplicada (baseada no diagnóstico)
- [ ] Validação executada (0 referências a `users.name`)
- [ ] Políticas funcionando corretamente

---

## 🎯 Resultado Esperado

Após resolver o problema:

1. ✅ **Todas as políticas usam `extract_tutor_id_from_path(name)`**
2. ✅ **Nenhuma política referencia `users.name`**
3. ✅ **Tutores conseguem acessar seus próprios arquivos**
4. ✅ **Apenas 1 política de cada tipo (sem duplicatas)**

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

**🚀 Boa sorte! Execute o diagnóstico primeiro para identificar a causa exata.**






## 🎯 Problema Identificado

Mesmo após `DROP + CREATE`, as políticas ainda mostram `users.name`. Isso geralmente indica:
1. **Problema de ownership** - As políticas pertencem a outro role
2. **Políticas duplicadas** - Há múltiplas políticas com o mesmo nome
3. **Cache/Display issue** - As expressões estão corretas mas exibidas incorretamente

---

## 📋 Passo 1: Diagnóstico Completo

### 1.1 Executar Diagnóstico

Execute o script `SQL_DIAGNOSTICO_COMPLETO_POLITICAS.sql` no SQL Editor do Supabase.

Este script irá mostrar:
- **Policy Owner:** Qual role é o owner das políticas
- **Stored Expressions:** Expressões exatamente como estão armazenadas
- **Policy OIDs:** Identificadores únicos
- **Duplicatas:** Se há políticas duplicadas

### 1.2 Analisar Resultados

**Cenário A: Políticas pertencem a outro role (ex: `supabase_admin`)**
- **Solução:** Executar DROP/CREATE como o role correto
- **Ação:** Usar `SET ROLE` ou executar via Supabase Dashboard (que geralmente tem permissões elevadas)

**Cenário B: Há políticas duplicadas**
- **Solução:** Remover todas as duplicatas e recriar
- **Ação:** Usar `SQL_REMOVER_DUPLICATAS_E_RECRIAR.sql`

**Cenário C: Expressões estão corretas mas exibidas incorretamente**
- **Solução:** Usar `ALTER POLICY` para forçar atualização
- **Ação:** Usar `SQL_ALTER_POLICY_FORCAR_CORRECAO.sql`

---

## 🔧 Passo 2: Aplicar Correção Baseada no Diagnóstico

### Opção 1: Se as políticas pertencem a outro role

**Solução:** Executar como o role correto

```sql
-- Verificar role atual
SELECT current_user, session_user;

-- Se necessário, usar SET ROLE (requer permissões)
SET ROLE supabase_admin;  -- ou o role correto

-- Executar DROP + CREATE
-- ... (usar SQL_RECRIAR_4_POLITICAS_FINAIS.sql)
```

**Alternativa:** Executar via Supabase Dashboard (SQL Editor geralmente tem permissões elevadas)

### Opção 2: Se há políticas duplicadas

**Solução:** Remover todas e recriar

Execute o script `SQL_REMOVER_DUPLICATAS_E_RECRIAR.sql`:
1. Remove TODAS as políticas com os nomes especificados
2. Verifica que foram removidas
3. Recria apenas uma versão correta de cada uma
4. Valida que não há mais referências a `users.name`

### Opção 3: Se as expressões estão corretas mas exibidas incorretamente

**Solução:** Usar `ALTER POLICY` para forçar atualização

Execute o script `SQL_ALTER_POLICY_FORCAR_CORRECAO.sql`:
1. Usa `ALTER POLICY` em vez de `DROP/CREATE`
2. Força atualização das expressões armazenadas
3. Valida que a correção funcionou

---

## ✅ Passo 3: Validação Final

Após aplicar a correção, execute:

```sql
-- Verificar que não há mais referências a users.name
SELECT 
  p.polname as policy_name,
  pg_get_expr(p.qual, p.polrelid) as using_expr,
  pg_get_expr(p.polwithcheck, p.polrelid) as with_check_expr
FROM pg_policy p
JOIN pg_class c ON c.oid = p.polrelid
WHERE c.relname = 'objects'
  AND c.relnamespace = 'storage'::regnamespace
  AND (
    pg_get_expr(p.qual, p.polrelid) LIKE '%users.name%'
    OR pg_get_expr(p.polwithcheck, p.polrelid) LIKE '%users.name%'
  );
```

**Resultado esperado:** 0 linhas

---

## 🐛 Troubleshooting

### Problema: "Permission denied" ao executar DROP POLICY

**Causa:** Você não é o owner das políticas.

**Solução:**
1. Executar via Supabase Dashboard (SQL Editor tem permissões elevadas)
2. Ou usar `SET ROLE` para o role correto (se tiver permissões)

### Problema: "Policy does not exist" mas ainda aparece na query

**Causa:** Cache do PostgreSQL ou políticas em outro schema.

**Solução:**
1. Aguardar alguns segundos
2. Executar a query novamente
3. Verificar se há políticas em outros schemas

### Problema: "Multiple policies with same name"

**Causa:** Há políticas duplicadas com owners diferentes.

**Solução:**
1. Usar `SQL_REMOVER_DUPLICATAS_E_RECRIAR.sql`
2. Isso remove TODAS as versões e recria apenas uma

---

## 📝 Checklist Final

- [ ] Diagnóstico executado
- [ ] Causa identificada (ownership/duplicatas/display)
- [ ] Correção aplicada (baseada no diagnóstico)
- [ ] Validação executada (0 referências a `users.name`)
- [ ] Políticas funcionando corretamente

---

## 🎯 Resultado Esperado

Após resolver o problema:

1. ✅ **Todas as políticas usam `extract_tutor_id_from_path(name)`**
2. ✅ **Nenhuma política referencia `users.name`**
3. ✅ **Tutores conseguem acessar seus próprios arquivos**
4. ✅ **Apenas 1 política de cada tipo (sem duplicatas)**

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

**🚀 Boa sorte! Execute o diagnóstico primeiro para identificar a causa exata.**






