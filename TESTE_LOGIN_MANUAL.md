# 🧪 Teste Manual de Login

## 📋 Checklist de Diagnóstico

### 1. Verificar Variáveis de Ambiente
```bash
# No terminal, execute:
cat .env.local | grep SUPABASE
```

Deve mostrar:
- `VITE_SUPABASE_URL=https://xxx.supabase.co`
- `VITE_SUPABASE_ANON_KEY=xxx`
- `SUPABASE_SERVICE_ROLE_KEY=xxx`

### 2. Verificar se o Servidor Está Rodando
```bash
# Verifique se há um processo na porta 3000:
lsof -i :3000
```

### 3. Testar Login e Ver Logs

1. **Abra o terminal onde o servidor está rodando**
2. **Tente fazer login** na interface web
3. **Copie TODOS os logs** que aparecem, especialmente:
   - `[login route] Attempting login for: ...`
   - `[loginWithEmail] ...`
   - Qualquer erro ou warning

### 4. Verificar no Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Vá em **Authentication** → **Users**
3. Procure pelo seu email
4. Verifique:
   - ✅ Usuário existe?
   - ✅ Email confirmado?
   - ✅ Status ativo?

### 5. Verificar no Banco de Dados

Execute no Supabase SQL Editor:
```sql
SELECT 
  id, 
  email, 
  auth_id, 
  email_verified, 
  open_id,
  login_method,
  role
FROM users 
WHERE email = 'seu@email.com';
```

## 🔍 Possíveis Problemas e Soluções

### Problema 1: Usuário não existe no Supabase Auth
**Solução**: Crie uma conta em `/register`

### Problema 2: Email não confirmado
**Solução**: O sistema tenta confirmar automaticamente. Se não funcionar:
- Confirme manualmente no Supabase Dashboard
- Ou use: `supabase.auth.admin.updateUserById(auth_id, { email_confirm: true })`

### Problema 3: Senha incorreta
**Solução**: Use "Esqueceu a senha?" para resetar

### Problema 4: Variáveis de ambiente incorretas
**Solução**: Verifique `.env.local` e reinicie o servidor

### Problema 5: Usuário existe mas não tem auth_id
**Solução**: O usuário precisa ser criado via Supabase Auth primeiro

---

**Me envie os logs do servidor quando você tentar fazer login para eu poder diagnosticar o problema específico!**
