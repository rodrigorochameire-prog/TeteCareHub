<<<<<<< Current (Your changes)
# ✅ Migração para Vercel - Resumo das Alterações

## 🎯 Alterações Realizadas

### 1. ✅ Router de Notificações (tRPC)
- **Arquivo:** `server/routers.ts`
- **Mudança:** Criado novo router `notifications` com endpoints:
  - `list` - Lista notificações do usuário
  - `unreadCount` - Conta notificações não lidas
  - `markAsRead` - Marca notificação como lida
  - `markAllAsRead` - Marca todas como lidas
  - `triggerVaccineAlerts` - Dispara alertas de vacina (admin)
  - `triggerCalendarReminders` - Dispara lembretes de calendário (admin)
  - `triggerLowCreditsAlerts` - Dispara alertas de créditos baixos (admin)

### 2. ✅ NotificationBell Component
- **Arquivo:** `client/src/components/NotificationBell.tsx`
- **Mudança:** 
  - ❌ Removido `useWebSocket()`
  - ✅ Implementado polling com `trpc.notifications.list.useQuery`
  - ✅ Atualiza a cada 5 segundos (`refetchInterval: 5000`)
  - ✅ Mantém todas funcionalidades (toast, som, badges)

### 3. ✅ Estrutura Vercel
- **Arquivo:** `api/index.ts` (NOVO)
- **Conteúdo:** Entry point para Vercel Serverless Functions
- **Adapta:** Express app para ambiente serverless

### 4. ✅ Configuração Vercel
- **Arquivo:** `vercel.json` (NOVO)
- **Configurações:**
  - Build command: `pnpm build`
  - Output directory: `dist`
  - Functions timeout: 30s
  - Rewrites para API routes
  - CORS headers

### 5. ✅ Package.json
- **Scripts adicionados:**
  - `build:vercel` - Build otimizado para Vercel
  - `vercel:dev` - Desenvolvimento local com Vercel CLI

### 6. ✅ Arquivos de Configuração
- **`.vercelignore`** - Arquivos ignorados no deploy
- **`GUIA_MIGRACAO_VERCEL.md`** - Guia completo de migração

---

## 📋 Próximos Passos

### 1. Instalar Vercel CLI
```bash
npm i -g vercel
```

### 2. Conectar Projeto
```bash
vercel login
vercel
```

### 3. Configurar Variáveis de Ambiente
No Vercel Dashboard → Settings → Environment Variables

