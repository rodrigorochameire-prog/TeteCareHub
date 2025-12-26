# 📋 Próximos Passos Após Correções RLS

## ✅ Passo 1: Aplicar Correções Críticas

Execute o script `SQL_CORRIGIR_POLITICAS_PROBLEMAS.sql` no SQL Editor do Supabase para corrigir:
- ✅ Políticas de `staff` (usar `name` em vez de `users.name`)
- ✅ Políticas de `tutors` (usar `name` em vez de `users.name`)

---

## 🔍 Passo 2: Validar Correções

Execute a validação no final do script ou use:

```sql
-- Verificar se não há mais referências incorretas
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

---

## 🧪 Passo 3: Testar Funcionalidades

### 3.1 Testar Acesso de Tutores

1. **Criar um tutor de teste:**
   ```sql
   -- Inserir tutor
   INSERT INTO public.users (auth_id, name, email, role) 
   VALUES (gen_random_uuid(), 'Tutor Teste', 'tutor@test.com', 'user');
   
   -- Obter ID do tutor
   SELECT id FROM public.users WHERE email = 'tutor@test.com';
   ```

2. **Criar um pet e associar ao tutor:**
   ```sql
   -- Inserir pet
   INSERT INTO public.pets (name, ...) VALUES ('Pet Teste', ...);
   
   -- Associar tutor ao pet
   INSERT INTO public.pet_tutors ("tutorId", "petId") 
   VALUES (<tutor_id>, <pet_id>);
   ```

3. **Testar upload de arquivo:**
   - Fazer login como tutor
   - Tentar fazer upload para: `pets/{pet_id}/foto.jpg`
   - Verificar se consegue acessar o arquivo

### 3.2 Testar Acesso de Staff/Tutors

1. **Fazer login como tutor**
2. **Tentar fazer upload para:**
   - `tutors/{tutor_id}/documento.pdf` ✅ Deve funcionar
   - `tutors/{outro_tutor_id}/documento.pdf` ❌ Não deve funcionar
   - `staff/{tutor_id}/foto.jpg` ✅ Deve funcionar (se for staff)

### 3.3 Testar Acesso de Admin

1. **Fazer login como admin**
2. **Verificar acesso a todos os buckets:**
   - ✅ Deve conseguir ler/escrever em todos
   - ✅ Deve conseguir deletar arquivos de qualquer tutor/pet

---

## 🎯 Passo 4: Decisões Opcionais

### 4.1 Wall Policy Insert

**Decisão:** Aplicar correção para forçar owner?

- ✅ **SIM** - Aplicar correção (recomendado)
- ❌ **NÃO** - Manter como está

Se SIM, descomente a seção no script `SQL_CORRIGIR_POLITICAS_PROBLEMAS.sql`.

### 4.2 Marketing e Partnerships

**Decisão:** Manter leitura pública?

- ✅ **SIM** - Manter público (para conteúdo de marketing/parcerias)
- ❌ **NÃO** - Restringir para autenticados

Se NÃO, criar políticas privadas:

```sql
-- Exemplo para marketing (se desejar privado)
DROP POLICY IF EXISTS "marketing_policy_select" ON storage.objects;

