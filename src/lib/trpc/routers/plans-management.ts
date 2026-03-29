import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../init";
import { db, plans, petPlans, pets, petTutors } from "@/lib/db";
import { eq, and, desc } from "drizzle-orm";
import { Errors, safeAsync } from "@/lib/errors";
import {
  createPlanSchema,
  updatePlanSchema,
  assignPetPlanSchema,
  updatePetPlanSchema,
} from "@/lib/validations/plans";

export const plansManagementRouter = router({
  /**
   * Lista todos os planos (admin)
   */
  listPlans: adminProcedure.query(async () => {
    return safeAsync(async () => {
      const result = await db
        .select()
        .from(plans)
        .orderBy(plans.name);

      return result;
    }, "Erro ao listar planos");
  }),

  /**
   * Cria um novo plano (admin)
   */
  createPlan: adminProcedure
    .input(createPlanSchema)
    .mutation(async ({ input }) => {
      return safeAsync(async () => {
        const [newPlan] = await db
          .insert(plans)
          .values({
            name: input.name,
            type: input.type,
            includedDays: input.includedDays,
            price: input.price,
            description: input.description || null,
            isActive: true,
          })
          .returning();

        return newPlan;
      }, "Erro ao criar plano");
    }),

  /**
   * Atualiza um plano existente (admin)
   */
  updatePlan: adminProcedure
    .input(updatePlanSchema)
    .mutation(async ({ input }) => {
      return safeAsync(async () => {
        const { id, ...data } = input;

        const [existing] = await db
          .select()
          .from(plans)
          .where(eq(plans.id, id))
          .limit(1);

        if (!existing) {
          throw Errors.notFound("Plano");
        }

        const updateData: Record<string, unknown> = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.type !== undefined) updateData.type = data.type;
        if (data.includedDays !== undefined) updateData.includedDays = data.includedDays;
        if (data.price !== undefined) updateData.price = data.price;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;
        updateData.updatedAt = new Date();

        const [updated] = await db
          .update(plans)
          .set(updateData)
          .where(eq(plans.id, id))
          .returning();

        return updated;
      }, "Erro ao atualizar plano");
    }),

  /**
   * Ativa/desativa um plano (admin)
   */
  togglePlan: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      return safeAsync(async () => {
        const [existing] = await db
          .select()
          .from(plans)
          .where(eq(plans.id, input.id))
          .limit(1);

        if (!existing) {
          throw Errors.notFound("Plano");
        }

        const [updated] = await db
          .update(plans)
          .set({
            isActive: !existing.isActive,
            updatedAt: new Date(),
          })
          .where(eq(plans.id, input.id))
          .returning();

        return updated;
      }, "Erro ao alternar status do plano");
    }),

  /**
   * Vincula um plano a um pet (admin)
   * Se o pet já tiver plano ativo, cancela o anterior
   */
  assignToPet: adminProcedure
    .input(assignPetPlanSchema)
    .mutation(async ({ input }) => {
      return safeAsync(async () => {
        // Verificar se o pet existe
        const pet = await db.query.pets.findFirst({
          where: eq(pets.id, input.petId),
        });

        if (!pet) {
          throw Errors.notFound("Pet");
        }

        // Verificar se o plano existe
        const [plan] = await db
          .select()
          .from(plans)
          .where(eq(plans.id, input.planId))
          .limit(1);

        if (!plan) {
          throw Errors.notFound("Plano");
        }

        // Cancelar plano ativo anterior, se existir
        const [activePlan] = await db
          .select()
          .from(petPlans)
          .where(
            and(
              eq(petPlans.petId, input.petId),
              eq(petPlans.status, "active")
            )
          )
          .limit(1);

        if (activePlan) {
          await db
            .update(petPlans)
            .set({
              status: "cancelled",
              updatedAt: new Date(),
            })
            .where(eq(petPlans.id, activePlan.id));
        }

        // Criar novo vínculo
        const [newPetPlan] = await db
          .insert(petPlans)
          .values({
            petId: input.petId,
            planId: input.planId,
            customName: input.customName || null,
            customDays: input.customDays ?? null,
            customPrice: input.customPrice ?? null,
            status: "active",
            startDate: input.startDate || null,
            renewalDay: input.renewalDay ?? null,
            notes: input.notes || null,
          })
          .returning();

        return newPetPlan;
      }, "Erro ao vincular plano ao pet");
    }),

  /**
   * Retorna o plano ativo de um pet
   * Não-admins só podem ver planos dos próprios pets
   */
  getPetPlan: protectedProcedure
    .input(z.object({ petId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      return safeAsync(async () => {
        const userId = ctx.user!.id;

        // Verificar permissão para não-admins
        if (ctx.user!.role !== "admin") {
          const ownership = await db.query.petTutors.findFirst({
            where: and(
              eq(petTutors.petId, input.petId),
              eq(petTutors.tutorId, userId)
            ),
          });

          if (!ownership) {
            throw Errors.forbidden("Você não tem permissão para ver este plano");
          }
        }

        // Buscar plano ativo do pet com dados do plano
        const result = await db
          .select({
            petPlan: petPlans,
            plan: plans,
          })
          .from(petPlans)
          .innerJoin(plans, eq(petPlans.planId, plans.id))
          .where(
            and(
              eq(petPlans.petId, input.petId),
              eq(petPlans.status, "active")
            )
          )
          .limit(1);

        return result[0] || null;
      }, "Erro ao buscar plano do pet");
    }),

  /**
   * Atualiza vínculo pet-plano (admin)
   */
  updatePetPlan: adminProcedure
    .input(updatePetPlanSchema)
    .mutation(async ({ input }) => {
      return safeAsync(async () => {
        const { id, ...data } = input;

        const [existing] = await db
          .select()
          .from(petPlans)
          .where(eq(petPlans.id, id))
          .limit(1);

        if (!existing) {
          throw Errors.notFound("Vínculo pet-plano");
        }

        const updateData: Record<string, unknown> = {};
        if (data.customName !== undefined) updateData.customName = data.customName;
        if (data.customDays !== undefined) updateData.customDays = data.customDays;
        if (data.customPrice !== undefined) updateData.customPrice = data.customPrice;
        if (data.status !== undefined) updateData.status = data.status;
        if (data.renewalDay !== undefined) updateData.renewalDay = data.renewalDay;
        if (data.notes !== undefined) updateData.notes = data.notes;
        updateData.updatedAt = new Date();

        const [updated] = await db
          .update(petPlans)
          .set(updateData)
          .where(eq(petPlans.id, id))
          .returning();

        return updated;
      }, "Erro ao atualizar vínculo pet-plano");
    }),
});