**Obrigatórias:**
- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NODE_ENV` = `production`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 4. Integração Supabase (Opcional mas Recomendado)
- Supabase Dashboard → Settings → Integrations → Vercel
- Conecta automaticamente e sincroniza variáveis

### 5. Deploy
```bash
git add .
git commit -m "feat: migração para Vercel"
git push origin main
```

---

## ⚠️ Notas Importantes

### WebSocket → Polling
- **Antes:** Notificações em tempo real via WebSocket
- **Agora:** Polling a cada 5 segundos
- **Impacto:** Pequeno delay (aceitável)

### Chat
- **Já usava polling** - Sem mudanças necessárias
- **Funciona perfeitamente** no Vercel

### WhatsApp
- **Funciona normalmente** - Sem mudanças
- **API calls** funcionam em Serverless Functions

---

## 🎉 Benefícios

1. ✅ **Integração Supabase Automática**
2. ✅ **Melhor Performance** (CDN global)
3. ✅ **Deploy Mais Simples**
4. ✅ **Custo Otimizado**

---

## ✅ Status

- ✅ Router de notificações criado
- ✅ NotificationBell adaptado
- ✅ Estrutura Vercel criada
- ✅ Configuração Vercel criada
- ✅ Package.json atualizado
- ✅ Documentação criada

**Pronto para deploy!** 🚀


# ✅ Migração para Vercel - Resumo das Alterações

## 🎯 Alterações Realizadas

### 1. ✅ Router de Notificações (tRPC)
- **Arquivo:** `server/routers.ts`
- **Mudança:** Criado novo router `notifications` com endpoints:
  - `list` - Lista notificações do usuário
  - `unreadCount` - Conta notificações não lidas
  - `markAsRead` - Marca notificação como lida
  - `markAllAsRead` - Marca todas como lidas
  - `triggerVaccineAlerts` - Dispara alertas de vacina (admin)
  - `triggerCalendarReminders` - Dispara lembretes de calendário (admin)
  - `triggerLowCreditsAlerts` - Dispara alertas de créditos baixos (admin)

### 2. ✅ NotificationBell Component
- **Arquivo:** `client/src/components/NotificationBell.tsx`
- **Mudança:** 
  - ❌ Removido `useWebSocket()`
  - ✅ Implementado polling com `trpc.notifications.list.useQuery`
  - ✅ Atualiza a cada 5 segundos (`refetchInterval: 5000`)
  - ✅ Mantém todas funcionalidades (toast, som, badges)

### 3. ✅ Estrutura Vercel
- **Arquivo:** `api/index.ts` (NOVO)
- **Conteúdo:** Entry point para Vercel Serverless Functions
- **Adapta:** Express app para ambiente serverless

### 4. ✅ Configuração Vercel
- **Arquivo:** `vercel.json` (NOVO)
- **Configurações:**
  - Build command: `pnpm build`
  - Output directory: `dist`
  - Functions timeout: 30s
  - Rewrites para API routes
  - CORS headers

### 5. ✅ Package.json
- **Scripts adicionados:**
  - `build:vercel` - Build otimizado para Vercel
  - `vercel:dev` - Desenvolvimento local com Vercel CLI

### 6. ✅ Arquivos de Configuração
- **`.vercelignore`** - Arquivos ignorados no deploy
- **`GUIA_MIGRACAO_VERCEL.md`** - Guia completo de migração

---

## 📋 Próximos Passos

### 1. Instalar Vercel CLI
```bash
npm i -g vercel
```

### 2. Conectar Projeto
```bash
vercel login
vercel
```

### 3. Configurar Variáveis de Ambiente
No Vercel Dashboard → Settings → Environment Variables

**Obrigatórias:**
- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NODE_ENV` = `production`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 4. Integração Supabase (Opcional mas Recomendado)
- Supabase Dashboard → Settings → Integrations → Vercel
- Conecta automaticamente e sincroniza variáveis

### 5. Deploy
```bash
git add .
git commit -m "feat: migração para Vercel"
git push origin main
```

---

## ⚠️ Notas Importantes

### WebSocket → Polling
- **Antes:** Notificações em tempo real via WebSocket
- **Agora:** Polling a cada 5 segundos
- **Impacto:** Pequeno delay (aceitável)

### Chat
- **Já usava polling** - Sem mudanças necessárias
- **Funciona perfeitamente** no Vercel

### WhatsApp
- **Funciona normalmente** - Sem mudanças
- **API calls** funcionam em Serverless Functions

---

## 🎉 Benefícios

1. ✅ **Integração Supabase Automática**
2. ✅ **Melhor Performance** (CDN global)
3. ✅ **Deploy Mais Simples**
4. ✅ **Custo Otimizado**

---

## ✅ Status

- ✅ Router de notificações criado
- ✅ NotificationBell adaptado
- ✅ Estrutura Vercel criada
- ✅ Configuração Vercel criada
- ✅ Package.json atualizado
- ✅ Documentação criada

**Pronto para deploy!** 🚀



# ✅ Migração para Vercel - Resumo das Alterações

## 🎯 Alterações Realizadas

### 1. ✅ Router de Notificações (tRPC)
- **Arquivo:** `server/routers.ts`
- **Mudança:** Criado novo router `notifications` com endpoints:
  - `list` - Lista notificações do usuário
  - `unreadCount` - Conta notificações não lidas
  - `markAsRead` - Marca notificação como lida
  - `markAllAsRead` - Marca todas como lidas
  - `triggerVaccineAlerts` - Dispara alertas de vacina (admin)
  - `triggerCalendarReminders` - Dispara lembretes de calendário (admin)
  - `triggerLowCreditsAlerts` - Dispara alertas de créditos baixos (admin)

### 2. ✅ NotificationBell Component
- **Arquivo:** `client/src/components/NotificationBell.tsx`
- **Mudança:** 
  - ❌ Removido `useWebSocket()`
  - ✅ Implementado polling com `trpc.notifications.list.useQuery`
  - ✅ Atualiza a cada 5 segundos (`refetchInterval: 5000`)
  - ✅ Mantém todas funcionalidades (toast, som, badges)

