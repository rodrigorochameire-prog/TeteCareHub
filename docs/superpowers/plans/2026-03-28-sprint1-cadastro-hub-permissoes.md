# Sprint 1 — Cadastro Unificado + Ficha Hub + Permissoes

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar fluxo de convite admin→tutor, ficha do pet como hub com tabs, e sistema de permissoes que protege dados do admin.

**Architecture:** Camada sobre o existente — novas rotas, tabelas e componentes sem alterar paginas atuais. Routers tRPC existentes reutilizados nas tabs. Middleware `enforceOwnership` centraliza logica de permissao.

**Tech Stack:** Next.js 14 (App Router), Drizzle ORM, tRPC, Clerk Backend SDK, shadcn/ui, Zod, PostgreSQL (Supabase)

---

## File Structure

### New Files

```
src/lib/db/
  schema-invitations.ts          — Tabela invitations + enums

src/lib/trpc/routers/
  invitations.ts                 — CRUD de convites (admin)
  invite-public.ts               — Router publico para onboarding do tutor

src/lib/trpc/middleware/
  enforce-ownership.ts           — Middleware de protecao source/created_by

src/lib/validations/
  invitation.ts                  — Zod schemas para convites e onboarding

src/app/invite/[token]/
  page.tsx                       — Wizard de onboarding (4 passos)
  layout.tsx                     — Layout publico (sem sidebar)

src/components/invite/
  invite-wizard.tsx              — Componente wizard principal
  step-tutor-data.tsx            — Passo 1: dados do tutor
  step-pets-data.tsx             — Passo 2: complementar pets
  step-plan-review.tsx           — Passo 3: revisar plano
  step-confirmation.tsx          — Passo 4: confirmacao

src/components/pet-hub/
  pet-hub-page.tsx               — Layout principal do hub
  pet-hub-header.tsx             — Header com foto, nome, WhatsApp
  pet-general-tab.tsx            — Tab Geral
  pet-health-tab.tsx             — Tab Saude
  pet-food-tab.tsx               — Tab Alimentacao
  pet-behavior-tab.tsx           — Tab Comportamento
  pet-training-tab.tsx           — Tab Treinamento
  pet-calendar-tab.tsx           — Tab Calendario
  pet-documents-tab.tsx          — Tab Documentos
  source-badge.tsx               — Badge "Creche" / "Tutor"

src/app/(dashboard)/admin/pets/[id]/hub/
  page.tsx                       — Pagina hub admin

src/app/(dashboard)/admin/invitations/
  page.tsx                       — Listagem de convites
  new/page.tsx                   — Criar novo convite
```

### Modified Files

```
src/lib/db/schema.ts             — Adicionar source/created_by nas tabelas editaveis, admin_locked_fields em pets, onboarding_status/invited_by em users
src/lib/db/index.ts              — Exportar novas tabelas
src/lib/trpc/routers/index.ts    — Registrar novos routers
src/lib/validations.ts           — Exportar novas validations
src/middleware.ts                 — Adicionar /invite/* como rota publica
src/app/(dashboard)/tutor/pets/[id]/page.tsx — Substituir por PetHubPage com permissoes tutor
src/lib/trpc/routers/pets.ts     — Adicionar logica source/created_by no create/update
```

---

## Task 1: Schema — Tabela invitations e campos de ownership

**Files:**
- Modify: `src/lib/db/schema.ts`
- Create: `src/lib/db/schema-invitations.ts`
- Modify: `src/lib/db/index.ts`

- [ ] **Step 1: Criar schema de invitations**

Criar `src/lib/db/schema-invitations.ts`:

```typescript
import { pgTable, serial, varchar, boolean, timestamp, integer, jsonb, index } from "drizzle-orm/pg-core";
import { users, pets } from "./schema";

export const invitations = pgTable("invitations", {
  id: serial("id").primaryKey(),
  token: varchar("token", { length: 64 }).notNull().unique(),
  tutorId: integer("tutor_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  petIds: jsonb("pet_ids").$type<number[]>().notNull().default([]),
  dashboardAccess: boolean("dashboard_access").notNull().default(true),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  createdBy: integer("created_by")
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp("expires_at").notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("invitations_token_idx").on(table.token),
  index("invitations_tutor_id_idx").on(table.tutorId),
  index("invitations_status_idx").on(table.status),
]);

export type Invitation = typeof invitations.$inferSelect;
export type InsertInvitation = typeof invitations.$inferInsert;
```

- [ ] **Step 2: Adicionar campos de ownership em schema.ts**

No arquivo `src/lib/db/schema.ts`, adicionar os seguintes campos na tabela `users`:

```typescript
// Adicionar apos o campo approvalStatus na tabela users:
onboardingStatus: varchar("onboarding_status", { length: 20 }).default("not_started").notNull(),
invitedBy: integer("invited_by").references(() => users.id),
```

Na tabela `pets`, adicionar:

```typescript
// Adicionar apos o campo updatedAt na tabela pets:
adminLockedFields: jsonb("admin_locked_fields").$type<string[]>().default([]),
```

Nas seguintes tabelas, adicionar dois campos cada (pet_vaccinations, pet_medications, preventive_treatments, pet_food_plans, pet_weight_history, behavior_logs, training_logs, documents, calendar_events):

```typescript
// Adicionar em cada tabela:
source: varchar("source", { length: 10 }).default("admin").notNull(),
createdByUserId: integer("created_by_user_id").references(() => users.id),
```

- [ ] **Step 3: Exportar novas tabelas em index.ts**

Em `src/lib/db/index.ts`, adicionar:

```typescript
export * from "./schema-invitations";
```

- [ ] **Step 4: Gerar e rodar migracao**

Run: `cd /Users/rodrigorochameire/projetos/TeteCareHub && npx drizzle-kit generate`
Run: `cd /Users/rodrigorochameire/projetos/TeteCareHub && npx drizzle-kit push`

Verificar que as tabelas foram criadas sem erros.

- [ ] **Step 5: Script de migracao de dados existentes**

Run SQL no Supabase (ou via script):

```sql
-- Marcar todos os registros existentes como source = 'admin'
UPDATE pet_vaccinations SET source = 'admin' WHERE source IS NULL;
UPDATE pet_medications SET source = 'admin' WHERE source IS NULL;
UPDATE preventive_treatments SET source = 'admin' WHERE source IS NULL;
UPDATE pet_food_plans SET source = 'admin' WHERE source IS NULL;
UPDATE pet_weight_history SET source = 'admin' WHERE source IS NULL;
UPDATE behavior_logs SET source = 'admin' WHERE source IS NULL;
UPDATE training_logs SET source = 'admin' WHERE source IS NULL;
UPDATE documents SET source = 'admin' WHERE source IS NULL;
UPDATE calendar_events SET source = 'admin' WHERE source IS NULL;

-- Popular admin_locked_fields para pets existentes
-- (campos nao-nulos sao considerados "locked")
UPDATE pets SET admin_locked_fields = '[]'::jsonb WHERE admin_locked_fields IS NULL;
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/db/schema.ts src/lib/db/schema-invitations.ts src/lib/db/index.ts
git commit -m "feat: add invitations table and ownership fields (source, created_by)"
```

---

## Task 2: Validations — Schemas Zod para convites e onboarding

**Files:**
- Create: `src/lib/validations/invitation.ts`
- Modify: `src/lib/validations.ts`

- [ ] **Step 1: Criar schemas de validacao**

Criar `src/lib/validations/invitation.ts`:

```typescript
import { z } from "zod";

export const invitationStatusSchema = z.enum(["pending", "completed", "expired"]);
export type InvitationStatus = z.infer<typeof invitationStatusSchema>;

export const onboardingStatusSchema = z.enum(["not_started", "in_progress", "completed"]);
export type OnboardingStatus = z.infer<typeof onboardingStatusSchema>;

export const sourceSchema = z.enum(["admin", "tutor"]);
export type Source = z.infer<typeof sourceSchema>;

export const createInvitationSchema = z.object({
  tutorId: z.number().int().positive("Tutor e obrigatorio"),
  petIds: z.array(z.number().int().positive()).min(1, "Selecione pelo menos um pet"),
  dashboardAccess: z.boolean().default(true),
});
export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;

export const tutorOnboardingStep1Schema = z.object({
  token: z.string().min(1),
  address: z.string().max(500).optional(),
  emergencyContact: z.string().max(200).optional(),
  emergencyPhone: z.string().max(20).optional(),
  notes: z.string().max(2000).optional(),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres").optional(),
});
export type TutorOnboardingStep1Input = z.infer<typeof tutorOnboardingStep1Schema>;

export const petComplementSchema = z.object({
  petId: z.number().int().positive(),
  foodAllergies: z.array(z.string()).optional(),
  medicationAllergies: z.array(z.string()).optional(),
  feedingPreferences: z.string().max(1000).optional(),
  vetName: z.string().max(200).optional(),
  vetPhone: z.string().max(20).optional(),
  vetAddress: z.string().max(500).optional(),
  fearTriggers: z.array(z.string()).optional(),
  notes: z.string().max(2000).optional(),
});
export type PetComplementInput = z.infer<typeof petComplementSchema>;

export const tutorOnboardingStep2Schema = z.object({
  token: z.string().min(1),
  pets: z.array(petComplementSchema).min(1),
});
export type TutorOnboardingStep2Input = z.infer<typeof tutorOnboardingStep2Schema>;

export const completeOnboardingSchema = z.object({
  token: z.string().min(1),
  acceptedTerms: z.boolean().refine((v) => v === true, "Voce deve aceitar os termos"),
});
export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>;
```

