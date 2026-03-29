# Sprint 3 — Calendário Redesenhado + Notificações Automáticas

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Calendário geral com 3 visões (dia/semana/mês), filtros, check-in/out integrado + engine de notificações automáticas via cron com alertas no app e WhatsApp.

**Architecture:** Redesenha `/admin/calendar` com componente de visão alternável. Query unificada no backend agrega daily_logs, calendar_events, vaccinations, preventives, bookings. Engine de notificações via Vercel Cron + Inngest (já configurado) verifica vencimentos diariamente e dispara alertas.

**Tech Stack:** Next.js 14, tRPC, Drizzle ORM, Inngest (background jobs), WhatsAppService (já existente), Vercel Cron, shadcn/ui

---

## File Structure

### New Files

```
src/lib/db/
  schema-notifications.ts            — Tabelas notification_rules, notification_log

src/lib/validations/
  notifications-rules.ts             — Zod schemas

src/lib/trpc/routers/
  notification-rules.ts              — CRUD regras de notificação
  unified-calendar.ts                — Query unificada de eventos de todas as fontes

src/lib/services/
  notification-engine.ts             — Lógica do cron: verificar vencimentos, disparar alertas

src/app/api/cron/
  notifications/route.ts             — Endpoint do Vercel Cron

src/components/calendar/
  calendar-toolbar.tsx                — Barra de controles (visão, navegação, filtros)
  calendar-day-view.tsx               — Visão diária com timeline
  calendar-week-view.tsx              — Visão semanal com grid
  calendar-month-view.tsx             — Visão mensal com dots
  calendar-alerts-panel.tsx           — Painel de próximos vencimentos
  calendar-checkin-dialog.tsx         — Dialog check-in pelo calendário
  calendar-checkout-dialog.tsx        — Dialog check-out pelo calendário

src/app/(dashboard)/admin/
  settings/notifications/page.tsx     — Configuração de regras de notificação
```

### Modified Files

```
src/lib/db/index.ts                   — Exportar novas tabelas
src/lib/trpc/routers/index.ts         — Registrar novos routers
src/app/(dashboard)/admin/calendar/page.tsx — Reescrever com novo layout
src/components/pet-hub/pet-calendar-tab.tsx — Atualizar com alertas e formato melhorado
vercel.json                           — Adicionar cron job
src/components/layouts/admin-sidebar.tsx — Adicionar link configuração notificações
```

---

## Task 1: Schema — notification_rules + notification_log

**Files:**
- Create: `src/lib/db/schema-notifications.ts`
- Modify: `src/lib/db/index.ts`

- [ ] **Step 1: Criar schema**

Criar `src/lib/db/schema-notifications.ts` com tabelas `notificationRules` e `notificationLog` conforme spec. Seguir mesmo padrão de schema-plans.ts e schema-invitations.ts.

- [ ] **Step 2: Exportar em index.ts**

- [ ] **Step 3: Aplicar migração via MCP Supabase**

- [ ] **Step 4: Seed com regras padrão**

Via MCP SQL: inserir 4 regras padrão (vaccine 30d, preventive 7d, medication 3d, plan_renewal 5d).

- [ ] **Step 5: Commit**

```bash
git commit -am "feat: add notification_rules and notification_log tables"
```

---

## Task 2: Validations + Router de regras de notificação

**Files:**
- Create: `src/lib/validations/notifications-rules.ts`
- Create: `src/lib/trpc/routers/notification-rules.ts`
- Modify: `src/lib/validations.ts`
- Modify: `src/lib/trpc/routers/index.ts`

- [ ] **Step 1: Criar validations**

Schemas: `updateNotificationRuleSchema` (id, daysBeforeCustom, notifyApp, notifyWhatsapp, isActive).

- [ ] **Step 2: Criar router**

Procedures:
- `list` (admin) — listar todas as regras
- `update` (admin) — atualizar regra (dias, toggles app/whatsapp/ativo)
- `getActiveRules` (admin) — regras ativas para o cron

- [ ] **Step 3: Registrar**

- [ ] **Step 4: Commit**

```bash
git commit -am "feat: add notification rules router and validations"
```

---

## Task 3: Query unificada de calendário

**Files:**
- Create: `src/lib/trpc/routers/unified-calendar.ts`
- Modify: `src/lib/trpc/routers/index.ts`

- [ ] **Step 1: Criar router unified-calendar**

Uma query que agrega dados de múltiplas fontes e retorna formato padronizado:

```typescript
interface UnifiedCalendarEvent {
  id: string;           // "checkin-234", "vaccine-15"
  type: string;         // checkin, checkout, vaccine, preventive, medication, booking, event
  title: string;
  petId: number;
  petName: string;
  tutorName: string;
  startDate: string;    // ISO
  endDate?: string;     // ISO — para hospedagem
  startTime?: string;   // "08:30" — para creche
  endTime?: string;     // "17:00" — para creche
  color: string;        // por tipo
  status?: string;
  notes?: string;
}
```

Procedures:
- `getEvents` (admin) — input: { start, end, type?, petId?, tutorId? }. Agrega de:
  - `calendar_events` (checkin/checkout + eventos manuais)
  - `pet_vaccinations` (nextDueDate como eventos futuros)
  - `preventive_treatments` (nextDueDate)
  - `booking_requests` (aprovados, com startDate/endDate para hospedagem)
- `getAlerts` (admin) — próximos vencimentos (vacinas, preventivos) com status de urgência (verde/amarelo/vermelho)
- `getDaySummary` (admin) — input: { date }. Resumo: pets na creche, hospedados, eventos do dia

Para check-in/out: buscar pares de eventos checkin+checkout no mesmo dia para o mesmo pet e calcular startTime/endTime. Para hospedagem (booking type="hotel"): usar startDate/endDate do booking_requests.

- [ ] **Step 2: Registrar no index**

- [ ] **Step 3: Commit**

```bash
git commit -am "feat: add unified calendar query aggregating all event sources"
```

---

## Task 4: Notification engine (cron job)

**Files:**
- Create: `src/lib/services/notification-engine.ts`
- Create: `src/app/api/cron/notifications/route.ts`
- Modify: `vercel.json`

- [ ] **Step 1: Criar notification engine**

`notification-engine.ts` — função `runNotificationCheck()`:
1. Buscar regras ativas de `notification_rules`
2. Para cada regra, calcular data alvo: `hoje + (daysBeforeCustom ?? daysBeforeDefault)`
3. Por tipo:
   - `vaccine`: buscar `pet_vaccinations` onde `nextDueDate` = data alvo
   - `preventive`: buscar `preventive_treatments` onde `nextDueDate` = data alvo
   - `plan_renewal`: buscar `pet_plans` (mensalista) onde `renewalDay` = dia do mês alvo
4. Para cada match: verificar `notification_log` se já enviado (referenceType+referenceId+userId)
5. Se não enviado:
   - Se `notifyApp`: criar notificação via `db.insert(notifications)` para admin e tutor(s) do pet
   - Se `notifyWhatsapp`: usar Inngest para disparar evento `alert/vaccine.due` ou similar (já existe)
6. Registrar em `notification_log`

- [ ] **Step 2: Criar endpoint cron**

`/api/cron/notifications/route.ts`:
- GET handler
- Verificar `CRON_SECRET` header
- Chamar `runNotificationCheck()`
- Retornar resultado

- [ ] **Step 3: Configurar vercel.json**

Adicionar ao array `crons`:
```json
{ "path": "/api/cron/notifications", "schedule": "0 8 * * *" }
```
Executa todo dia às 8h UTC (5h Brasília).

- [ ] **Step 4: Commit**

```bash
git commit -am "feat: add notification engine cron job for automatic alerts"
```

---

## Task 5: Componentes do calendário redesenhado

**Files:**
- Create: `src/components/calendar/calendar-toolbar.tsx`
- Create: `src/components/calendar/calendar-day-view.tsx`
- Create: `src/components/calendar/calendar-week-view.tsx`
- Create: `src/components/calendar/calendar-month-view.tsx`
- Create: `src/components/calendar/calendar-alerts-panel.tsx`
- Create: `src/components/calendar/calendar-checkin-dialog.tsx`
- Create: `src/components/calendar/calendar-checkout-dialog.tsx`

- [ ] **Step 1: Toolbar**

`calendar-toolbar.tsx`:
- Toggle visão: Dia | Semana | Mês (Tabs ou ToggleGroup)
- Navegação: ← | Hoje | →
- Label do período atual (ex: "29 de março de 2026", "24-30 mar 2026", "Março 2026")
- Filtros: tipo (multi-select), pet (select com busca), tutor (select)
- Props: `{ view, onViewChange, date, onDateChange, filters, onFiltersChange }`

- [ ] **Step 2: Visão diária**

`calendar-day-view.tsx`:
- Timeline vertical 6h-20h com slots de 30min
- Cada pet na creche: barra horizontal colorida (entrada → saída) com nome do pet
- Hospedagem: barra destaque com ícone de lua, mostrando "Dia X/Y" e intervalo data+hora
- Creche: mostra "08:30 → 17:00" no bloco
- Slot vazio clicável → abre check-in dialog
- Pet na creche clicável → abre check-out dialog
- Props: `{ events: UnifiedCalendarEvent[], date: Date, onCheckin, onCheckout }`