### 3. ✅ Estrutura Vercel
- **Arquivo:** `api/index.ts` (NOVO)
- **Conteúdo:** Entry point para Vercel Serverless Functions
- **Adapta:** Express app para ambiente serverless

### 4. ✅ Configuração Vercel
- **Arquivo:** `vercel.json` (NOVO)
- **Configurações:**
  - Build command: `pnpm build`
  - Output directory: `dist`
  - Functions timeout: 30s
  - Rewrites para API routes
  - CORS headers

### 5. ✅ Package.json
- **Scripts adicionados:**
  - `build:vercel` - Build otimizado para Vercel
  - `vercel:dev` - Desenvolvimento local com Vercel CLI

### 6. ✅ Arquivos de Configuração
- **`.vercelignore`** - Arquivos ignorados no deploy
- **`GUIA_MIGRACAO_VERCEL.md`** - Guia completo de migração

---

## 📋 Próximos Passos

### 1. Instalar Vercel CLI
```bash
npm i -g vercel
```

### 2. Conectar Projeto
```bash
vercel login
vercel
```

### 3. Configurar Variáveis de Ambiente
No Vercel Dashboard → Settings → Environment Variables

**Obrigatórias:**
- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NODE_ENV` = `production`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 4. Integração Supabase (Opcional mas Recomendado)
- Supabase Dashboard → Settings → Integrations → Vercel
- Conecta automaticamente e sincroniza variáveis

### 5. Deploy
```bash
git add .
git commit -m "feat: migração para Vercel"
git push origin main
```

---

## ⚠️ Notas Importantes

### WebSocket → Polling
- **Antes:** Notificações em tempo real via WebSocket
- **Agora:** Polling a cada 5 segundos
- **Impacto:** Pequeno delay (aceitável)

### Chat
- **Já usava polling** - Sem mudanças necessárias
- **Funciona perfeitamente** no Vercel

### WhatsApp
- **Funciona normalmente** - Sem mudanças
- **API calls** funcionam em Serverless Functions

---

## 🎉 Benefícios

1. ✅ **Integração Supabase Automática**
2. ✅ **Melhor Performance** (CDN global)
3. ✅ **Deploy Mais Simples**
4. ✅ **Custo Otimizado**

---

## ✅ Status

- ✅ Router de notificações criado
- ✅ NotificationBell adaptado
- ✅ Estrutura Vercel criada
- ✅ Configuração Vercel criada
- ✅ Package.json atualizado
- ✅ Documentação criada

**Pronto para deploy!** 🚀


# ✅ Migração para Vercel - Resumo das Alterações

## 🎯 Alterações Realizadas

### 1. ✅ Router de Notificações (tRPC)
- **Arquivo:** `server/routers.ts`
- **Mudança:** Criado novo router `notifications` com endpoints:
  - `list` - Lista notificações do usuário
  - `unreadCount` - Conta notificações não lidas
  - `markAsRead` - Marca notificação como lida
  - `markAllAsRead` - Marca todas como lidas
  - `triggerVaccineAlerts` - Dispara alertas de vacina (admin)
  - `triggerCalendarReminders` - Dispara lembretes de calendário (admin)
  - `triggerLowCreditsAlerts` - Dispara alertas de créditos baixos (admin)

### 2. ✅ NotificationBell Component
- **Arquivo:** `client/src/components/NotificationBell.tsx`
- **Mudança:** 
  - ❌ Removido `useWebSocket()`
  - ✅ Implementado polling com `trpc.notifications.list.useQuery`
  - ✅ Atualiza a cada 5 segundos (`refetchInterval: 5000`)
  - ✅ Mantém todas funcionalidades (toast, som, badges)

### 3. ✅ Estrutura Vercel
- **Arquivo:** `api/index.ts` (NOVO)
- **Conteúdo:** Entry point para Vercel Serverless Functions
- **Adapta:** Express app para ambiente serverless

### 4. ✅ Configuração Vercel
- **Arquivo:** `vercel.json` (NOVO)
- **Configurações:**
  - Build command: `pnpm build`
  - Output directory: `dist`
  - Functions timeout: 30s
  - Rewrites para API routes
  - CORS headers

### 5. ✅ Package.json
- **Scripts adicionados:**
  - `build:vercel` - Build otimizado para Vercel
  - `vercel:dev` - Desenvolvimento local com Vercel CLI

### 6. ✅ Arquivos de Configuração
- **`.vercelignore`** - Arquivos ignorados no deploy
- **`GUIA_MIGRACAO_VERCEL.md`** - Guia completo de migração

---

## 📋 Próximos Passos

### 1. Instalar Vercel CLI
```bash
npm i -g vercel
```

### 2. Conectar Projeto
```bash
vercel login
vercel
```

### 3. Configurar Variáveis de Ambiente
No Vercel Dashboard → Settings → Environment Variables

**Obrigatórias:**
- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NODE_ENV` = `production`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 4. Integração Supabase (Opcional mas Recomendado)
- Supabase Dashboard → Settings → Integrations → Vercel
- Conecta automaticamente e sincroniza variáveis

