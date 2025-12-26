# 🚂 Correção do Deploy no Railway

## 🔍 Problemas Comuns e Soluções

### 1. **Variáveis de Ambiente Não Configuradas**

O Railway precisa das seguintes variáveis de ambiente:

#### Variáveis Obrigatórias:
```bash
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
PORT=3000
NODE_ENV=production
```

#### Variáveis Opcionais (mas importantes):
```bash
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

**Como adicionar no Railway:**
1. Vá em **Settings** → **Variables**
2. Adicione cada variável uma por uma
3. Clique em **Redeploy** após adicionar

---

### 2. **Build Falhando**

O `railway.json` está configurado para:
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install && pnpm db:push && pnpm build"
  }
}
```

**Possíveis problemas:**
- ❌ `pnpm` não instalado (Railway usa Nixpacks que detecta automaticamente)
- ❌ `db:push` falhando (pode ser problema de conexão com DB)
- ❌ `build` falhando (erros de TypeScript ou dependências)

**Solução:**
Remova `pnpm db:push` do build (faça isso separadamente):

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install && pnpm build"
  }
}
```

**Depois, execute migrações manualmente:**
```bash
# No terminal local ou via Railway CLI
pnpm db:push
```

---

### 3. **Start Command Falhando**

O comando de start é: `pnpm start`

Isso executa: `NODE_ENV=production node dist/index.js`

**Verifique:**
- ✅ O arquivo `dist/index.js` existe após o build
- ✅ Todas as dependências estão instaladas
- ✅ A porta está correta (Railway define `PORT` automaticamente)

---

### 4. **Arquivo `railway.json` Corrigido**

Crie/atualize o `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install && pnpm build"
  },
  "deploy": {
    "startCommand": "pnpm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Mudanças:**
- ✅ Removido `pnpm db:push` do build (faça manualmente)
- ✅ Mantido `pnpm start` para produção

---

### 5. **Verificar Logs no Railway**

1. Vá em **Deployments** → Clique no deployment mais recente
2. Veja os **Build Logs** e **Deploy Logs**
3. Procure por erros específicos:
   - `Error: Cannot find module...` → Dependência faltando
   - `Error: connect ECONNREFUSED` → Variável de ambiente errada
   - `Error: PORT is not defined` → Railway deve definir automaticamente

---

### 6. **Checklist de Deploy**

Antes de fazer deploy, verifique:

- [ ] Todas as variáveis de ambiente estão configuradas no Railway
- [ ] `railway.json` está correto (sem `db:push` no build)
- [ ] Build local funciona: `pnpm build`
- [ ] Start local funciona: `pnpm start`
- [ ] Migrações foram aplicadas no banco de dados
- [ ] Repositório está conectado ao Railway
- [ ] Branch `main` está atualizada

---

### 7. **Comandos para Testar Localmente**

```bash
# 1. Testar build
pnpm build

# 2. Testar start (simula produção)
NODE_ENV=production pnpm start

# 3. Verificar se dist/index.js existe
ls -la dist/index.js

# 4. Verificar variáveis de ambiente
echo $DATABASE_URL
echo $SUPABASE_URL
```

---

### 8. **Solução Rápida: Railway.json Simplificado**

Se ainda não funcionar, use esta versão mínima:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "pnpm start"
  }
}
```

O Nixpacks detectará automaticamente:
- ✅ Node.js
- ✅ pnpm (se houver `pnpm-lock.yaml`)
- ✅ Comandos de build (se houver `package.json`)

---

### 9. **Alternativa: Usar Dockerfile**

Se o Nixpacks não funcionar, crie um `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copiar código
COPY . .

# Build
RUN pnpm build

# Expor porta
EXPOSE 3000

# Start
CMD ["pnpm", "start"]
```

---

## 🎯 Próximos Passos

1. **Atualize o `railway.json`** (remova `db:push` do build)
2. **Configure todas as variáveis de ambiente** no Railway
3. **Faça um novo deploy**
4. **Verifique os logs** para erros específicos
5. **Execute migrações manualmente** após o deploy

---

## 📝 Nota Importante

**Migrações de Banco:**
- ❌ **NÃO** execute `db:push` durante o build (pode falhar)
- ✅ Execute **manualmente** após o deploy ou via Railway CLI
- ✅ Ou configure um serviço separado no Railway só para migrações

---

**Status**: Aguardando informações dos logs do Railway para diagnóstico específico.