CREATE POLICY "marketing_policy_select"
ON storage.objects FOR SELECT
TO authenticated  -- ✅ Mudou de 'public' para 'authenticated'
USING (bucket_id = 'marketing');
```

---

## 📊 Passo 5: Monitoramento

### 5.1 Verificar Logs de Erro

Monitore erros relacionados a:
- `extract_pet_id_from_path`: NULL ou valores inválidos
- `extract_tutor_id_from_path`: NULL ou valores inválidos
- `is_tutor_of_pet`: Retornando false quando deveria ser true

### 5.2 Estrutura de Pastas

Garantir que o código da aplicação cria arquivos com a estrutura correta:

```
pets/{petId}/arquivo.jpg
tutors/{tutorId}/arquivo.pdf
staff/{tutorId}/arquivo.jpg
documents/{petId}/documento.pdf
health-logs/{petId}/log.json
products/{petId}/produto.jpg
reports/{petId}/relatorio.pdf
financial/{petId}/fatura.pdf
wall/{qualquer}/post.jpg
marketing/{categoria}/banner.jpg
partnerships/{parceiro}/logo.png
```

---

## ✅ Checklist Final

- [ ] Correções críticas aplicadas (`staff` e `tutors`)
- [ ] Validação executada (0 referências a `users.name`)
- [ ] Teste de acesso de tutor realizado
- [ ] Teste de acesso de admin realizado
- [ ] Decisão sobre `wall_policy_insert` tomada
- [ ] Decisão sobre `marketing`/`partnerships` tomada
- [ ] Estrutura de pastas verificada no código
- [ ] Logs de erro monitorados

---

## 🆘 Troubleshooting

### Erro: "extract_tutor_id_from_path returned NULL"

**Causa:** Caminho do arquivo não segue o padrão esperado.

**Solução:** Verificar se o código cria arquivos como `tutors/{tutorId}/arquivo.ext`.

### Erro: "Tutor não consegue acessar arquivo do próprio pet"

**Causa:** Relação `pet_tutors` não existe ou está incorreta.

**Solução:** Verificar se `pet_tutors` tem registro com `tutorId` e `petId` corretos.

### Erro: "Admin não consegue acessar"

**Causa:** Usuário não tem `role = 'admin'` na tabela `users`.

**Solução:** Verificar e atualizar:
```sql
UPDATE public.users SET role = 'admin' WHERE email = 'admin@example.com';
```

---

## 📞 Próximos Passos Após Validação

1. **Integrar com código da aplicação**
   - Atualizar uploads para usar estrutura de pastas correta
   - Testar fluxo completo (criar pet → associar tutor → upload → acesso)

2. **Configurar CORS** (se necessário)
   - Supabase Storage → Settings → CORS

3. **Configurar limites de tamanho** (se necessário)
   - Supabase Storage → Settings → File size limits

4. **Documentar estrutura de pastas** para a equipe

---

**🎉 Após completar todos os passos, o sistema de RLS estará totalmente funcional!**






## ✅ Passo 1: Aplicar Correções Críticas

Execute o script `SQL_CORRIGIR_POLITICAS_PROBLEMAS.sql` no SQL Editor do Supabase para corrigir:
- ✅ Políticas de `staff` (usar `name` em vez de `users.name`)
- ✅ Políticas de `tutors` (usar `name` em vez de `users.name`)

---

## 🔍 Passo 2: Validar Correções

Execute a validação no final do script ou use:

```sql
-- Verificar se não há mais referências incorretas
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

---

## 🧪 Passo 3: Testar Funcionalidades

### 3.1 Testar Acesso de Tutores

1. **Criar um tutor de teste:**
   ```sql
   -- Inserir tutor
   INSERT INTO public.users (auth_id, name, email, role) 
   VALUES (gen_random_uuid(), 'Tutor Teste', 'tutor@test.com', 'user');
   
   -- Obter ID do tutor
   SELECT id FROM public.users WHERE email = 'tutor@test.com';
   ```

2. **Criar um pet e associar ao tutor:**
   ```sql
   -- Inserir pet
   INSERT INTO public.pets (name, ...) VALUES ('Pet Teste', ...);
   
   -- Associar tutor ao pet
   INSERT INTO public.pet_tutors ("tutorId", "petId") 
   VALUES (<tutor_id>, <pet_id>);
   ```

3. **Testar upload de arquivo:**
   - Fazer login como tutor
   - Tentar fazer upload para: `pets/{pet_id}/foto.jpg`
   - Verificar se consegue acessar o arquivo

### 3.2 Testar Acesso de Staff/Tutors

1. **Fazer login como tutor**
2. **Tentar fazer upload para:**
   - `tutors/{tutor_id}/documento.pdf` ✅ Deve funcionar
   - `tutors/{outro_tutor_id}/documento.pdf` ❌ Não deve funcionar
   - `staff/{tutor_id}/foto.jpg` ✅ Deve funcionar (se for staff)