### 5. Deploy
```bash
git add .
git commit -m "feat: migração para Vercel"
git push origin main
```

---

## ⚠️ Notas Importantes

### WebSocket → Polling
- **Antes:** Notificações em tempo real via WebSocket
- **Agora:** Polling a cada 5 segundos
- **Impacto:** Pequeno delay (aceitável)

### Chat
- **Já usava polling** - Sem mudanças necessárias
- **Funciona perfeitamente** no Vercel

### WhatsApp
- **Funciona normalmente** - Sem mudanças
- **API calls** funcionam em Serverless Functions

---

## 🎉 Benefícios

1. ✅ **Integração Supabase Automática**
2. ✅ **Melhor Performance** (CDN global)
3. ✅ **Deploy Mais Simples**
4. ✅ **Custo Otimizado**

---

## ✅ Status

- ✅ Router de notificações criado
- ✅ NotificationBell adaptado
- ✅ Estrutura Vercel criada
- ✅ Configuração Vercel criada
- ✅ Package.json atualizado
- ✅ Documentação criada

**Pronto para deploy!** 🚀



# ✅ Migração para Vercel - Resumo das Alterações

## 🎯 Alterações Realizadas

### 1. ✅ Router de Notificações (tRPC)
- **Arquivo:** `server/routers.ts`
- **Mudança:** Criado novo router `notifications` com endpoints:
  - `list` - Lista notificações do usuário
  - `unreadCount` - Conta notificações não lidas
  - `markAsRead` - Marca notificação como lida
  - `markAllAsRead` - Marca todas como lidas
  - `triggerVaccineAlerts` - Dispara alertas de vacina (admin)
  - `triggerCalendarReminders` - Dispara lembretes de calendário (admin)
  - `triggerLowCreditsAlerts` - Dispara alertas de créditos baixos (admin)

### 2. ✅ NotificationBell Component
- **Arquivo:** `client/src/components/NotificationBell.tsx`
- **Mudança:** 
  - ❌ Removido `useWebSocket()`
  - ✅ Implementado polling com `trpc.notifications.list.useQuery`
  - ✅ Atualiza a cada 5 segundos (`refetchInterval: 5000`)
  - ✅ Mantém todas funcionalidades (toast, som, badges)

### 3. ✅ Estrutura Vercel
- **Arquivo:** `api/index.ts` (NOVO)
- **Conteúdo:** Entry point para Vercel Serverless Functions
- **Adapta:** Express app para ambiente serverless

### 4. ✅ Configuração Vercel
- **Arquivo:** `vercel.json` (NOVO)
- **Configurações:**
  - Build command: `pnpm build`
  - Output directory: `dist`
  - Functions timeout: 30s
  - Rewrites para API routes
  - CORS headers

### 5. ✅ Package.json
- **Scripts adicionados:**
  - `build:vercel` - Build otimizado para Vercel
  - `vercel:dev` - Desenvolvimento local com Vercel CLI

### 6. ✅ Arquivos de Configuração
- **`.vercelignore`** - Arquivos ignorados no deploy
- **`GUIA_MIGRACAO_VERCEL.md`** - Guia completo de migração

---

## 📋 Próximos Passos