- [ ] **Step 2: Exportar do arquivo principal**

Em `src/lib/validations.ts`, adicionar no final:

```typescript
export * from "./validations/invitation";
```

Nota: se `validations.ts` nao usa barrel exports, criar o diretorio `src/lib/validations/` e mover o arquivo. Caso contrario, basta adicionar o export.

- [ ] **Step 3: Commit**

```bash
git add src/lib/validations/invitation.ts src/lib/validations.ts
git commit -m "feat: add Zod schemas for invitations and tutor onboarding"
```

---

## Task 3: Middleware — enforceOwnership para protecao de dados

**Files:**
- Create: `src/lib/trpc/middleware/enforce-ownership.ts`

- [ ] **Step 1: Criar middleware de ownership**

Criar `src/lib/trpc/middleware/enforce-ownership.ts`:

```typescript
import { TRPCError } from "@trpc/server";
import { db } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import type { AuthenticatedContext } from "../init";
import type { PgTable } from "drizzle-orm/pg-core";

/**
 * Verifica se o usuario pode modificar um registro baseado em source/created_by.
 * Admin pode tudo. Tutor so modifica registros com source='tutor' e created_by=userId.
 */
export async function enforceOwnership(
  ctx: AuthenticatedContext,
  table: PgTable & { source: any; createdByUserId: any; id: any },
  recordId: number
): Promise<void> {
  // Admin pode tudo
  if (ctx.user.role === "admin") return;

  // Buscar o registro
  const record = await db
    .select({
      id: table.id,
      source: table.source,
      createdByUserId: table.createdByUserId,
    })
    .from(table)
    .where(eq(table.id, recordId))
    .limit(1);

  if (record.length === 0) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Registro nao encontrado",
    });
  }

  const row = record[0];

  // Tutor so pode editar/deletar registros que ele criou
  if (row.source !== "tutor" || row.createdByUserId !== ctx.user.id) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Voce nao pode alterar registros cadastrados pela creche",
    });
  }
}

/**
 * Verifica se o tutor pode editar um campo especifico do pet.
 * Campos em admin_locked_fields sao read-only para o tutor.
 */
export function canTutorEditPetField(
  adminLockedFields: string[],
  fieldName: string
): boolean {
  return !adminLockedFields.includes(fieldName);
}

/**
 * Filtra campos de update do tutor removendo campos locked pelo admin.
 */
export function filterTutorPetUpdate(
  adminLockedFields: string[],
  updateData: Record<string, unknown>
): Record<string, unknown> {
  const filtered: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(updateData)) {
    if (!adminLockedFields.includes(key) && value !== undefined) {
      filtered[key] = value;
    }
  }
  return filtered;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/trpc/middleware/enforce-ownership.ts
git commit -m "feat: add enforceOwnership middleware for source/created_by protection"
```

---

## Task 4: Router — Invitations (admin)

**Files:**
- Create: `src/lib/trpc/routers/invitations.ts`
- Modify: `src/lib/trpc/routers/index.ts`

- [ ] **Step 1: Criar router de invitations**

Criar `src/lib/trpc/routers/invitations.ts`:

