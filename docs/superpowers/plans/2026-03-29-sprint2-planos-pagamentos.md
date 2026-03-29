# Sprint 2 — Planos, Pagamentos e Edição Inline

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sistema completo de planos customizáveis, fluxo de pagamento com comprovante (tutor→admin), edição inline com toggle, e controle de faltas.

**Architecture:** Novas tabelas `plans`, `pet_plans`, `payment_requests` + routers tRPC + dialogs no hub + página admin de pagamentos. Reutiliza storage Supabase existente para comprovantes e sistema de notificações existente.

**Tech Stack:** Next.js 14 (App Router), Drizzle ORM, tRPC, shadcn/ui, Supabase Storage, Zod

---

## File Structure

### New Files

```
src/lib/db/
  schema-plans.ts                    — Tabelas plans, pet_plans, payment_requests

src/lib/validations/
  plans.ts                           — Zod schemas para planos e pagamentos

src/lib/trpc/routers/
  plans-management.ts                — CRUD planos base + atribuição pet_plans
  payment-requests.ts                — Fluxo solicitação/aprovação de pagamento

src/components/pet-hub/
  inline-edit.tsx                     — Componente InlineEdit reutilizável
  dialogs/assign-plan-dialog.tsx      — Dialog para atribuir/alterar plano do pet
  dialogs/register-payment-dialog.tsx — Dialog admin registrar pagamento manual
  dialogs/request-credits-dialog.tsx  — Dialog tutor solicitar créditos com comprovante
  dialogs/mark-absence-dialog.tsx     — Dialog admin marcar falta

src/app/(dashboard)/admin/
  plans/page.tsx                      — Reescrever página de planos (era placeholder)
  payments/page.tsx                   — Nova página de solicitações de pagamento

src/app/(dashboard)/tutor/
  payments/page.tsx                   — Histórico de pagamentos do tutor
```

### Modified Files

```
src/lib/db/schema.ts                 — Adicionar absenceType em daily_logs
src/lib/db/index.ts                  — Exportar novas tabelas
src/lib/trpc/routers/index.ts        — Registrar novos routers
src/components/pet-hub/pet-hub-page.tsx — Adicionar toggle modo edição
src/components/pet-hub/pet-hub-header.tsx — InlineEdit no nome e peso
src/components/pet-hub/pet-general-tab.tsx — Card créditos atualizado com plano real + InlineEdit
src/components/layouts/admin-sidebar.tsx — Link pagamentos + badge pendentes
```

---

## Task 1: Schema — plans, pet_plans, payment_requests

**Files:**
- Create: `src/lib/db/schema-plans.ts`
- Modify: `src/lib/db/schema.ts`
- Modify: `src/lib/db/index.ts`

- [ ] **Step 1: Criar schema de planos**

Criar `src/lib/db/schema-plans.ts`:

```typescript
import { pgTable, serial, varchar, integer, boolean, text, timestamp, date, index } from "drizzle-orm/pg-core";
import { users, pets } from "./schema";

export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 20 }).notNull().default("avulso"),
  includedDays: integer("included_days").notNull().default(0),
  price: integer("price").notNull().default(0),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("plans_is_active_idx").on(table.isActive),
]);

export type Plan = typeof plans.$inferSelect;
export type InsertPlan = typeof plans.$inferInsert;

export const petPlans = pgTable("pet_plans", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull().references(() => pets.id, { onDelete: "cascade" }),
  planId: integer("plan_id").notNull().references(() => plans.id),
  customName: varchar("custom_name", { length: 100 }),
  customDays: integer("custom_days"),
  customPrice: integer("custom_price"),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  startDate: date("start_date"),
  renewalDay: integer("renewal_day"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("pet_plans_pet_id_idx").on(table.petId),
  index("pet_plans_status_idx").on(table.status),
]);

export type PetPlan = typeof petPlans.$inferSelect;
export type InsertPetPlan = typeof petPlans.$inferInsert;

export const paymentRequests = pgTable("payment_requests", {
  id: serial("id").primaryKey(),
  petPlanId: integer("pet_plan_id").references(() => petPlans.id),
  petId: integer("pet_id").notNull().references(() => pets.id, { onDelete: "cascade" }),
  tutorId: integer("tutor_id").notNull().references(() => users.id),
  amount: integer("amount").notNull().default(0),
  daysRequested: integer("days_requested").notNull().default(0),
  method: varchar("method", { length: 20 }).notNull(),
  proofUrl: text("proof_url"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  adminNotes: text("admin_notes"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("payment_requests_status_idx").on(table.status),
  index("payment_requests_pet_id_idx").on(table.petId),
  index("payment_requests_tutor_id_idx").on(table.tutorId),
]);

export type PaymentRequest = typeof paymentRequests.$inferSelect;
export type InsertPaymentRequest = typeof paymentRequests.$inferInsert;
```