### 1. Instalar Vercel CLI
```bash
npm i -g vercel
```

### 2. Conectar Projeto
```bash
vercel login
vercel
```

### 3. Configurar Variáveis de Ambiente
No Vercel Dashboard → Settings → Environment Variables

**Obrigatórias:**
- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NODE_ENV` = `production`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 4. Integração Supabase (Opcional mas Recomendado)
- Supabase Dashboard → Settings → Integrations → Vercel
- Conecta automaticamente e sincroniza variáveis

### 5. Deploy
```bash
git add .
git commit -m "feat: migração para Vercel"
git push origin main
```

---

## ⚠️ Notas Importantes

### WebSocket → Polling
- **Antes:** Notificações em tempo real via WebSocket
- **Agora:** Polling a cada 5 segundos
- **Impacto:** Pequeno delay (aceitável)

### Chat
- **Já usava polling** - Sem mudanças necessárias
- **Funciona perfeitamente** no Vercel

### WhatsApp
- **Funciona normalmente** - Sem mudanças
- **API calls** funcionam em Serverless Functions

---

## 🎉 Benefícios

1. ✅ **Integração Supabase Automática**
2. ✅ **Melhor Performance** (CDN global)
3. ✅ **Deploy Mais Simples**
4. ✅ **Custo Otimizado**

---

## ✅ Status

- ✅ Router de notificações criado
- ✅ NotificationBell adaptado
- ✅ Estrutura Vercel criada
- ✅ Configuração Vercel criada
- ✅ Package.json atualizado
- ✅ Documentação criada

**Pronto para deploy!** 🚀


# ✅ Migração para Vercel - Resumo das Alterações

## 🎯 Alterações Realizadas

### 1. ✅ Router de Notificações (tRPC)
- **Arquivo:** `server/routers.ts`
- **Mudança:** Criado novo router `notifications` com endpoints:
  - `list` - Lista notificações do usuário
  - `unreadCount` - Conta notificações não lidas
  - `markAsRead` - Marca notificação como lida
  - `markAllAsRead` - Marca todas como lidas
  - `triggerVaccineAlerts` - Dispara alertas de vacina (admin)
  - `triggerCalendarReminders` - Dispara lembretes de calendário (admin)
  - `triggerLowCreditsAlerts` - Dispara alertas de créditos baixos (admin)

### 2. ✅ NotificationBell Component
- **Arquivo:** `client/src/components/NotificationBell.tsx`
- **Mudança:** 
  - ❌ Removido `useWebSocket()`
  - ✅ Implementado polling com `trpc.notifications.list.useQuery`
  - ✅ Atualiza a cada 5 segundos (`refetchInterval: 5000`)
  - ✅ Mantém todas funcionalidades (toast, som, badges)

### 3. ✅ Estrutura Vercel
- **Arquivo:** `api/index.ts` (NOVO)
- **Conteúdo:** Entry point para Vercel Serverless Functions
- **Adapta:** Express app para ambiente serverless

### 4. ✅ Configuração Vercel
- **Arquivo:** `vercel.json` (NOVO)
- **Configurações:**
  - Build command: `pnpm build`
  - Output directory: `dist`
  - Functions timeout: 30s
  - Rewrites para API routes
  - CORS headers

### 5. ✅ Package.json
- **Scripts adicionados:**
  - `build:vercel` - Build otimizado para Vercel
  - `vercel:dev` - Desenvolvimento local com Vercel CLI

### 6. ✅ Arquivos de Configuração
- **`.vercelignore`** - Arquivos ignorados no deploy
- **`GUIA_MIGRACAO_VERCEL.md`** - Guia completo de migração

---

## 📋 Próximos Passos

### 1. Instalar Vercel CLI
```bash
npm i -g vercel
```

### 2. Conectar Projeto
```bash
vercel login
vercel
```

### 3. Configurar Variáveis de Ambiente
No Vercel Dashboard → Settings → Environment Variables

**Obrigatórias:**
- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NODE_ENV` = `production`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 4. Integração Supabase (Opcional mas Recomendado)
- Supabase Dashboard → Settings → Integrations → Vercel
- Conecta automaticamente e sincroniza variáveis

### 5. Deploy
```bash
git add .
git commit -m "feat: migração para Vercel"
git push origin main
```