- [ ] **Step 3: Visão semanal**

`calendar-week-view.tsx`:
- Grid 7 colunas com dias da semana
- Cada dia: lista de events como cards compactos
- Hospedagem: barra que cruza múltiplos dias
- Cores por tipo de evento

- [ ] **Step 4: Visão mensal**

`calendar-month-view.tsx`:
- Grid de dias do mês
- Dots coloridos por tipo de evento em cada dia
- Contagem de pets por dia
- Clicar num dia → muda para visão diária daquele dia

- [ ] **Step 5: Painel de alertas**

`calendar-alerts-panel.tsx`:
- Cards compactos: pet, tipo (vacina/preventivo), data, dias restantes
- Cores: verde (>7d), amarelo (3-7d), vermelho (<3d ou vencido)
- Botão "Notificar agora" → chama WhatsApp service diretamente
- Props: `{ alerts: AlertItem[] }`

- [ ] **Step 6: Dialogs check-in/out**

`calendar-checkin-dialog.tsx`: select pet, hora, observações → `trpc.checkin.checkIn`
`calendar-checkout-dialog.tsx`: hora saída, observações → `trpc.checkin.checkOut`

- [ ] **Step 7: Commit**

```bash
git commit -am "feat: add calendar components — toolbar, 3 views, alerts, checkin/out dialogs"
```

---

## Task 6: Reescrever página do calendário admin

**Files:**
- Rewrite: `src/app/(dashboard)/admin/calendar/page.tsx`

- [ ] **Step 1: Reescrever página**

Nova página usando os componentes criados:
- State: view (day/week/month), date, filters
- Queries: `trpc.unifiedCalendar.getEvents`, `trpc.unifiedCalendar.getAlerts`, `trpc.unifiedCalendar.getDaySummary`
- Layout: AlertsPanel no topo → Toolbar → View component
- Resumo na visão diária: "X pets na creche · Y hospedados · Z vacinas vencendo"

IMPORTANT: Read the current page first to preserve any useful functionality.

- [ ] **Step 2: Commit**

```bash
git commit -am "feat: redesign admin calendar page with 3 views and unified data"
```

---

## Task 7: Atualizar tab calendário do pet hub

**Files:**
- Modify: `src/components/pet-hub/pet-calendar-tab.tsx`

- [ ] **Step 1: Melhorar tab**

- Adicionar alertas de vencimento no topo (vacinas/preventivos do pet)
- Melhorar mini calendário com dots por tipo
- Mostrar check-ins recentes com horários (creche: entrada/saída, hospedagem: período)
- Manter funcionalidade existente (add event dialog, delete)

- [ ] **Step 2: Commit**

```bash
git commit -am "feat: improve pet hub calendar tab with alerts and check-in times"
```

---

## Task 8: Página de configuração de notificações

**Files:**
- Create: `src/app/(dashboard)/admin/settings/notifications/page.tsx`
- Modify: `src/components/layouts/admin-sidebar.tsx`

- [ ] **Step 1: Criar página**

Lista de regras de notificação:
- Cada regra em um card: tipo, dias de antecedência (editável), toggles app/whatsapp/ativo
- Salvar alterações via `trpc.notificationRules.update`

Read `src/lib/trpc/routers/notification-rules.ts` for exact procedure names.

- [ ] **Step 2: Sidebar**

Adicionar "Notificações" no grupo "Configurações" ou "Comunicação" com ícone Bell.

- [ ] **Step 3: Commit**

```bash
git commit -am "feat: add notification rules config page + sidebar link"
```

---

## Task 9: Migração DB + TypeScript check

- [ ] **Step 1: Migração via MCP**

SQL para notification_rules e notification_log + seed das 4 regras padrão.

- [ ] **Step 2: TypeScript check**

`npx tsc --noEmit` — zero errors.

- [ ] **Step 3: Smoke test**

1. Admin: `/admin/calendar` → alternar entre dia/semana/mês
2. Filtrar por tipo e por pet
3. Check-in via calendário
4. Verificar alertas de vencimento no painel
5. `/admin/settings/notifications` → ajustar regras
6. Cron: `curl -H "Authorization: Bearer CRON_SECRET" localhost:3004/api/cron/notifications`

- [ ] **Step 4: Commit final**

```bash
git commit -am "feat: Sprint 3 complete — calendar redesign, notification engine"
```