- [ ] **Step 2: Adicionar absenceType em daily_logs**

Em `src/lib/db/schema.ts`, na tabela `dailyLogs`, adicionar:

```typescript
absenceType: varchar("absence_type", { length: 20 }),
```

- [ ] **Step 3: Exportar novas tabelas**

Em `src/lib/db/index.ts`, adicionar:

```typescript
export * from "./schema-plans";
```

- [ ] **Step 4: Aplicar migração via Supabase MCP**

Usar `mcp__claude_ai_Supabase__apply_migration` com o SQL das novas tabelas + ALTER TABLE daily_logs.

- [ ] **Step 5: Commit**

```bash
git add src/lib/db/
git commit -m "feat: add plans, pet_plans, payment_requests tables + absenceType"
```

---

## Task 2: Validations Zod

**Files:**
- Create: `src/lib/validations/plans.ts`
- Modify: `src/lib/validations.ts`

- [ ] **Step 1: Criar schemas**

Criar `src/lib/validations/plans.ts`:

```typescript
import { z } from "zod";

export const planTypeSchema = z.enum(["mensalista", "avulso", "diaria"]);

export const createPlanSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(100),
  type: planTypeSchema,
  includedDays: z.number().int().min(0),
  price: z.number().int().min(0),
  description: z.string().max(500).optional(),
});

export const updatePlanSchema = createPlanSchema.partial().extend({
  id: z.number().int().positive(),
  isActive: z.boolean().optional(),
});

export const assignPetPlanSchema = z.object({
  petId: z.number().int().positive(),
  planId: z.number().int().positive(),
  customName: z.string().max(100).optional(),
  customDays: z.number().int().min(0).optional(),
  customPrice: z.number().int().min(0).optional(),
  startDate: z.string().optional(),
  renewalDay: z.number().int().min(1).max(31).optional(),
  notes: z.string().max(1000).optional(),
});

export const paymentRequestSchema = z.object({
  petId: z.number().int().positive(),
  amount: z.number().int().min(0),
  daysRequested: z.number().int().min(1),
  method: z.enum(["pix", "cartao", "dinheiro", "transferencia"]),
  proofUrl: z.string().optional(),
});

export const reviewPaymentSchema = z.object({
  id: z.number().int().positive(),
  action: z.enum(["approve", "reject"]),
  adminNotes: z.string().max(500).optional(),
});

export const registerManualPaymentSchema = z.object({
  petId: z.number().int().positive(),
  days: z.number().int().min(1),
  amount: z.number().int().min(0),
  method: z.enum(["pix", "cartao", "dinheiro", "transferencia"]),
  notes: z.string().max(500).optional(),
});

export const markAbsenceSchema = z.object({
  petId: z.number().int().positive(),
  date: z.string(),
  absenceType: z.enum(["falta", "feriado", "cancelado"]),
  notes: z.string().max(500).optional(),
});
```

- [ ] **Step 2: Exportar**

Em `src/lib/validations.ts`, adicionar:

```typescript
export * from "./validations/plans";
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/validations/
git commit -m "feat: add Zod schemas for plans, payments, absences"
```

---

## Task 3: tRPC Routers — plans-management + payment-requests