---

## ⚠️ Notas Importantes

### WebSocket → Polling
- **Antes:** Notificações em tempo real via WebSocket
- **Agora:** Polling a cada 5 segundos
- **Impacto:** Pequeno delay (aceitável)

### Chat
- **Já usava polling** - Sem mudanças necessárias
- **Funciona perfeitamente** no Vercel

### WhatsApp
- **Funciona normalmente** - Sem mudanças
- **API calls** funcionam em Serverless Functions

---

## 🎉 Benefícios

1. ✅ **Integração Supabase Automática**
2. ✅ **Melhor Performance** (CDN global)
3. ✅ **Deploy Mais Simples**
4. ✅ **Custo Otimizado**

---

## ✅ Status

- ✅ Router de notificações criado
- ✅ NotificationBell adaptado
- ✅ Estrutura Vercel criada
- ✅ Configuração Vercel criada
- ✅ Package.json atualizado
- ✅ Documentação criada

**Pronto para deploy!** 🚀



# ✅ Migração para Vercel - Resumo das Alterações

## 🎯 Alterações Realizadas

### 1. ✅ Router de Notificações (tRPC)
- **Arquivo:** `server/routers.ts`
- **Mudança:** Criado novo router `notifications` com endpoints:
  - `list` - Lista notificações do usuário
  - `unreadCount` - Conta notificações não lidas
  - `markAsRead` - Marca notificação como lida
  - `markAllAsRead` - Marca todas como lidas
  - `triggerVaccineAlerts` - Dispara alertas de vacina (admin)
  - `triggerCalendarReminders` - Dispara lembretes de calendário (admin)
  - `triggerLowCreditsAlerts` - Dispara alertas de créditos baixos (admin)

### 2. ✅ NotificationBell Component
- **Arquivo:** `client/src/components/NotificationBell.tsx`
- **Mudança:** 
  - ❌ Removido `useWebSocket()`
  - ✅ Implementado polling com `trpc.notifications.list.useQuery`
  - ✅ Atualiza a cada 5 segundos (`refetchInterval: 5000`)
  - ✅ Mantém todas funcionalidades (toast, som, badges)

### 3. ✅ Estrutura Vercel
- **Arquivo:** `api/index.ts` (NOVO)
- **Conteúdo:** Entry point para Vercel Serverless Functions
- **Adapta:** Express app para ambiente serverless

### 4. ✅ Configuração Vercel
- **Arquivo:** `vercel.json` (NOVO)
- **Configurações:**
  - Build command: `pnpm build`
  - Output directory: `dist`
  - Functions timeout: 30s
  - Rewrites para API routes
  - CORS headers

### 5. ✅ Package.json
- **Scripts adicionados:**
  - `build:vercel` - Build otimizado para Vercel
  - `vercel:dev` - Desenvolvimento local com Vercel CLI

### 6. ✅ Arquivos de Configuração
- **`.vercelignore`** - Arquivos ignorados no deploy
- **`GUIA_MIGRACAO_VERCEL.md`** - Guia completo de migração

---

## 📋 Próximos Passos

### 1. Instalar Vercel CLI
```bash
npm i -g vercel
```

### 2. Conectar Projeto
```bash
vercel login
vercel
```

### 3. Configurar Variáveis de Ambiente
No Vercel Dashboard → Settings → Environment Variables