```typescript
import { z } from "zod";
import { router, adminProcedure } from "../init";
import { db } from "@/lib/db";
import { invitations } from "@/lib/db/schema-invitations";
import { users, pets, petTutors } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { Errors, safeAsync } from "@/lib/errors";
import { createInvitationSchema } from "@/lib/validations/invitation";
import crypto from "crypto";

export const invitationsRouter = router({
  /**
   * Listar todos os convites
   */
  list: adminProcedure.query(async () => {
    return safeAsync(async () => {
      const result = await db
        .select({
          invitation: invitations,
          tutor: {
            id: users.id,
            name: users.name,
            email: users.email,
            phone: users.phone,
          },
        })
        .from(invitations)
        .innerJoin(users, eq(invitations.tutorId, users.id))
        .orderBy(desc(invitations.createdAt));

      return result;
    }, "Erro ao listar convites");
  }),

  /**
   * Criar convite para tutor
   */
  create: adminProcedure
    .input(createInvitationSchema)
    .mutation(async ({ ctx, input }) => {
      return safeAsync(async () => {
        // Verificar se tutor existe
        const tutor = await db.query.users.findFirst({
          where: eq(users.id, input.tutorId),
        });
        if (!tutor) throw Errors.notFound("Tutor");

        // Verificar se pets existem e estao vinculados ao tutor
        for (const petId of input.petIds) {
          const relation = await db.query.petTutors.findFirst({
            where: and(
              eq(petTutors.petId, petId),
              eq(petTutors.tutorId, input.tutorId)
            ),
          });
          if (!relation) {
            throw Errors.conflict(`Pet ${petId} nao esta vinculado a este tutor`);
          }
        }

        // Gerar token unico
        const token = crypto.randomBytes(32).toString("hex");

        // Criar convite com validade de 7 dias
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const [invitation] = await db
          .insert(invitations)
          .values({
            token,
            tutorId: input.tutorId,
            petIds: input.petIds,
            dashboardAccess: input.dashboardAccess,
            status: "pending",
            createdBy: ctx.user.id,
            expiresAt,
          })
          .returning();

        // Atualizar status do tutor
        await db
          .update(users)
          .set({
            onboardingStatus: "not_started",
            invitedBy: ctx.user.id,
            updatedAt: new Date(),
          })
          .where(eq(users.id, input.tutorId));

        return {
          ...invitation,
          inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invite/${token}`,
        };
      }, "Erro ao criar convite");
    }),

  /**
   * Revogar convite
   */
  revoke: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      return safeAsync(async () => {
        const [updated] = await db
          .update(invitations)
          .set({ status: "expired", updatedAt: new Date() })
          .where(eq(invitations.id, input.id))
          .returning();

        if (!updated) throw Errors.notFound("Convite");
        return updated;
      }, "Erro ao revogar convite");
    }),

  /**
   * Reenviar convite (gera novo token, reseta expiracao)
   */
  resend: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      return safeAsync(async () => {
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const [updated] = await db
          .update(invitations)
          .set({
            token,
            status: "pending",
            expiresAt,
            updatedAt: new Date(),
          })
          .where(eq(invitations.id, input.id))
          .returning();

        if (!updated) throw Errors.notFound("Convite");

        return {
          ...updated,
          inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invite/${token}`,
        };
      }, "Erro ao reenviar convite");
    }),
});
```

- [ ] **Step 2: Registrar router no index**

Em `src/lib/trpc/routers/index.ts`, adicionar:

```typescript
import { invitationsRouter } from "./invitations";

// Dentro do router({...}):
invitations: invitationsRouter,
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/trpc/routers/invitations.ts src/lib/trpc/routers/index.ts
git commit -m "feat: add invitations tRPC router (create, list, revoke, resend)"
```

---

## Task 5: Router — Onboarding publico (tutor)

**Files:**
- Create: `src/lib/trpc/routers/invite-public.ts`
- Modify: `src/lib/trpc/routers/index.ts`
- Modify: `src/middleware.ts`

- [ ] **Step 1: Criar router publico de onboarding**

Criar `src/lib/trpc/routers/invite-public.ts`:

```typescript
import { z } from "zod";
import { router, publicProcedure } from "../init";
import { db } from "@/lib/db";
import { invitations } from "@/lib/db/schema-invitations";
import { users, pets, petTutors } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { Errors, safeAsync } from "@/lib/errors";
import {
  tutorOnboardingStep1Schema,
  tutorOnboardingStep2Schema,
  completeOnboardingSchema,
} from "@/lib/validations/invitation";
import { filterTutorPetUpdate } from "../middleware/enforce-ownership";

export const invitePublicRouter = router({
  /**
   * Buscar dados do convite pelo token (para renderizar o wizard)
   */
  getByToken: publicProcedure
    .input(z.object({ token: z.string().min(1) }))
    .query(async ({ input }) => {
      return safeAsync(async () => {
        const invitation = await db.query.invitations.findFirst({
          where: eq(invitations.token, input.token),
        });

        if (!invitation) throw Errors.notFound("Convite");

        // Verificar expiracao
        if (invitation.status === "expired" || new Date() > invitation.expiresAt) {
          throw new Error("Este convite expirou. Solicite um novo a creche.");
        }

        if (invitation.status === "completed") {
          throw new Error("Este convite ja foi utilizado.");
        }

        // Buscar dados do tutor
        const tutor = await db.query.users.findFirst({
          where: eq(users.id, invitation.tutorId),
        });

        if (!tutor) throw Errors.notFound("Tutor");

        // Buscar pets vinculados
        const petList = await db
          .select()
          .from(pets)
          .where(inArray(pets.id, invitation.petIds));

        return {
          invitation: {
            id: invitation.id,
            dashboardAccess: invitation.dashboardAccess,
            expiresAt: invitation.expiresAt,
          },
          tutor: {
            id: tutor.id,
            name: tutor.name,
            email: tutor.email,
            phone: tutor.phone,
            address: tutor.address,
            emergencyContact: tutor.emergencyContact,
            emergencyPhone: tutor.emergencyPhone,
          },
          pets: petList.map((p) => ({
            id: p.id,
            name: p.name,
            breed: p.breed,
            species: p.species,
            birthDate: p.birthDate,
            weight: p.weight,
            photoUrl: p.photoUrl,
            adminLockedFields: p.adminLockedFields || [],
            // Campos complementaveis
            foodAllergies: p.foodAllergies,
            vetName: p.vetName,
            vetPhone: p.vetPhone,
            fearTriggers: p.fearTriggers,
            notes: p.notes,
          })),
        };
      }, "Erro ao buscar convite");
    }),

  /**
   * Passo 1: Salvar dados complementares do tutor
   */
  saveStep1: publicProcedure
    .input(tutorOnboardingStep1Schema)
    .mutation(async ({ input }) => {
      return safeAsync(async () => {
        const invitation = await db.query.invitations.findFirst({
          where: eq(invitations.token, input.token),
        });

        if (!invitation || invitation.status !== "pending") {
          throw new Error("Convite invalido ou expirado");
        }

        // Atualizar dados complementares do tutor (nao sobrescrever dados do admin)
        const updateData: Record<string, unknown> = { updatedAt: new Date() };
        if (input.address) updateData.address = input.address;
        if (input.emergencyContact) updateData.emergencyContact = input.emergencyContact;
        if (input.emergencyPhone) updateData.emergencyPhone = input.emergencyPhone;
        if (input.notes) updateData.notes = input.notes;

        await db
          .update(users)
          .set(updateData)
          .where(eq(users.id, invitation.tutorId));

        // Atualizar onboarding status
        await db
          .update(users)
          .set({ onboardingStatus: "in_progress" })
          .where(eq(users.id, invitation.tutorId));

        return { success: true };
      }, "Erro ao salvar dados do tutor");
    }),

  /**
   * Passo 2: Salvar dados complementares dos pets
   */
  saveStep2: publicProcedure
    .input(tutorOnboardingStep2Schema)
    .mutation(async ({ input }) => {
      return safeAsync(async () => {
        const invitation = await db.query.invitations.findFirst({
          where: eq(invitations.token, input.token),
        });

        if (!invitation || invitation.status !== "pending") {
          throw new Error("Convite invalido ou expirado");
        }

        // Atualizar cada pet com dados complementares
        for (const petData of input.pets) {
          // Verificar que o pet esta no convite
          if (!invitation.petIds.includes(petData.petId)) continue;

          // Buscar campos locked do pet
          const pet = await db.query.pets.findFirst({
            where: eq(pets.id, petData.petId),
          });
          if (!pet) continue;

          const lockedFields = (pet.adminLockedFields as string[]) || [];

          // Filtrar campos que o tutor pode editar
          const rawUpdate: Record<string, unknown> = {
            updatedAt: new Date(),
          };
          if (petData.foodAllergies) rawUpdate.foodAllergies = petData.foodAllergies;
          if (petData.vetName) rawUpdate.vetName = petData.vetName;
          if (petData.vetPhone) rawUpdate.vetPhone = petData.vetPhone;
          if (petData.vetAddress) rawUpdate.vetAddress = petData.vetAddress;
          if (petData.fearTriggers) rawUpdate.fearTriggers = petData.fearTriggers;
          if (petData.notes) rawUpdate.notes = petData.notes;

          const safeUpdate = filterTutorPetUpdate(lockedFields, rawUpdate);

          if (Object.keys(safeUpdate).length > 0) {
            await db
              .update(pets)
              .set(safeUpdate)
              .where(eq(pets.id, petData.petId));
          }
        }

        return { success: true };
      }, "Erro ao salvar dados dos pets");
    }),

  /**
   * Passo 4: Completar onboarding
   */
  complete: publicProcedure
    .input(completeOnboardingSchema)
    .mutation(async ({ input }) => {
      return safeAsync(async () => {
        const invitation = await db.query.invitations.findFirst({
          where: eq(invitations.token, input.token),
        });

        if (!invitation || invitation.status !== "pending") {
          throw new Error("Convite invalido ou expirado");
        }

        // Marcar convite como completo
        await db
          .update(invitations)
          .set({
            status: "completed",
            completedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(invitations.id, invitation.id));

        // Atualizar tutor
        const tutorUpdate: Record<string, unknown> = {
          onboardingStatus: "completed",
          updatedAt: new Date(),
        };

        // Se tem acesso ao dashboard, aprovar o tutor
        if (invitation.dashboardAccess) {
          tutorUpdate.approvalStatus = "approved";
        }

        await db
          .update(users)
          .set(tutorUpdate)
          .where(eq(users.id, invitation.tutorId));

        return {
          success: true,
          dashboardAccess: invitation.dashboardAccess,
        };
      }, "Erro ao completar cadastro");
    }),
});
```

- [ ] **Step 2: Registrar router no index**

Em `src/lib/trpc/routers/index.ts`, adicionar:

```typescript
import { invitePublicRouter } from "./invite-public";

// Dentro do router({...}):
invitePublic: invitePublicRouter,
```

- [ ] **Step 3: Adicionar /invite como rota publica no middleware**

Em `src/middleware.ts`, adicionar `/invite(.*)` no `isPublicRoute`:

```typescript
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/auth-redirect",
  "/login",
  "/register",
  "/invite/(.*)",
  "/api/webhooks(.*)",
  "/api/auth(.*)",
  "/api/trpc/invitePublic(.*)",
]);
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/trpc/routers/invite-public.ts src/lib/trpc/routers/index.ts src/middleware.ts
git commit -m "feat: add public onboarding router and /invite public route"
```

---

## Task 6: UI — Wizard de Onboarding (/invite/[token])

**Files:**
- Create: `src/app/invite/[token]/layout.tsx`
- Create: `src/app/invite/[token]/page.tsx`
- Create: `src/components/invite/invite-wizard.tsx`
- Create: `src/components/invite/step-tutor-data.tsx`
- Create: `src/components/invite/step-pets-data.tsx`
- Create: `src/components/invite/step-plan-review.tsx`
- Create: `src/components/invite/step-confirmation.tsx`

- [ ] **Step 1: Layout publico**

Criar `src/app/invite/[token]/layout.tsx`:

```typescript
export default function InviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">TeteCare Hub</h1>
          <p className="text-muted-foreground">Complete seu cadastro</p>
        </div>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Pagina principal do wizard**

Criar `src/app/invite/[token]/page.tsx`:

```typescript
"use client";

import { use } from "react";
import { trpc } from "@/lib/trpc/client";
import { LoadingPage } from "@/components/shared/loading";
import { InviteWizard } from "@/components/invite/invite-wizard";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default function InvitePage({ params }: InvitePageProps) {
  const { token } = use(params);
  const { data, isLoading, error } = trpc.invitePublic.getByToken.useQuery({ token });

  if (isLoading) return <LoadingPage />;

  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold">Convite invalido</h2>
          <p className="text-muted-foreground">
            {error?.message || "Este link nao e valido ou ja foi utilizado."}
          </p>
          <p className="text-sm text-muted-foreground">
            Entre em contato com a creche para solicitar um novo convite.
          </p>
        </CardContent>
      </Card>
    );
  }

  return <InviteWizard token={token} data={data} />;
}
```

- [ ] **Step 3: Componente wizard principal**

Criar `src/components/invite/invite-wizard.tsx`:

```typescript
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StepTutorData } from "./step-tutor-data";
import { StepPetsData } from "./step-pets-data";
import { StepPlanReview } from "./step-plan-review";
import { StepConfirmation } from "./step-confirmation";
import { CheckCircle2 } from "lucide-react";

