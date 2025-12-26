# 🔍 Instruções de Diagnóstico do Login

## ✅ Status Atual

**Todos os arquivos foram sincronizados:**
- ✅ Arquivos de autenticação: 5879 linhas (sincronizados)
- ✅ Arquivos de calendário: Sincronizados
- ✅ Outros arquivos: Sincronizados

## 🔍 Para Diagnosticar o Problema do Login

### Passo 1: Verifique os Logs do Servidor

**Quando você tentar fazer login, você DEVE ver nos logs:**

```
[login route] Attempting login for: seu@email.com
[loginWithEmail] Attempting login for: seu@email.com
[loginWithEmail] Calling Supabase signInWithPassword...
```

**Se houver SUCESSO, você verá:**
```
[loginWithEmail] Auth successful, user ID: [uuid]
[loginWithEmail] User not found in public.users, creating...
[loginWithEmail] Login complete for: seu@email.com
[login route] Login successful, user ID: [id]
[login route] Using user ID for session: [id]
```

**Se houver ERRO, você verá:**
```
[loginWithEmail] Supabase Auth error: [mensagem do erro]
[loginWithEmail] Error code: [código]
[loginWithEmail] Local user check: { exists: true/false, hasAuthId: true/false, ... }
```

### Passo 2: Copie TODOS os Logs

**Copie TODOS os logs que aparecem quando você tenta fazer login**, especialmente:
- Qualquer linha que comece com `[login`
- Qualquer linha que comece com `[loginWithEmail`
- Qualquer erro ou warning

### Passo 3: Verifique no Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Vá em **Authentication** → **Users**
3. Procure pelo seu email
4. Verifique:
   - ✅ Usuário existe?
   - ✅ Email confirmado? (coluna "Email Confirmed")
   - ✅ Status ativo?

### Passo 4: Verifique no Banco de Dados

Execute no Supabase SQL Editor:
```sql
SELECT 
  id, 
  email, 
  auth_id, 
  email_verified, 
  open_id,
  login_method,
  role,
  created_at
FROM users 
WHERE email = 'seu@email.com';
```

## 🎯 Possíveis Problemas

### Problema 1: Usuário não existe no Supabase Auth
**Sintoma nos logs**: `User not found` ou `exists: false` no Local user check
**Solução**: Crie uma conta em `/register` primeiro

### Problema 2: Email não confirmado
**Sintoma nos logs**: `Email not confirmed` ou `email_not_confirmed`
**Solução**: O sistema tenta confirmar automaticamente. Se não funcionar:
- Verifique se `hasAuthId: true` nos logs
- Confirme manualmente no Supabase Dashboard

### Problema 3: Senha incorreta
**Sintoma nos logs**: `Invalid login credentials`
**Solução**: Use "Esqueceu a senha?" para resetar

### Problema 4: Variáveis de ambiente
**Sintoma nos logs**: Erro sobre variáveis faltando
**Solução**: Verifique `.env.local` e reinicie o servidor

### Problema 5: Banco de dados não disponível
**Sintoma nos logs**: `Database unavailable` ou `Database connection not available`
**Solução**: Verifique `DATABASE_URL` no `.env.local`

---

## 📝 IMPORTANTE

**Me envie os logs completos do servidor quando você tentar fazer login!**

Isso me permitirá identificar exatamente onde o problema está ocorrendo.

---

**Todos os arquivos foram sincronizados. Agora precisamos dos logs para diagnosticar!**