### 3.3 Testar Acesso de Admin

1. **Fazer login como admin**
2. **Verificar acesso a todos os buckets:**
   - ✅ Deve conseguir ler/escrever em todos
   - ✅ Deve conseguir deletar arquivos de qualquer tutor/pet

---

## 🎯 Passo 4: Decisões Opcionais

### 4.1 Wall Policy Insert

**Decisão:** Aplicar correção para forçar owner?

- ✅ **SIM** - Aplicar correção (recomendado)
- ❌ **NÃO** - Manter como está

Se SIM, descomente a seção no script `SQL_CORRIGIR_POLITICAS_PROBLEMAS.sql`.

### 4.2 Marketing e Partnerships

**Decisão:** Manter leitura pública?

- ✅ **SIM** - Manter público (para conteúdo de marketing/parcerias)
- ❌ **NÃO** - Restringir para autenticados

Se NÃO, criar políticas privadas:

```sql
-- Exemplo para marketing (se desejar privado)
DROP POLICY IF EXISTS "marketing_policy_select" ON storage.objects;

CREATE POLICY "marketing_policy_select"
ON storage.objects FOR SELECT
TO authenticated  -- ✅ Mudou de 'public' para 'authenticated'
USING (bucket_id = 'marketing');
```

---

## 📊 Passo 5: Monitoramento

### 5.1 Verificar Logs de Erro

Monitore erros relacionados a:
- `extract_pet_id_from_path`: NULL ou valores inválidos
- `extract_tutor_id_from_path`: NULL ou valores inválidos
- `is_tutor_of_pet`: Retornando false quando deveria ser true

### 5.2 Estrutura de Pastas

Garantir que o código da aplicação cria arquivos com a estrutura correta:

```
pets/{petId}/arquivo.jpg
tutors/{tutorId}/arquivo.pdf
staff/{tutorId}/arquivo.jpg
documents/{petId}/documento.pdf
health-logs/{petId}/log.json
products/{petId}/produto.jpg
reports/{petId}/relatorio.pdf
financial/{petId}/fatura.pdf
wall/{qualquer}/post.jpg
marketing/{categoria}/banner.jpg
partnerships/{parceiro}/logo.png
```

---

## ✅ Checklist Final

- [ ] Correções críticas aplicadas (`staff` e `tutors`)
- [ ] Validação executada (0 referências a `users.name`)
- [ ] Teste de acesso de tutor realizado
- [ ] Teste de acesso de admin realizado
- [ ] Decisão sobre `wall_policy_insert` tomada
- [ ] Decisão sobre `marketing`/`partnerships` tomada
- [ ] Estrutura de pastas verificada no código
- [ ] Logs de erro monitorados

---

## 🆘 Troubleshooting

### Erro: "extract_tutor_id_from_path returned NULL"

**Causa:** Caminho do arquivo não segue o padrão esperado.

**Solução:** Verificar se o código cria arquivos como `tutors/{tutorId}/arquivo.ext`.

### Erro: "Tutor não consegue acessar arquivo do próprio pet"

**Causa:** Relação `pet_tutors` não existe ou está incorreta.

**Solução:** Verificar se `pet_tutors` tem registro com `tutorId` e `petId` corretos.

### Erro: "Admin não consegue acessar"

**Causa:** Usuário não tem `role = 'admin'` na tabela `users`.

**Solução:** Verificar e atualizar:
```sql
UPDATE public.users SET role = 'admin' WHERE email = 'admin@example.com';
```

---

## 📞 Próximos Passos Após Validação

1. **Integrar com código da aplicação**
   - Atualizar uploads para usar estrutura de pastas correta
   - Testar fluxo completo (criar pet → associar tutor → upload → acesso)

2. **Configurar CORS** (se necessário)
   - Supabase Storage → Settings → CORS

3. **Configurar limites de tamanho** (se necessário)
   - Supabase Storage → Settings → File size limits

4. **Documentar estrutura de pastas** para a equipe

---

**🎉 Após completar todos os passos, o sistema de RLS estará totalmente funcional!**