**Files:**
- Create: `src/lib/trpc/routers/plans-management.ts`
- Create: `src/lib/trpc/routers/payment-requests.ts`
- Modify: `src/lib/trpc/routers/index.ts`

- [ ] **Step 1: Router de planos**

Criar `src/lib/trpc/routers/plans-management.ts` com procedures:
- `listPlans` (admin) — listar planos base
- `createPlan` (admin) — criar plano
- `updatePlan` (admin) — atualizar plano
- `togglePlan` (admin) — ativar/desativar
- `assignToPet` (admin) — atribuir plano a pet (cria pet_plans)
- `getPetPlan` (protected) — buscar plano ativo de um pet
- `updatePetPlan` (admin) — atualizar customizações do pet_plans

Seguir padrão dos routers existentes: `safeAsync`, `Errors`, `adminProcedure`/`protectedProcedure`.

Read `src/lib/trpc/routers/credits.ts` first to match exact patterns.

- [ ] **Step 2: Router de pagamentos**

Criar `src/lib/trpc/routers/payment-requests.ts` com procedures:
- `create` (protected) — tutor cria solicitação com comprovante
- `listPending` (admin) — listar pendentes
- `listByTutor` (protected) — histórico do tutor
- `listByPet` (protected) — histórico por pet
- `review` (admin) — aprovar/rejeitar
  - Se aprovar: atualiza status, cria transaction, incrementa pets.credits (UPDATE credits = credits + N), cria notificação para tutor
  - Se rejeitar: atualiza status, cria notificação com motivo
- `registerManual` (admin) — registro manual sem aprovação

Use `db.update(pets).set({ credits: sql\`credits + ${days}\` })` para operação atômica nos créditos.

Use `notifications.send` pattern to create notifications.

- [ ] **Step 3: Registrar no index**

Em `src/lib/trpc/routers/index.ts`:

```typescript
import { plansManagementRouter } from "./plans-management";
import { paymentRequestsRouter } from "./payment-requests";

// Inside router({...}):
plansManagement: plansManagementRouter,
paymentRequests: paymentRequestsRouter,
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/trpc/routers/
git commit -m "feat: add plans-management and payment-requests tRPC routers"
```

---

## Task 4: Componente InlineEdit + Toggle modo edição

**Files:**
- Create: `src/components/pet-hub/inline-edit.tsx`
- Modify: `src/components/pet-hub/pet-hub-page.tsx`
- Modify: `src/components/pet-hub/pet-hub-header.tsx`

- [ ] **Step 1: Criar componente InlineEdit**

Criar `src/components/pet-hub/inline-edit.tsx`:

```typescript
"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface InlineEditProps {
  petId: number;
  field: string;
  value: string | number | null | undefined;
  editable: boolean;
  type?: "text" | "number";
  format?: (v: any) => string;
  className?: string;
  onSaved?: () => void;
}

export function InlineEdit({
  petId,
  field,
  value,
  editable,
  type = "text",
  format,
  className,
  onSaved,
}: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(value ?? ""));
  const inputRef = useRef<HTMLInputElement>(null);

  const updatePet = trpc.pets.update.useMutation({
    onSuccess: () => {
      toast.success("Salvo!");
      setEditing(false);
      onSaved?.();
    },
    onError: (err) => toast.error(err.message),
  });

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const displayValue = format ? format(value) : String(value ?? "—");

  const handleSave = () => {
    const newValue = type === "number" ? Number(inputValue) : inputValue;
    if (newValue === value) {
      setEditing(false);
      return;
    }
    updatePet.mutate({ id: petId, [field]: newValue });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setInputValue(String(value ?? ""));
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <Input
        ref={inputRef}
        type={type}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="h-7 text-sm w-auto min-w-[60px]"
        disabled={updatePet.isPending}
      />
    );
  }

  return (
    <span
      className={cn(
        className,
        editable && "border-b border-dashed border-primary/30 cursor-pointer hover:border-primary/60 transition-colors"
      )}
      onClick={() => editable && setEditing(true)}
    >
      {displayValue}
    </span>
  );
}
```

- [ ] **Step 2: Toggle modo edição no PetHubPage**

