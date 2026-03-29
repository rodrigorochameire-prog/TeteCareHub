# Sprint 4 — Mapa de Ocupação + Atividades

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mapa de ocupação visual com grid de vagas + sistema de atividades registráveis no check-out e visualizáveis no hub.

**Architecture:** Novas tabelas activities, pet_activity_logs, daycare_settings. Card de ocupação no dashboard + página dedicada com grid. Atividades integradas no check-out dialog e tab comportamento.

**Tech Stack:** Next.js 14, tRPC, Drizzle ORM, shadcn/ui

---

## File Structure

### New Files

```
src/lib/db/
  schema-activities.ts                — Tabelas activities, pet_activity_logs, daycare_settings

src/lib/validations/
  activities.ts                       — Zod schemas

src/lib/trpc/routers/
  activities.ts                       — CRUD atividades + logs
  occupancy.ts                        — Query ocupação + settings capacidade

src/app/(dashboard)/admin/
  occupancy/page.tsx                  — Página mapa de ocupação

src/components/occupancy/
  occupancy-card.tsx                  — Card resumo para dashboard
  occupancy-grid.tsx                  — Grid visual de vagas

src/components/pet-hub/dialogs/
  add-activity-dialog.tsx             — Dialog adicionar atividade
```

### Modified Files

```
src/lib/db/index.ts                   — Exportar novas tabelas
src/lib/trpc/routers/index.ts         — Registrar novos routers
src/lib/validations.ts                — Exportar novas validations
src/components/calendar/calendar-checkout-dialog.tsx — Adicionar seção atividades
src/components/pet-hub/pet-behavior-tab.tsx — Adicionar seção atividades recentes
src/app/(dashboard)/admin/page.tsx    — Adicionar card ocupação no dashboard
src/components/layouts/admin-sidebar.tsx — Link ocupação
```

---

## Task 1: Schema + Validations + Routers

**Files:**
- Create: `src/lib/db/schema-activities.ts`
- Create: `src/lib/validations/activities.ts`
- Create: `src/lib/trpc/routers/activities.ts`
- Create: `src/lib/trpc/routers/occupancy.ts`
- Modify: `src/lib/db/index.ts`, `src/lib/validations.ts`, `src/lib/trpc/routers/index.ts`

Schema, validations e routers juntos (escopo pequeno).

### Schema
- `activities`: id, name, icon, isActive, displayOrder, createdAt
- `petActivityLogs`: id, petId, activityId, customName, logDate, notes, createdById, createdAt
- `daycareSettings`: id, key (unique), value, updatedAt

### Validations
- createActivitySchema: name, icon?, displayOrder?
- updateActivitySchema: id, name?, icon?, isActive?, displayOrder?
- logActivitySchema: petId, activityId?, customName?, logDate, notes?
- updateSettingSchema: key, value

### Routers

**activities router:**
- `list` (admin) — listar ativas, ordenadas por displayOrder
- `listAll` (admin) — listar todas (ativas + inativas)
- `create` (admin) — criar atividade
- `update` (admin) — atualizar
- `toggle` (admin) — ativar/desativar
- `logActivity` (protected) — registrar atividade do pet
- `logMultiple` (protected) — registrar várias atividades de uma vez (para check-out)
- `getByPet` (protected) — histórico de atividades de um pet, agrupadas por data
- `getByDate` (admin) — atividades de todos os pets num dia

**occupancy router:**
- `current` (admin) — pets checked-in + capacidade. Usa checkin.list + daycare_settings
- `getCapacity` (admin) — retorna max_capacity de daycare_settings
- `setCapacity` (admin) — atualiza max_capacity

### Migração via MCP + seed

Seed: 7 atividades default + setting max_capacity=15

### Commit
```bash
git commit -am "feat: add activities, occupancy schema, validations and routers"
```

---

## Task 2: Componentes de Ocupação + Página

**Files:**
- Create: `src/components/occupancy/occupancy-card.tsx`
- Create: `src/components/occupancy/occupancy-grid.tsx`
- Create: `src/app/(dashboard)/admin/occupancy/page.tsx`
- Modify: `src/app/(dashboard)/admin/page.tsx`
- Modify: `src/components/layouts/admin-sidebar.tsx`

### occupancy-card.tsx
Card para o dashboard:
- Barra de progresso (ocupados/capacidade)
- Cores: verde <70%, amarelo 70-90%, vermelho >90%
- Lista compacta dos pets presentes (avatar + nome)
- Link "Ver mapa"
- Props: `{ occupied: number, capacity: number, pets: Array<{id, name, photoUrl}> }`

### occupancy-grid.tsx
Grid visual de vagas:
- CSS grid responsivo
- Cada slot: card com avatar+nome do pet ou "Livre" com ícone Plus
- Slot vazio clicável → onCheckin callback
- Slot ocupado clicável → onCheckout(petId, petName) callback
- Props: `{ capacity, pets, onCheckin, onCheckout }`

### Página /admin/occupancy
- Query: `trpc.occupancy.current` + `trpc.occupancy.getCapacity`
- OccupancyGrid no centro
- Check-in/out dialogs (reusar calendar-checkin-dialog e calendar-checkout-dialog)
- Card resumo no topo: capacidade, ocupados, livres
- Botão "Alterar capacidade" → dialog simples com input numérico

### Dashboard
Leia `src/app/(dashboard)/admin/page.tsx`. Adicionar OccupancyCard na grid de stats.

### Sidebar
Adicionar "Ocupação" no grupo "Operacional" com ícone LayoutGrid.

### Commit
```bash
git commit -am "feat: add occupancy card, grid, page + dashboard integration"
```

---

## Task 3: Atividades no Check-out + Tab Comportamento

**Files:**
- Create: `src/components/pet-hub/dialogs/add-activity-dialog.tsx`
- Modify: `src/components/calendar/calendar-checkout-dialog.tsx`
- Modify: `src/components/pet-hub/pet-behavior-tab.tsx`

### add-activity-dialog.tsx
Dialog para adicionar atividade avulsa (fora do check-out):
- Select de atividade (pré-definidas) + campo customizado
- Data, notas
- Submit: `trpc.activities.logActivity`

### Modificar check-out dialog
Ler `src/components/calendar/calendar-checkout-dialog.tsx`. Adicionar seção "Atividades do dia":
- Query `trpc.activities.list` para listar atividades disponíveis
- Checkboxes para cada atividade
- Campo texto "Outra atividade" para customizada
- No submit do check-out: chamar `trpc.activities.logMultiple` com as selecionadas

### Tab Comportamento
Ler `src/components/pet-hub/pet-behavior-tab.tsx`. Adicionar seção "Atividades Recentes" no topo:
- Query `trpc.activities.getByPet({ petId })`
- Agrupar por data
- Cada dia: lista de atividades com ícone + nome + notas
- Botão "Adicionar atividade" usa AddActivityDialog

### Commit
```bash
git commit -am "feat: add activities to checkout flow + behavior tab history"
```

---

## Task 4: Migração DB + TypeScript check

- [ ] Migração via MCP (tables + seed)
- [ ] `npx tsc --noEmit` — zero errors
- [ ] Smoke test
- [ ] Commit final