**Obrigatórias:**
- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NODE_ENV` = `production`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 4. Integração Supabase (Opcional mas Recomendado)
- Supabase Dashboard → Settings → Integrations → Vercel
- Conecta automaticamente e sincroniza variáveis

### 5. Deploy
```bash
git add .
git commit -m "feat: migração para Vercel"
git push origin main
```

---

## ⚠️ Notas Importantes

### WebSocket → Polling
- **Antes:** Notificações em tempo real via WebSocket
- **Agora:** Polling a cada 5 segundos
- **Impacto:** Pequeno delay (aceitável)

### Chat
- **Já usava polling** - Sem mudanças necessárias
- **Funciona perfeitamente** no Vercel

### WhatsApp
- **Funciona normalmente** - Sem mudanças
- **API calls** funcionam em Serverless Functions

---

## 🎉 Benefícios

1. ✅ **Integração Supabase Automática**
2. ✅ **Melhor Performance** (CDN global)
3. ✅ **Deploy Mais Simples**
4. ✅ **Custo Otimizado**

---

## ✅ Status

- ✅ Router de notificações criado
- ✅ NotificationBell adaptado
- ✅ Estrutura Vercel criada
- ✅ Configuração Vercel criada
- ✅ Package.json atualizado
- ✅ Documentação criada

**Pronto para deploy!** 🚀


# ✅ Migração para Vercel - Resumo das Alterações

## 🎯 Alterações Realizadas

### 1. ✅ Router de Notificações (tRPC)
- **Arquivo:** `server/routers.ts`
- **Mudança:** Criado novo router `notifications` com endpoints:
  - `list` - Lista notificações do usuário
  - `unreadCount` - Conta notificações não lidas
  - `markAsRead` - Marca notificação como lida
  - `markAllAsRead` - Marca todas como lidas
  - `triggerVaccineAlerts` - Dispara alertas de vacina (admin)
  - `triggerCalendarReminders` - Dispara lembretes de calendário (admin)
  - `triggerLowCreditsAlerts` - Dispara alertas de créditos baixos (admin)

### 2. ✅ NotificationBell Component
- **Arquivo:** `client/src/components/NotificationBell.tsx`
- **Mudança:** 
  - ❌ Removido `useWebSocket()`
  - ✅ Implementado polling com `trpc.notifications.list.useQuery`
  - ✅ Atualiza a cada 5 segundos (`refetchInterval: 5000`)
  - ✅ Mantém todas funcionalidades (toast, som, badges)

### 3. ✅ Estrutura Vercel
- **Arquivo:** `api/index.ts` (NOVO)
- **Conteúdo:** Entry point para Vercel Serverless Functions
- **Adapta:** Express app para ambiente serverless

### 4. ✅ Configuração Vercel
- **Arquivo:** `vercel.json` (NOVO)
- **Configurações:**
  - Build command: `pnpm build`
  - Output directory: `dist`
  - Functions timeout: 30s
  - Rewrites para API routes
  - CORS headers

### 5. ✅ Package.json
- **Scripts adicionados:**
  - `build:vercel` - Build otimizado para Vercel
  - `vercel:dev` - Desenvolvimento local com Vercel CLI

### 6. ✅ Arquivos de Configuração
- **`.vercelignore`** - Arquivos ignorados no deploy
- **`GUIA_MIGRACAO_VERCEL.md`** - Guia completo de migração

---

## 📋 Próximos Passos

### 1. Instalar Vercel CLI
```bash
npm i -g vercel
```

### 2. Conectar Projeto
```bash
vercel login
vercel
```

### 3. Configurar Variáveis de Ambiente
No Vercel Dashboard → Settings → Environment Variables

**Obrigatórias:**
- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NODE_ENV` = `production`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 4. Integração Supabase (Opcional mas Recomendado)
- Supabase Dashboard → Settings → Integrations → Vercel
- Conecta automaticamente e sincroniza variáveis

### 5. Deploy
```bash
git add .
git commit -m "feat: migração para Vercel"
git push origin main
```

---

## ⚠️ Notas Importantes

### WebSocket → Polling
- **Antes:** Notificações em tempo real via WebSocket
- **Agora:** Polling a cada 5 segundos
- **Impacto:** Pequeno delay (aceitável)

### Chat
- **Já usava polling** - Sem mudanças necessárias
- **Funciona perfeitamente** no Vercel

### WhatsApp
- **Funciona normalmente** - Sem mudanças
- **API calls** funcionam em Serverless Functions

---

## 🎉 Benefícios

1. ✅ **Integração Supabase Automática**
2. ✅ **Melhor Performance** (CDN global)
3. ✅ **Deploy Mais Simples**
4. ✅ **Custo Otimizado**

---

## ✅ Status

- ✅ Router de notificações criado
- ✅ NotificationBell adaptado
- ✅ Estrutura Vercel criada
- ✅ Configuração Vercel criada
- ✅ Package.json atualizado
- ✅ Documentação criada

**Pronto para deploy!** 🚀





=======
>>>>>>> Incoming (Background Agent changes)