Em `src/components/pet-hub/pet-hub-page.tsx`:
- Add `useState` for `isEditMode`
- Add toggle button next to tabs: "Editar" (Pencil) / "Concluir" (Check)
- Only visible for role=admin
- Pass `isEditMode` as prop to PetHubHeader and tab components

- [ ] **Step 3: InlineEdit no header**

Em `src/components/pet-hub/pet-hub-header.tsx`:
- Add `isEditMode` prop
- Wrap pet name with `<InlineEdit field="name" editable={isEditMode} />`
- Wrap weight value with `<InlineEdit field="weight" type="number" editable={isEditMode} />`

- [ ] **Step 4: Commit**

```bash
git add src/components/pet-hub/
git commit -m "feat: add InlineEdit component + edit mode toggle in hub"
```

---

## Task 5: Dialogs — Atribuir plano, Registrar pagamento, Solicitar créditos, Marcar falta

**Files:**
- Create: `src/components/pet-hub/dialogs/assign-plan-dialog.tsx`
- Create: `src/components/pet-hub/dialogs/register-payment-dialog.tsx`
- Create: `src/components/pet-hub/dialogs/request-credits-dialog.tsx`
- Create: `src/components/pet-hub/dialogs/mark-absence-dialog.tsx`

- [ ] **Step 1: Dialog atribuir plano (admin)**

`assign-plan-dialog.tsx`:
- Select de planos ativos (`trpc.plansManagement.listPlans`)
- Ao selecionar: preenche diárias e valor automaticamente
- Campos editáveis: customDays, customPrice, startDate, renewalDay, notes
- Submit: `trpc.plansManagement.assignToPet.useMutation()`

- [ ] **Step 2: Dialog registrar pagamento manual (admin)**

`register-payment-dialog.tsx`:
- Campos: diárias, valor (em reais, converter para centavos), método (select), observação
- Submit: `trpc.paymentRequests.registerManual.useMutation()`
- On success: toast + refetch

- [ ] **Step 3: Dialog solicitar créditos (tutor)**

`request-credits-dialog.tsx`:
- Campos: diárias desejadas, valor, método (select), upload comprovante
- Upload usa `uploadDocument` de `@/lib/supabase/storage`
- Submit: `trpc.paymentRequests.create.useMutation()`

- [ ] **Step 4: Dialog marcar falta (admin)**

`mark-absence-dialog.tsx`:
- Campos: data, tipo (falta/feriado/cancelado), observação
- Submit: cria daily_log com absenceType + decrementa pet.credits
- Uses a dedicated tRPC procedure or combines `logs.create` + `credits.removeFromPet`

- [ ] **Step 5: Commit**

```bash
git add src/components/pet-hub/dialogs/
git commit -m "feat: add plan, payment, credits, absence dialogs"
```

---

## Task 6: Atualizar card Plano e Créditos no hub

**Files:**
- Modify: `src/components/pet-hub/pet-general-tab.tsx`

- [ ] **Step 1: Atualizar card com dados reais**

O card "Plano e Créditos" atualmente estima o tipo de plano pelo saldo. Atualizar para:
- Buscar `trpc.plansManagement.getPetPlan.useQuery({ petId })` para dados reais do plano
- Mostrar: nome do plano (real ou customizado), diárias incluídas, valor, status
- Mostrar: diárias usadas / total (se mensalista), incluindo contagem de faltas
- Botões:
  - Admin: "Alterar plano" (AssignPlanDialog) + "Registrar pagamento" (RegisterPaymentDialog) + "Marcar falta" (MarkAbsenceDialog)
  - Tutor: "Adicionar créditos" (RequestCreditsDialog)
- InlineEdit no crédito (admin, quando modo edição ativo)

- [ ] **Step 2: Commit**

```bash
git add src/components/pet-hub/pet-general-tab.tsx
git commit -m "feat: update credits card with real plan data + action buttons"
```

---

## Task 7: Páginas admin e tutor

