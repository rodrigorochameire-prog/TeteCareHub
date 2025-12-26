# 🚀 Guia de Migração para Vercel

## ✅ Alterações Realizadas

### 1. **Router de Notificações (tRPC)**
- ✅ Criado `notifications` router em `server/routers.ts`
- ✅ Endpoints: `list`, `unreadCount`, `markAsRead`, `markAllAsRead`
- ✅ Substitui WebSocket por polling

### 2. **NotificationBell Component**
- ✅ Removido `useWebSocket()`
- ✅ Implementado polling com `trpc.notifications.list.useQuery`
- ✅ Atualiza a cada 5 segundos
- ✅ Mantém funcionalidades (toast, som, etc.)

### 3. **Estrutura Vercel**
- ✅ Criado `api/index.ts` - Entry point para Vercel
- ✅ Criado `vercel.json` - Configuração do Vercel
- ✅ Adaptado Express para Serverless Functions

### 4. **Package.json**
- ✅ Adicionado `build:vercel` script
- ✅ Adicionado `vercel:dev` script

---

## 📋 Próximos Passos

### 1. **Instalar Vercel CLI (se ainda não tiver)**
```bash
npm i -g vercel
```

### 2. **Conectar Projeto ao Vercel**

#### Opção A: Via Dashboard
1. Acesse: https://vercel.com
2. Clique em "Add New Project"
3. Conecte seu repositório GitHub
4. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** ./
   - **Build Command:** `pnpm build`
   - **Output Directory:** `dist`
   - **Install Command:** `pnpm install`

#### Opção B: Via CLI
```bash
vercel login
vercel
```

### 3. **Configurar Variáveis de Ambiente**

No Vercel Dashboard → Settings → Environment Variables, adicione:

**Obrigatórias:**
- `DATABASE_URL` - String de conexão PostgreSQL (Supabase)
- `SUPABASE_URL` - URL do projeto Supabase
- `SUPABASE_ANON_KEY` - Chave pública "anon"
- `SUPABASE_SERVICE_ROLE_KEY` - Chave de serviço (secret)
- `NODE_ENV` - `production`

**Para o Frontend (Build-time):**
- `VITE_SUPABASE_URL` - Mesmo valor de `SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` - Mesmo valor de `SUPABASE_ANON_KEY`

**Já configuradas (se usar):**
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `COOKIE_DOMAIN`
- `SESSION_SECRET`
- `SECURE_COOKIES`
- `TRUST_PROXY`

### 4. **Integração Automática com Supabase**

1. No Supabase Dashboard → Settings → Integrations
2. Clique em "Vercel"
3. Conecte sua conta Vercel
4. Selecione o projeto
5. ✅ Variáveis serão sincronizadas automaticamente!

### 5. **Fazer Deploy**

```bash
# Via CLI
vercel --prod

# Ou faça push para GitHub (deploy automático)
git add .
git commit -m "feat: migração para Vercel"
git push origin main
```

---

## 🔧 Ajustes Necessários

### 1. **WebSocket Removido**
- ✅ Notificações agora usam polling (5 segundos)
- ✅ Chat já usava polling (sem mudanças)
- ⚠️ Se precisar de tempo real, considere Server-Sent Events (SSE)

### 2. **Static Files**
- Vercel serve arquivos estáticos automaticamente
- Não precisa configurar manualmente

### 3. **Build Command**
- Vercel usa `pnpm build` automaticamente
- Ou configure no `vercel.json`

---

## 🧪 Testar Localmente

```bash
# Instalar Vercel CLI
npm i -g vercel

# Testar localmente
pnpm vercel:dev

# Ou
vercel dev
```

---

## 📝 Checklist de Deploy

- [ ] Instalar Vercel CLI
- [ ] Conectar repositório ao Vercel
- [ ] Configurar variáveis de ambiente
- [ ] Conectar Supabase (integração automática)
- [ ] Fazer deploy
- [ ] Testar aplicação
- [ ] Verificar notificações (polling)
- [ ] Verificar chat (já funcionava)
- [ ] Verificar WhatsApp (deve funcionar)

---

## ⚠️ Notas Importantes

### **WebSocket vs Polling**
- **Antes:** WebSocket (tempo real)
- **Agora:** Polling (atualiza a cada 5s)
- **Impacto:** Pequeno delay nas notificações (aceitável)

### **Performance**
- Vercel tem CDN global (melhor performance)
- Edge Functions (mais rápido)
- Otimizações automáticas

### **Custos**
- Free tier generoso
- Paga apenas o que usar
- Melhor que Railway para este caso

---

## 🎯 Benefícios da Migração

1. ✅ **Integração Supabase Automática**
   - Variáveis sincronizadas
   - Menos configuração manual

2. ✅ **Melhor Performance**
   - CDN global
   - Edge Functions
   - Otimizações automáticas

3. ✅ **Deploy Mais Simples**
   - Conecta GitHub
   - Deploy automático
   - Zero configuração

4. ✅ **Custo**
   - Free tier generoso
   - Paga apenas o que usar

---

## 🐛 Troubleshooting

### Erro: "Cannot find module"
- Verifique se todas as dependências estão no `package.json`
- Execute `pnpm install` localmente

### Erro: "Function timeout"
- Aumente `maxDuration` no `vercel.json`
- Otimize queries lentas

### Notificações não aparecem
- Verifique se o router está funcionando
- Verifique logs no Vercel Dashboard
- Teste endpoint `/api/trpc/notifications.list`

---

## ✅ Pronto!

Sua aplicação está pronta para o Vercel! 🚀

Faça o deploy e aproveite:
- Integração Supabase automática
- Melhor performance
- Deploy mais simples
- Custo otimizado