interface InviteWizardProps {
  token: string;
  data: {
    invitation: { id: number; dashboardAccess: boolean; expiresAt: Date };
    tutor: {
      id: number;
      name: string | null;
      email: string | null;
      phone: string | null;
      address?: string | null;
      emergencyContact?: string | null;
      emergencyPhone?: string | null;
    };
    pets: Array<{
      id: number;
      name: string;
      breed: string | null;
      species: string;
      birthDate: Date | null;
      weight: number | null;
      photoUrl: string | null;
      adminLockedFields: string[];
      foodAllergies: string[] | null;
      vetName: string | null;
      vetPhone: string | null;
      fearTriggers: string[] | null;
      notes: string | null;
    }>;
  };
}

const STEPS = [
  { label: "Seus Dados", number: 1 },
  { label: "Seus Pets", number: 2 },
  { label: "Plano", number: 3 },
  { label: "Confirmacao", number: 4 },
];

export function InviteWizard({ token, data }: InviteWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completed, setCompleted] = useState(false);

  const handleNext = () => setCurrentStep((s) => Math.min(s + 1, 4));
  const handleBack = () => setCurrentStep((s) => Math.max(s - 1, 1));

  if (completed) {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-4">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold">Cadastro concluido!</h2>
          {data.invitation.dashboardAccess ? (
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Seu acesso foi ativado. Voce ja pode acessar o painel.
              </p>
              <Button asChild>
                <a href="/sign-in">Acessar o painel</a>
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground">
              Obrigado por completar seu cadastro! A creche cuidara de tudo por voce.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center justify-between">
        {STEPS.map((step) => (
          <div key={step.number} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step.number
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step.number}
            </div>
            <span className="text-sm hidden sm:inline">{step.label}</span>
          </div>
        ))}
      </div>

      {/* Step content */}
      {currentStep === 1 && (
        <StepTutorData
          token={token}
          tutor={data.tutor}
          dashboardAccess={data.invitation.dashboardAccess}
          onNext={handleNext}
        />
      )}
      {currentStep === 2 && (
        <StepPetsData
          token={token}
          pets={data.pets}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}
      {currentStep === 3 && (
        <StepPlanReview
          pets={data.pets}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}
      {currentStep === 4 && (
        <StepConfirmation
          token={token}
          tutor={data.tutor}
          pets={data.pets}
          dashboardAccess={data.invitation.dashboardAccess}
          onBack={handleBack}
          onComplete={() => setCompleted(true)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 4: Passo 1 — Dados do tutor**

Criar `src/components/invite/step-tutor-data.tsx`:

```typescript
"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface StepTutorDataProps {
  token: string;
  tutor: {
    name: string | null;
    email: string | null;
    phone: string | null;
    address?: string | null;
    emergencyContact?: string | null;
    emergencyPhone?: string | null;
  };
  dashboardAccess: boolean;
  onNext: () => void;
}

export function StepTutorData({ token, tutor, dashboardAccess, onNext }: StepTutorDataProps) {
  const [address, setAddress] = useState(tutor.address || "");
  const [emergencyContact, setEmergencyContact] = useState(tutor.emergencyContact || "");
  const [emergencyPhone, setEmergencyPhone] = useState(tutor.emergencyPhone || "");
  const [notes, setNotes] = useState("");
  const [password, setPassword] = useState("");

  const saveStep1 = trpc.invitePublic.saveStep1.useMutation({
    onSuccess: () => {
      toast.success("Dados salvos!");
      onNext();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = () => {
    saveStep1.mutate({
      token,
      address: address || undefined,
      emergencyContact: emergencyContact || undefined,
      emergencyPhone: emergencyPhone || undefined,
      notes: notes || undefined,
      password: dashboardAccess && password ? password : undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seus Dados</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dados cadastrados pelo admin (read-only) */}
        <div className="space-y-3 p-4 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">Cadastrado pela creche</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-muted-foreground text-xs">Nome</Label>
              <p className="font-medium">{tutor.name || "—"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Email</Label>
              <p className="font-medium">{tutor.email || "—"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Telefone</Label>
              <p className="font-medium">{tutor.phone || "—"}</p>
            </div>
          </div>
        </div>

        {/* Campos complementares */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="address">Endereco</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Rua, numero, bairro, cidade"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emergencyContact">Contato de emergencia</Label>
              <Input
                id="emergencyContact"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="Nome do contato"
              />
            </div>
            <div>
              <Label htmlFor="emergencyPhone">Telefone emergencia</Label>
              <Input
                id="emergencyPhone"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="(71) 99999-9999"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Observacoes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informacoes adicionais que a creche deve saber"
              rows={3}
            />
          </div>

          {dashboardAccess && (
            <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
              <Label htmlFor="password">Crie sua senha de acesso</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Com esta senha voce podera acessar o painel do tutor.
              </p>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimo 8 caracteres"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={saveStep1.isPending}>
            {saveStep1.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Proximo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 5: Passo 2 — Dados dos pets**

Criar `src/components/invite/step-pets-data.tsx`:

```typescript
"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, PawPrint } from "lucide-react";

interface Pet {
  id: number;
  name: string;
  breed: string | null;
  species: string;
  birthDate: Date | null;
  weight: number | null;
  adminLockedFields: string[];
  foodAllergies: string[] | null;
  vetName: string | null;
  vetPhone: string | null;
  fearTriggers: string[] | null;
  notes: string | null;
}

interface StepPetsDataProps {
  token: string;
  pets: Pet[];
  onNext: () => void;
  onBack: () => void;
}

export function StepPetsData({ token, pets, onNext, onBack }: StepPetsDataProps) {
  const [petData, setPetData] = useState<Record<number, Record<string, string>>>({});

  const saveStep2 = trpc.invitePublic.saveStep2.useMutation({
    onSuccess: () => {
      toast.success("Dados dos pets salvos!");
      onNext();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateField = (petId: number, field: string, value: string) => {
    setPetData((prev) => ({
      ...prev,
      [petId]: { ...prev[petId], [field]: value },
    }));
  };

  const handleSubmit = () => {
    const petsPayload = pets.map((pet) => ({
      petId: pet.id,
      vetName: petData[pet.id]?.vetName || undefined,
      vetPhone: petData[pet.id]?.vetPhone || undefined,
      vetAddress: petData[pet.id]?.vetAddress || undefined,
      fearTriggers: petData[pet.id]?.fearTriggers
        ? petData[pet.id].fearTriggers.split(",").map((s) => s.trim())
        : undefined,
      notes: petData[pet.id]?.notes || undefined,
    }));

    saveStep2.mutate({ token, pets: petsPayload });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seus Pets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue={String(pets[0]?.id)}>
          <TabsList className="w-full justify-start">
            {pets.map((pet) => (
              <TabsTrigger key={pet.id} value={String(pet.id)} className="gap-2">
                <PawPrint className="h-4 w-4" />
                {pet.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {pets.map((pet) => (
            <TabsContent key={pet.id} value={String(pet.id)} className="space-y-4 mt-4">
              {/* Dados do admin (read-only) */}
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <Badge variant="secondary">Cadastrado pela creche</Badge>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                  <div>
                    <Label className="text-muted-foreground text-xs">Nome</Label>
                    <p className="font-medium">{pet.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Raca</Label>
                    <p className="font-medium">{pet.breed || "—"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Especie</Label>
                    <p className="font-medium">{pet.species === "dog" ? "Cachorro" : "Gato"}</p>
                  </div>
                  {pet.weight && (
                    <div>
                      <Label className="text-muted-foreground text-xs">Peso</Label>
                      <p className="font-medium">{(pet.weight / 1000).toFixed(1)} kg</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Campos complementares */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Veterinario</Label>
                    <Input
                      value={petData[pet.id]?.vetName || pet.vetName || ""}
                      onChange={(e) => updateField(pet.id, "vetName", e.target.value)}
                      placeholder="Nome do veterinario"
                      disabled={pet.adminLockedFields.includes("vetName")}
                    />
                  </div>
                  <div>
                    <Label>Telefone do vet</Label>
                    <Input
                      value={petData[pet.id]?.vetPhone || pet.vetPhone || ""}
                      onChange={(e) => updateField(pet.id, "vetPhone", e.target.value)}
                      placeholder="(71) 99999-9999"
                      disabled={pet.adminLockedFields.includes("vetPhone")}
                    />
                  </div>
                </div>
                <div>
                  <Label>Endereco do vet</Label>
                  <Input
                    value={petData[pet.id]?.vetAddress || ""}
                    onChange={(e) => updateField(pet.id, "vetAddress", e.target.value)}
                    placeholder="Endereco da clinica veterinaria"
                  />
                </div>
                <div>
                  <Label>Medos / Gatilhos</Label>
                  <Input
                    value={petData[pet.id]?.fearTriggers || pet.fearTriggers?.join(", ") || ""}
                    onChange={(e) => updateField(pet.id, "fearTriggers", e.target.value)}
                    placeholder="Ex: trovao, fogos de artificio, aspirador"
                    disabled={pet.adminLockedFields.includes("fearTriggers")}
                  />
                </div>
                <div>
                  <Label>Observacoes</Label>
                  <Textarea
                    value={petData[pet.id]?.notes || ""}
                    onChange={(e) => updateField(pet.id, "notes", e.target.value)}
                    placeholder="Algo que a creche deve saber sobre este pet"
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>Voltar</Button>
          <Button onClick={handleSubmit} disabled={saveStep2.isPending}>
            {saveStep2.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Proximo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 6: Passo 3 — Revisao do plano**

Criar `src/components/invite/step-plan-review.tsx`:

```typescript
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Pet {
  id: number;
  name: string;
  breed: string | null;
  species: string;
}

interface StepPlanReviewProps {
  pets: Pet[];
  onNext: () => void;
  onBack: () => void;
}

export function StepPlanReview({ pets, onNext, onBack }: StepPlanReviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Plano</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground">
          Confira o plano atribuido pela creche para cada pet:
        </p>

        {pets.map((pet) => (
          <div key={pet.id} className="p-4 rounded-lg border space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{pet.name}</h3>
              <Badge variant="secondary">
                {pet.species === "dog" ? "Cachorro" : "Gato"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              O plano sera definido pela creche. Entre em contato para mais detalhes.
            </p>
          </div>
        ))}

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>Voltar</Button>
          <Button onClick={onNext}>Proximo</Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 7: Passo 4 — Confirmacao**

Criar `src/components/invite/step-confirmation.tsx`:

```typescript
"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface StepConfirmationProps {
  token: string;
  tutor: { name: string | null; email: string | null; phone: string | null };
  pets: Array<{ id: number; name: string; breed: string | null; species: string }>;
  dashboardAccess: boolean;
  onBack: () => void;
  onComplete: () => void;
}

export function StepConfirmation({
  token,
  tutor,
  pets,
  dashboardAccess,
  onBack,
  onComplete,
}: StepConfirmationProps) {
  const [accepted, setAccepted] = useState(false);

  const complete = trpc.invitePublic.complete.useMutation({
    onSuccess: () => {
      toast.success("Cadastro concluido!");
      onComplete();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleComplete = () => {
    if (!accepted) {
      toast.error("Voce deve aceitar os termos para continuar.");
      return;
    }
    complete.mutate({ token, acceptedTerms: true });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirmacao</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {/* Resumo tutor */}
          <div className="p-4 rounded-lg bg-muted/50">
            <h3 className="font-semibold mb-2">Seus dados</h3>
            <p className="text-sm">{tutor.name} — {tutor.email}</p>
            <p className="text-sm">{tutor.phone}</p>
          </div>

          {/* Resumo pets */}
          <div className="p-4 rounded-lg bg-muted/50">
            <h3 className="font-semibold mb-2">Seus pets</h3>
            {pets.map((pet) => (
              <p key={pet.id} className="text-sm">
                {pet.name} — {pet.breed || pet.species}
              </p>
            ))}
          </div>

          {/* Acesso */}
          <div className="p-4 rounded-lg bg-muted/50">
            <h3 className="font-semibold mb-1">Acesso ao painel</h3>
            <p className="text-sm text-muted-foreground">
              {dashboardAccess
                ? "Voce tera acesso ao painel do tutor apos confirmar."
                : "A creche gerenciara seu cadastro. Voce nao tera acesso ao painel."}
            </p>
          </div>
        </div>

        {/* Termos */}
        <div className="flex items-start gap-3 p-4 rounded-lg border">
          <Checkbox
            id="terms"
            checked={accepted}
            onCheckedChange={(v) => setAccepted(v === true)}
          />
          <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
            Li e concordo com os termos de uso e politica de privacidade da TeteCare Hub.
            Autorizo o uso dos dados informados para o cuidado do(s) meu(s) pet(s).
          </Label>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>Voltar</Button>
          <Button onClick={handleComplete} disabled={!accepted || complete.isPending}>
            {complete.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar Cadastro
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 8: Commit**

```bash
git add src/app/invite/ src/components/invite/
git commit -m "feat: add tutor onboarding wizard (4-step invite flow)"
```

---

## Task 7: UI — Pagina de Convites (Admin)

**Files:**
- Create: `src/app/(dashboard)/admin/invitations/page.tsx`
- Create: `src/app/(dashboard)/admin/invitations/new/page.tsx`

- [ ] **Step 1: Listagem de convites**

Criar `src/app/(dashboard)/admin/invitations/page.tsx`:

```typescript
"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingPage } from "@/components/shared/loading";
import { PageHeader } from "@/components/shared/page-header";
import { toast } from "sonner";
import { Copy, Plus, RefreshCw, XCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminInvitationsPage() {
  const { data, isLoading, refetch } = trpc.invitations.list.useQuery();

  const revoke = trpc.invitations.revoke.useMutation({
    onSuccess: () => {
      toast.success("Convite revogado");
      refetch();
    },
  });

  const resend = trpc.invitations.resend.useMutation({
    onSuccess: (data) => {
      navigator.clipboard.writeText(data.inviteUrl);
      toast.success("Novo link copiado!");
      refetch();
    },
  });

  if (isLoading) return <LoadingPage />;

  const statusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pendente</Badge>;
      case "completed":
        return <Badge className="bg-green-500/10 text-green-600">Concluido</Badge>;
      case "expired":
        return <Badge variant="destructive">Expirado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Convites">
        <Button asChild>
          <Link href="/admin/invitations/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Convite
          </Link>
        </Button>
      </PageHeader>

      <div className="space-y-3">
        {data?.map(({ invitation, tutor }) => (
          <Card key={invitation.id}>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">{tutor.name}</p>
                  <p className="text-sm text-muted-foreground">{tutor.email} — {tutor.phone}</p>
                  <div className="flex items-center gap-2">
                    {statusBadge(invitation.status)}
                    <span className="text-xs text-muted-foreground">
                      Expira: {format(new Date(invitation.expiresAt), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                    {invitation.dashboardAccess && (
                      <Badge variant="secondary" className="text-xs">Com acesso</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {invitation.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const url = `${window.location.origin}/invite/${invitation.token}`;
                          navigator.clipboard.writeText(url);
                          toast.success("Link copiado!");
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => revoke.mutate({ id: invitation.id })}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {invitation.status === "expired" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resend.mutate({ id: invitation.id })}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Reenviar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {data?.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhum convite enviado ainda.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Pagina de criar convite**

Criar `src/app/(dashboard)/admin/invitations/new/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingPage } from "@/components/shared/loading";
import { toast } from "sonner";
import { Loader2, Copy, MessageCircle } from "lucide-react";

export default function NewInvitationPage() {
  const router = useRouter();
  const [selectedTutor, setSelectedTutor] = useState<number | null>(null);
  const [selectedPets, setSelectedPets] = useState<number[]>([]);
  const [dashboardAccess, setDashboardAccess] = useState(true);

  // Buscar tutores (role = user)
  const { data: tutors, isLoading: tutorsLoading } = trpc.users.list.useQuery({
    role: "user",
  });

  // Buscar pets do tutor selecionado
  const { data: tutorPets } = trpc.pets.list.useQuery(
    { tutorId: selectedTutor! },
    { enabled: !!selectedTutor }
  );

  const createInvitation = trpc.invitations.create.useMutation({
    onSuccess: (data) => {
      navigator.clipboard.writeText(data.inviteUrl);
      toast.success("Convite criado! Link copiado.");
      router.push("/admin/invitations");
    },
    onError: (err) => toast.error(err.message),
  });

  if (tutorsLoading) return <LoadingPage />;

  const handleSubmit = () => {
    if (!selectedTutor || selectedPets.length === 0) {
      toast.error("Selecione um tutor e pelo menos um pet.");
      return;
    }
    createInvitation.mutate({
      tutorId: selectedTutor,
      petIds: selectedPets,
      dashboardAccess,
    });
  };

  const togglePet = (petId: number) => {
    setSelectedPets((prev) =>
      prev.includes(petId) ? prev.filter((id) => id !== petId) : [...prev, petId]
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Novo Convite" />

      <Card>
        <CardHeader>
          <CardTitle>Selecione o tutor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Select
            onValueChange={(v) => {
              setSelectedTutor(Number(v));
              setSelectedPets([]);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um tutor" />
            </SelectTrigger>
            <SelectContent>
              {tutors?.map((tutor) => (
                <SelectItem key={tutor.id} value={String(tutor.id)}>
                  {tutor.name} — {tutor.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {tutorPets && tutorPets.length > 0 && (
            <div className="space-y-3">
              <Label>Selecione os pets</Label>
              {tutorPets.map((pet) => (
                <div key={pet.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <Checkbox
                    checked={selectedPets.includes(pet.id)}
                    onCheckedChange={() => togglePet(pet.id)}
                  />
                  <div>
                    <p className="font-medium">{pet.name}</p>
                    <p className="text-sm text-muted-foreground">{pet.breed || pet.species}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <Label>Acesso ao painel do tutor</Label>
              <p className="text-sm text-muted-foreground">
                Permitir que o tutor acesse a plataforma
              </p>
            </div>
            <Switch
              checked={dashboardAccess}
              onCheckedChange={setDashboardAccess}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedTutor || selectedPets.length === 0 || createInvitation.isPending}
            >
              {createInvitation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Convite
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(dashboard\)/admin/invitations/
git commit -m "feat: add admin invitation management pages (list + create)"
```

---

## Task 8: Componente — Source Badge

**Files:**
- Create: `src/components/pet-hub/source-badge.tsx`

- [ ] **Step 1: Criar componente de badge**

Criar `src/components/pet-hub/source-badge.tsx`:

```typescript
import { Badge } from "@/components/ui/badge";
import { Building2, User } from "lucide-react";

interface SourceBadgeProps {
  source: "admin" | "tutor";
}

export function SourceBadge({ source }: SourceBadgeProps) {
  if (source === "admin") {
    return (
      <Badge variant="secondary" className="gap-1 text-xs">
        <Building2 className="h-3 w-3" />
        Creche
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1 text-xs text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
      <User className="h-3 w-3" />
      Tutor
    </Badge>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/pet-hub/source-badge.tsx
git commit -m "feat: add SourceBadge component (Creche/Tutor)"
```

---

## Task 9: UI — Pet Hub Header + Estrutura de Tabs

**Files:**
- Create: `src/components/pet-hub/pet-hub-header.tsx`
- Create: `src/components/pet-hub/pet-hub-page.tsx`

- [ ] **Step 1: Header do hub**

Criar `src/components/pet-hub/pet-hub-header.tsx`:

```typescript
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, PawPrint } from "lucide-react";

interface PetHubHeaderProps {
  pet: {
    name: string;
    breed: string | null;
    species: string;
    status: string;
    photoUrl: string | null;
    weight: number | null;
  };
  tutors: Array<{
    id: number;
    name: string | null;
    phone: string | null;
    isPrimary: boolean;
  }>;
}

export function PetHubHeader({ pet, tutors }: PetHubHeaderProps) {
  const primaryTutor = tutors.find((t) => t.isPrimary) || tutors[0];

  const whatsappUrl = primaryTutor?.phone
    ? `https://wa.me/55${primaryTutor.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Ola ${primaryTutor.name || ""}, sobre o ${pet.name}...`
      )}`
    : null;

  const statusBadge = () => {
    switch (pet.status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-600">Ativo</Badge>;
      case "checked-in":
        return <Badge className="bg-blue-500/10 text-blue-600">Na creche</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inativo</Badge>;
      default:
        return <Badge variant="outline">{pet.status}</Badge>;
    }
  };

  return (
    <div className="flex items-start gap-4 p-6">
      <Avatar className="h-20 w-20">
        <AvatarImage src={pet.photoUrl || undefined} alt={pet.name} />
        <AvatarFallback className="text-2xl">
          <PawPrint className="h-8 w-8" />
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{pet.name}</h1>
          {statusBadge()}
        </div>
        <p className="text-muted-foreground">
          {pet.breed || pet.species === "dog" ? "Cachorro" : "Gato"}
          {pet.weight ? ` — ${(pet.weight / 1000).toFixed(1)} kg` : ""}
        </p>
        {primaryTutor && (
          <p className="text-sm text-muted-foreground">
            Tutor: {primaryTutor.name}
          </p>
        )}
      </div>

      {whatsappUrl && (
        <Button asChild variant="outline" className="gap-2">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        </Button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Pagina hub principal**

Criar `src/components/pet-hub/pet-hub-page.tsx`:

```typescript
"use client";

import { trpc } from "@/lib/trpc/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingPage } from "@/components/shared/loading";
import { PetHubHeader } from "./pet-hub-header";
import { PetGeneralTab } from "./pet-general-tab";
import { PetHealthTab } from "./pet-health-tab";
import { PetFoodTab } from "./pet-food-tab";
import { PetBehaviorTab } from "./pet-behavior-tab";
import { PetTrainingTab } from "./pet-training-tab";
import { PetCalendarTab } from "./pet-calendar-tab";
import { PetDocumentsTab } from "./pet-documents-tab";
import { notFound } from "next/navigation";
import {
  Heart,
  UtensilsCrossed,
  Brain,
  GraduationCap,
  Calendar,
  FileText,
  Info,
} from "lucide-react";

interface PetHubPageProps {
  petId: number;
  role: "admin" | "tutor";
}

export function PetHubPage({ petId, role }: PetHubPageProps) {
  const { data: pet, isLoading, refetch } = trpc.pets.byId.useQuery({ id: petId });

  if (isLoading) return <LoadingPage />;
  if (!pet) return notFound();

  return (
    <div className="space-y-6">
      <Card>
        <PetHubHeader pet={pet} tutors={pet.tutors || []} />
      </Card>

      <Tabs defaultValue="general">
        <TabsList className="w-full justify-start flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="general" className="gap-1.5">
            <Info className="h-4 w-4" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="health" className="gap-1.5">
            <Heart className="h-4 w-4" />
            Saude
          </TabsTrigger>
          <TabsTrigger value="food" className="gap-1.5">
            <UtensilsCrossed className="h-4 w-4" />
            Alimentacao
          </TabsTrigger>
          <TabsTrigger value="behavior" className="gap-1.5">
            <Brain className="h-4 w-4" />
            Comportamento
          </TabsTrigger>
          <TabsTrigger value="training" className="gap-1.5">
            <GraduationCap className="h-4 w-4" />
            Treinamento
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-1.5">
            <Calendar className="h-4 w-4" />
            Calendario
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-1.5">
            <FileText className="h-4 w-4" />
            Documentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <PetGeneralTab pet={pet} role={role} onUpdate={refetch} />
        </TabsContent>
        <TabsContent value="health">
          <PetHealthTab petId={petId} role={role} />
        </TabsContent>
        <TabsContent value="food">
          <PetFoodTab petId={petId} role={role} />
        </TabsContent>
        <TabsContent value="behavior">
          <PetBehaviorTab petId={petId} role={role} />
        </TabsContent>
        <TabsContent value="training">
          <PetTrainingTab petId={petId} role={role} />
        </TabsContent>
        <TabsContent value="calendar">
          <PetCalendarTab petId={petId} role={role} />
        </TabsContent>
        <TabsContent value="documents">
          <PetDocumentsTab petId={petId} role={role} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/pet-hub/pet-hub-header.tsx src/components/pet-hub/pet-hub-page.tsx
git commit -m "feat: add PetHubPage with header, WhatsApp button, and 7 tabs"
```

---

## Task 10: UI — Tab Geral

**Files:**
- Create: `src/components/pet-hub/pet-general-tab.tsx`

- [ ] **Step 1: Criar tab geral**

Criar `src/components/pet-hub/pet-general-tab.tsx`:

```typescript
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Pet } from "@/lib/db/schema";

interface PetGeneralTabProps {
  pet: Pet & { tutors?: Array<{ id: number; name: string | null; email: string | null; phone: string | null; isPrimary: boolean }> };
  role: "admin" | "tutor";
  onUpdate: () => void;
}

export function PetGeneralTab({ pet, role }: PetGeneralTabProps) {
  const fieldRow = (label: string, value: string | null | undefined) => (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "—"}</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Dados basicos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informacoes Basicas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {fieldRow("Nome", pet.name)}
            {fieldRow("Raca", pet.breed)}
            {fieldRow("Especie", pet.species === "dog" ? "Cachorro" : "Gato")}
            {fieldRow("Nascimento", pet.birthDate ? format(new Date(pet.birthDate), "dd/MM/yyyy", { locale: ptBR }) : null)}
            {fieldRow("Peso", pet.weight ? `${(pet.weight / 1000).toFixed(1)} kg` : null)}
            {fieldRow("Porte", pet.size)}
            {fieldRow("Pelagem", pet.coatType)}
            {fieldRow("Sexo", pet.gender === "male" ? "Macho" : pet.gender === "female" ? "Femea" : null)}
            {fieldRow("Castrado", pet.isCastrated === true ? "Sim" : pet.isCastrated === false ? "Nao" : null)}
          </div>
        </CardContent>
      </Card>

      {/* Perfil comportamental */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Perfil Comportamental</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {fieldRow("Energia", pet.energyLevel)}
            {fieldRow("Sociab. cachorros", pet.dogSociability)}
            {fieldRow("Sociab. humanos", pet.humanSociability)}
            {fieldRow("Estilo de brincadeira", pet.playStyle)}
            {fieldRow("Sensibilidade a correcao", pet.correctionSensitivity)}
          </div>
          {pet.fearTriggers && (pet.fearTriggers as string[]).length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-muted-foreground mb-2">Medos / Gatilhos</p>
              <div className="flex flex-wrap gap-1">
                {(pet.fearTriggers as string[]).map((trigger) => (
                  <Badge key={trigger} variant="outline">{trigger}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tutores */}
      {pet.tutors && pet.tutors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tutores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pet.tutors.map((tutor) => (
                <div key={tutor.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{tutor.name}</p>
                    <p className="text-sm text-muted-foreground">{tutor.email} — {tutor.phone}</p>
                  </div>
                  {tutor.isPrimary && <Badge variant="secondary">Principal</Badge>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saude resumo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Saude</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {fieldRow("Alergias alimentares", pet.hasFoodAllergy ? "Sim" : "Nao")}
            {fieldRow("Condicoes cronicas", pet.hasChronicCondition ? "Sim" : "Nao")}
            {fieldRow("Veterinario", pet.vetName)}
            {fieldRow("Tel. veterinario", pet.vetPhone)}
          </div>
        </CardContent>
      </Card>

      {/* Notas */}
      {pet.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Observacoes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{pet.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/pet-hub/pet-general-tab.tsx
git commit -m "feat: add PetGeneralTab with basic info, behavior profile, tutors"
```

---

## Task 11: UI — Tabs de Saude, Alimentacao, Comportamento, Treinamento, Calendario, Documentos

**Files:**
- Create: `src/components/pet-hub/pet-health-tab.tsx`
- Create: `src/components/pet-hub/pet-food-tab.tsx`
- Create: `src/components/pet-hub/pet-behavior-tab.tsx`
- Create: `src/components/pet-hub/pet-training-tab.tsx`
- Create: `src/components/pet-hub/pet-calendar-tab.tsx`
- Create: `src/components/pet-hub/pet-documents-tab.tsx`

Cada tab segue o mesmo padrao: busca dados via tRPC filtrado por petId, exibe com SourceBadge, e condiciona botoes de acao ao role.

- [ ] **Step 1: Tab Saude**

Criar `src/components/pet-hub/pet-health-tab.tsx`:

```typescript
"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SourceBadge } from "./source-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Syringe, Pill, Shield } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PetHealthTabProps {
  petId: number;
  role: "admin" | "tutor";
}

export function PetHealthTab({ petId, role }: PetHealthTabProps) {
  const { data: vaccines, isLoading: vaccinesLoading } = trpc.medications.listVaccinations.useQuery(
    { petId },
    { staleTime: 5 * 60 * 1000 }
  );
  const { data: medications, isLoading: medsLoading } = trpc.medications.listByPet.useQuery(
    { petId },
    { staleTime: 5 * 60 * 1000 }
  );
  const { data: preventives, isLoading: prevLoading } = trpc.preventives.listByPet.useQuery(
    { petId },
    { staleTime: 5 * 60 * 1000 }
  );

  const isLoading = vaccinesLoading || medsLoading || prevLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}><CardContent className="py-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
        ))}
      </div>
    );
  }

  const renderList = (
    title: string,
    icon: React.ReactNode,
    items: Array<{ id: number; name?: string; date?: Date | string | null; source?: string }> | undefined,
    emptyText: string
  ) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {icon} {title}
        </CardTitle>
        <Button size="sm" variant="outline" className="gap-1">
          <Plus className="h-3 w-3" /> Adicionar
        </Button>
      </CardHeader>
      <CardContent>
        {items && items.length > 0 ? (
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium text-sm">{item.name || "—"}</p>
                    {item.date && (
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(item.date), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.source && <SourceBadge source={item.source as "admin" | "tutor"} />}
                  {(role === "admin" || item.source === "tutor") && (
                    <Button size="sm" variant="ghost" className="text-xs">Editar</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">{emptyText}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {renderList("Vacinas", <Syringe className="h-4 w-4" />, vaccines, "Nenhuma vacina registrada")}
      {renderList("Remedios", <Pill className="h-4 w-4" />, medications, "Nenhum remedio registrado")}
      {renderList("Preventivos", <Shield className="h-4 w-4" />, preventives, "Nenhum preventivo registrado")}
    </div>
  );
}
```

- [ ] **Step 2: Tab Alimentacao**

Criar `src/components/pet-hub/pet-food-tab.tsx`:

```typescript
"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SourceBadge } from "./source-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, UtensilsCrossed } from "lucide-react";

interface PetFoodTabProps {
  petId: number;
  role: "admin" | "tutor";
}

export function PetFoodTab({ petId, role }: PetFoodTabProps) {
  const { data: foodPlans, isLoading } = trpc.food.listPlans.useQuery(
    { petId },
    { staleTime: 5 * 60 * 1000 }
  );

  if (isLoading) {
    return <Card><CardContent className="py-4"><Skeleton className="h-32 w-full" /></CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4" /> Plano Alimentar
          </CardTitle>
          <Button size="sm" variant="outline" className="gap-1">
            <Plus className="h-3 w-3" /> Adicionar
          </Button>
        </CardHeader>
        <CardContent>
          {foodPlans && foodPlans.length > 0 ? (
            <div className="space-y-2">
              {foodPlans.map((plan: any) => (
                <div key={plan.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">{plan.foodBrand || plan.name || "Plano alimentar"}</p>
                    <p className="text-xs text-muted-foreground">
                      {plan.portionSize ? `${plan.portionSize}g` : ""} {plan.mealsPerDay ? `— ${plan.mealsPerDay}x/dia` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {plan.source && <SourceBadge source={plan.source} />}
                    {(role === "admin" || plan.source === "tutor") && (
                      <Button size="sm" variant="ghost" className="text-xs">Editar</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum plano alimentar registrado</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Tab Comportamento**

Criar `src/components/pet-hub/pet-behavior-tab.tsx`:

```typescript
"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SourceBadge } from "./source-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Brain } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PetBehaviorTabProps {
  petId: number;
  role: "admin" | "tutor";
}

export function PetBehaviorTab({ petId, role }: PetBehaviorTabProps) {
  const { data: logs, isLoading } = trpc.behavior.listByPet.useQuery(
    { petId, limit: 20 },
    { staleTime: 5 * 60 * 1000 }
  );

  if (isLoading) {
    return <Card><CardContent className="py-4"><Skeleton className="h-32 w-full" /></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="h-4 w-4" /> Comportamento
        </CardTitle>
        <Button size="sm" variant="outline" className="gap-1">
          <Plus className="h-3 w-3" /> Novo Log
        </Button>
      </CardHeader>
      <CardContent>
        {logs && logs.length > 0 ? (
          <div className="space-y-2">
            {logs.map((log: any) => (
              <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium text-sm">
                    {log.socialization || log.notes || "Log de comportamento"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {log.date ? format(new Date(log.date), "dd/MM/yyyy", { locale: ptBR }) : ""}
                    {log.energy ? ` — Energia: ${log.energy}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {log.source && <SourceBadge source={log.source} />}
                  {(role === "admin" || log.source === "tutor") && (
                    <Button size="sm" variant="ghost" className="text-xs">Editar</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum log de comportamento</p>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Tab Treinamento**

Criar `src/components/pet-hub/pet-training-tab.tsx`:

```typescript
"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SourceBadge } from "./source-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, GraduationCap } from "lucide-react";

interface PetTrainingTabProps {
  petId: number;
  role: "admin" | "tutor";
}

export function PetTrainingTab({ petId, role }: PetTrainingTabProps) {
  const { data: sessions, isLoading } = trpc.training.listByPet.useQuery(
    { petId, limit: 20 },
    { staleTime: 5 * 60 * 1000 }
  );

  if (isLoading) {
    return <Card><CardContent className="py-4"><Skeleton className="h-32 w-full" /></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <GraduationCap className="h-4 w-4" /> Treinamento
        </CardTitle>
        <Button size="sm" variant="outline" className="gap-1">
          <Plus className="h-3 w-3" /> Nova Sessao
        </Button>
      </CardHeader>
      <CardContent>
        {sessions && sessions.length > 0 ? (
          <div className="space-y-2">
            {sessions.map((session: any) => (
              <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium text-sm">{session.command || session.notes || "Sessao de treinamento"}</p>
                  <div className="flex gap-2 mt-1">
                    {session.proficiency && <Badge variant="outline" className="text-xs">{session.proficiency}</Badge>}
                    {session.successRate && <Badge variant="secondary" className="text-xs">{session.successRate}%</Badge>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {session.source && <SourceBadge source={session.source} />}
                  {(role === "admin" || session.source === "tutor") && (
                    <Button size="sm" variant="ghost" className="text-xs">Editar</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhuma sessao de treinamento</p>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 5: Tab Calendario**

Criar `src/components/pet-hub/pet-calendar-tab.tsx`:

```typescript
"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PetCalendarTabProps {
  petId: number;
  role: "admin" | "tutor";
}

export function PetCalendarTab({ petId, role }: PetCalendarTabProps) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);

  const { data: events, isLoading } = trpc.calendar.listByRange.useQuery(
    {
      petId,
      startDate: startOfMonth.toISOString(),
      endDate: endOfMonth.toISOString(),
    },
    { staleTime: 5 * 60 * 1000 }
  );

  if (isLoading) {
    return <Card><CardContent className="py-4"><Skeleton className="h-32 w-full" /></CardContent></Card>;
  }

  const typeBadge = (type: string) => {
    const colors: Record<string, string> = {
      vaccine: "bg-green-500/10 text-green-600",
      medication: "bg-blue-500/10 text-blue-600",
      checkin: "bg-purple-500/10 text-purple-600",
      checkout: "bg-orange-500/10 text-orange-600",
      grooming: "bg-pink-500/10 text-pink-600",
    };
    return <Badge className={colors[type] || ""}>{type}</Badge>;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-4 w-4" /> Proximos Eventos
        </CardTitle>
        {role === "admin" && (
          <Button size="sm" variant="outline" className="gap-1">
            <Plus className="h-3 w-3" /> Novo Evento
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {events && events.length > 0 ? (
          <div className="space-y-2">
            {events.map((event: any) => (
              <div key={event.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium text-sm">{event.title || event.type}</p>
                  <p className="text-xs text-muted-foreground">
                    {event.date ? format(new Date(event.date), "dd/MM/yyyy HH:mm", { locale: ptBR }) : ""}
                  </p>
                </div>
                {event.type && typeBadge(event.type)}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum evento nos proximos 2 meses</p>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 6: Tab Documentos**

Criar `src/components/pet-hub/pet-documents-tab.tsx`:

```typescript
"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SourceBadge } from "./source-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FileText, Download } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PetDocumentsTabProps {
  petId: number;
  role: "admin" | "tutor";
}

export function PetDocumentsTab({ petId, role }: PetDocumentsTabProps) {
  const { data: docs, isLoading } = trpc.documents.listByPet.useQuery(
    { petId },
    { staleTime: 5 * 60 * 1000 }
  );

  if (isLoading) {
    return <Card><CardContent className="py-4"><Skeleton className="h-32 w-full" /></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" /> Documentos
        </CardTitle>
        <Button size="sm" variant="outline" className="gap-1">
          <Plus className="h-3 w-3" /> Upload
        </Button>
      </CardHeader>
      <CardContent>
        {docs && docs.length > 0 ? (
          <div className="space-y-2">
            {docs.map((doc: any) => (
              <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{doc.name || doc.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.category || "Documento"}
                      {doc.createdAt ? ` — ${format(new Date(doc.createdAt), "dd/MM/yyyy", { locale: ptBR })}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {doc.source && <SourceBadge source={doc.source} />}
                  {doc.fileUrl && (
                    <Button size="sm" variant="ghost" asChild>
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {(role === "admin" || doc.source === "tutor") && (
                    <Button size="sm" variant="ghost" className="text-xs">Editar</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum documento</p>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add src/components/pet-hub/
git commit -m "feat: add all 6 hub tabs (health, food, behavior, training, calendar, documents)"
```

---

## Task 12: Paginas — Conectar Hub ao admin e tutor

**Files:**
- Create: `src/app/(dashboard)/admin/pets/[id]/hub/page.tsx`
- Modify: `src/app/(dashboard)/tutor/pets/[id]/page.tsx`

- [ ] **Step 1: Pagina hub do admin**

Criar `src/app/(dashboard)/admin/pets/[id]/hub/page.tsx`:

```typescript
"use client";

import { use } from "react";
import { PetHubPage } from "@/components/pet-hub/pet-hub-page";

interface AdminPetHubPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminPetHubPage({ params }: AdminPetHubPageProps) {
  const { id } = use(params);
  return <PetHubPage petId={parseInt(id)} role="admin" />;
}
```

- [ ] **Step 2: Substituir pagina do tutor pelo hub**

Ler o arquivo atual `src/app/(dashboard)/tutor/pets/[id]/page.tsx` e substituir o conteudo por:

```typescript
"use client";

import { use } from "react";
import { PetHubPage } from "@/components/pet-hub/pet-hub-page";

interface TutorPetPageProps {
  params: Promise<{ id: string }>;
}

export default function TutorPetDetailPage({ params }: TutorPetPageProps) {
  const { id } = use(params);
  return <PetHubPage petId={parseInt(id)} role="tutor" />;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(dashboard\)/admin/pets/\[id\]/hub/page.tsx src/app/\(dashboard\)/tutor/pets/\[id\]/page.tsx
git commit -m "feat: connect PetHubPage to admin (/pets/[id]/hub) and tutor (/pets/[id])"
```

---

## Task 13: Backend — Adicionar source/created_by nos routers de mutacao

**Files:**
- Modify: `src/lib/trpc/routers/pets.ts`

- [ ] **Step 1: Atualizar mutations de pet create/update**

No `src/lib/trpc/routers/pets.ts`, no mutation `create`, adicionar ao `.values()`:

```typescript
source: ctx.user.role === "admin" ? "admin" : "tutor",
createdByUserId: ctx.user.id,
```

No mutation `update`, apos a verificacao de permissao (para tutores), adicionar:

```typescript
// Se tutor, filtrar campos locked
if (ctx.user.role !== "admin") {
  const lockedFields = (existingPet.adminLockedFields as string[]) || [];
  const filteredData = filterTutorPetUpdate(lockedFields, updateData);
  // usar filteredData em vez de updateData
}
```

Importar no topo:

```typescript
import { filterTutorPetUpdate } from "../middleware/enforce-ownership";
```

- [ ] **Step 2: Aplicar padrao nos demais routers**

Para cada router que faz create em tabelas com source (medications, preventives, training, behavior, food, documents, calendar): adicionar `source` e `createdByUserId` no `.values()` do create, seguindo o padrao:

```typescript
source: ctx.user.role === "admin" ? "admin" : "tutor",
createdByUserId: ctx.user.id,
```

Para updates e deletes: chamar `enforceOwnership(ctx, table, recordId)` antes de executar.

- [ ] **Step 3: Commit**

```bash
git add src/lib/trpc/routers/
git commit -m "feat: add source/created_by to all create mutations, enforceOwnership to updates/deletes"
```

---

## Task 14: Adicionar link de Convites na sidebar do admin

**Files:**
- Modify: `src/components/layouts/admin-sidebar.tsx` (ou equivalente)

- [ ] **Step 1: Adicionar item de menu**

No componente de sidebar do admin, adicionar um novo item de navegacao:

```typescript
import { Mail } from "lucide-react";

// Adicionar ao array de menu items:
{
  title: "Convites",
  href: "/admin/invitations",
  icon: Mail,
},
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layouts/
git commit -m "feat: add Invitations link to admin sidebar"
```

---

## Task 15: Smoke test manual

- [ ] **Step 1: Verificar que o dev server compila sem erros**

Run: `cd /Users/rodrigorochameire/projetos/TeteCareHub && npm run dev`

Verificar que nao ha erros de TypeScript no terminal.

- [ ] **Step 2: Testar fluxo de convite**

1. Acessar `/admin/invitations` — deve carregar sem erros
2. Clicar "Novo Convite" — deve mostrar lista de tutores
3. Criar convite → copiar link
4. Abrir link em aba anonima → deve mostrar wizard de 4 passos
5. Completar os 4 passos → deve mostrar "Cadastro concluido"

- [ ] **Step 3: Testar hub do pet**

1. Acessar `/admin/pets/{id}/hub` — deve mostrar header + 7 tabs
2. Clicar em cada tab — deve carregar dados sem erros
3. Verificar botao WhatsApp no header — deve abrir wa.me

- [ ] **Step 4: Testar permissoes (como tutor)**

1. Logar como tutor → acessar `/tutor/pets/{id}` — deve mostrar hub
2. Verificar que dados com `source=admin` tem badge "Creche" e nao tem botao editar
3. Verificar que tutor nao ve pets de outros tutores

- [ ] **Step 5: Commit final**

```bash
git add .
git commit -m "feat: Sprint 1 complete — invitations, pet hub, ownership permissions"
```