**Files:**
- Rewrite: `src/app/(dashboard)/admin/plans/page.tsx`
- Create: `src/app/(dashboard)/admin/payments/page.tsx`
- Create: `src/app/(dashboard)/tutor/payments/page.tsx`
- Modify: `src/components/layouts/admin-sidebar.tsx`

- [ ] **Step 1: Reescrever página de planos**

`/admin/plans/page.tsx` — CRUD completo:
- Listagem de planos em cards/tabela
- Dialog criar plano (nome, tipo, diárias, valor, descrição)
- Editar plano inline ou dialog
- Toggle ativar/desativar
- Indicador de quantos pets usam cada plano

- [ ] **Step 2: Página de pagamentos admin**

`/admin/payments/page.tsx`:
- Tab "Pendentes" — lista solicitações pendentes com:
  - Info do tutor, pet, valor, diárias, método
  - Botão ver comprovante (abre imagem/PDF)
  - Botões Aprovar / Rejeitar
- Tab "Histórico" — todas as solicitações com filtros (status, pet, período)

- [ ] **Step 3: Página de pagamentos tutor**

`/tutor/payments/page.tsx`:
- Lista de solicitações do tutor com status (pendente/aprovado/rejeitado)
- Botão "Nova solicitação" (abre RequestCreditsDialog para um pet)
- Visualização do comprovante enviado
- Filtro por pet

- [ ] **Step 4: Sidebar — adicionar link + badge**

Em `admin-sidebar.tsx`:
- Adicionar "Pagamentos" no grupo "Financeiro" com ícone `Receipt`
- Badge com contagem de pendentes (usar `trpc.paymentRequests.listPending` count)

- [ ] **Step 5: Commit**

```bash
git add src/app/ src/components/layouts/
git commit -m "feat: admin plans page, payments pages (admin + tutor), sidebar badge"
```

---

## Task 8: Migração de banco + Smoke test

- [ ] **Step 1: Aplicar migração via MCP**

SQL para executar via `mcp__claude_ai_Supabase__apply_migration`:

```sql
-- plans
CREATE TABLE IF NOT EXISTS plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'avulso',
  included_days INTEGER NOT NULL DEFAULT 0,
  price INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS plans_is_active_idx ON plans(is_active);

-- pet_plans
CREATE TABLE IF NOT EXISTS pet_plans (
  id SERIAL PRIMARY KEY,
  pet_id INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  plan_id INTEGER NOT NULL REFERENCES plans(id),
  custom_name VARCHAR(100),
  custom_days INTEGER,
  custom_price INTEGER,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  start_date DATE,
  renewal_day INTEGER,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS pet_plans_pet_id_idx ON pet_plans(pet_id);
CREATE INDEX IF NOT EXISTS pet_plans_status_idx ON pet_plans(status);

-- payment_requests
CREATE TABLE IF NOT EXISTS payment_requests (
  id SERIAL PRIMARY KEY,
  pet_plan_id INTEGER REFERENCES pet_plans(id),
  pet_id INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  tutor_id INTEGER NOT NULL REFERENCES users(id),
  amount INTEGER NOT NULL DEFAULT 0,
  days_requested INTEGER NOT NULL DEFAULT 0,
  method VARCHAR(20) NOT NULL,
  proof_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS payment_requests_status_idx ON payment_requests(status);
CREATE INDEX IF NOT EXISTS payment_requests_pet_id_idx ON payment_requests(pet_id);
CREATE INDEX IF NOT EXISTS payment_requests_tutor_id_idx ON payment_requests(tutor_id);

-- absenceType em daily_logs
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS absence_type VARCHAR(20);
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit` — deve passar com zero erros.

- [ ] **Step 3: Testar fluxos**

1. Admin: criar plano em `/admin/plans` → atribuir a pet via hub → registrar pagamento manual
2. Tutor: solicitar créditos com comprovante → admin aprovar em `/admin/payments`
3. Edição inline: ativar modo edição → clicar no peso → editar → salvar
4. Marcar falta: admin marca falta → crédito decrementado

- [ ] **Step 4: Commit final**

```bash
git add .
git commit -m "feat: Sprint 2 complete — plans, payments, inline edit, absences"
```
