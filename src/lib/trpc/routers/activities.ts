import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../init";
import { db, activities, petActivityLogs, pets, petTutors } from "@/lib/db";
import { eq, and, desc, asc } from "drizzle-orm";
import { Errors, safeAsync } from "@/lib/errors";
import {
  createActivitySchema,
  updateActivitySchema,
  logActivitySchema,
  logMultipleActivitiesSchema,
} from "@/lib/validations/activities";

export const activitiesRouter = router({
  /**
   * Lista atividades ativas, ordenadas por displayOrder (admin)
   */
  list: adminProcedure.query(async () => {
    return safeAsync(async () => {
      const result = await db
        .select()
        .from(activities)
        .where(eq(activities.isActive, true))
        .orderBy(asc(activities.displayOrder), asc(activities.name));

      return result;
    }, "Erro ao listar atividades");
  }),

  /**
   * Lista todas as atividades, incluindo inativas (admin)
   */
  listAll: adminProcedure.query(async () => {
    return safeAsync(async () => {
      const result = await db
        .select()
        .from(activities)
        .orderBy(asc(activities.displayOrder), asc(activities.name));

      return result;
    }, "Erro ao listar todas as atividades");
  }),

  /**
   * Cria uma nova atividade (admin)
   */
  create: adminProcedure
    .input(createActivitySchema)
    .mutation(async ({ input }) => {
      return safeAsync(async () => {
        const [newActivity] = await db
          .insert(activities)
          .values({
            name: input.name,
            icon: input.icon || null,
            displayOrder: input.displayOrder ?? 0,
            isActive: true,
          })
          .returning();

        return newActivity;
      }, "Erro ao criar atividade");
    }),

  /**
   * Atualiza uma atividade existente (admin)
   */
  update: adminProcedure
    .input(updateActivitySchema)
    .mutation(async ({ input }) => {
      return safeAsync(async () => {
        const { id, ...data } = input;

        const [existing] = await db
          .select()
          .from(activities)
          .where(eq(activities.id, id))
          .limit(1);

        if (!existing) {
          throw Errors.notFound("Atividade");
        }

        const updateData: Record<string, unknown> = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.icon !== undefined) updateData.icon = data.icon;
        if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;

        const [updated] = await db
          .update(activities)
          .set(updateData)
          .where(eq(activities.id, id))
          .returning();

        return updated;
      }, "Erro ao atualizar atividade");
    }),

  /**
   * Ativa/desativa uma atividade (admin)
   */
  toggle: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      return safeAsync(async () => {
        const [existing] = await db
          .select()
          .from(activities)
          .where(eq(activities.id, input.id))
          .limit(1);

        if (!existing) {
          throw Errors.notFound("Atividade");
        }

        const [updated] = await db
          .update(activities)
          .set({ isActive: !existing.isActive })
          .where(eq(activities.id, input.id))
          .returning();

        return updated;
      }, "Erro ao alternar status da atividade");
    }),

  /**
   * Registra uma atividade para um pet (protegido)
   */
  logActivity: protectedProcedure
    .input(logActivitySchema)
    .mutation(async ({ ctx, input }) => {
      return safeAsync(async () => {
        const [log] = await db
          .insert(petActivityLogs)
          .values({
            petId: input.petId,
            activityId: input.activityId ?? null,
            customName: input.customName || null,
            logDate: input.logDate,
            notes: input.notes || null,
            createdById: ctx.user!.id,
          })
          .returning();

        return log;
      }, "Erro ao registrar atividade");
    }),

  /**
   * Registra múltiplas atividades para um pet+data (protegido)
   */
  logMultiple: protectedProcedure
    .input(logMultipleActivitiesSchema)
    .mutation(async ({ ctx, input }) => {
      return safeAsync(async () => {
        const values = input.activities.map((a) => ({
          petId: input.petId,
          activityId: a.activityId ?? null,
          customName: a.customName || null,
          logDate: input.logDate,
          notes: a.notes || null,
          createdById: ctx.user!.id,
        }));

        const logs = await db
          .insert(petActivityLogs)
          .values(values)
          .returning();

        return logs;
      }, "Erro ao registrar atividades");
    }),

  /**
   * Histórico de atividades de um pet (protegido)
   * Tutores só podem ver os próprios pets
   */
  getByPet: protectedProcedure
    .input(z.object({
      petId: z.number().int().positive(),
      limit: z.number().int().min(1).max(100).default(50),
    }))
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
            throw Errors.forbidden("Você não tem permissão para ver este pet");
          }
        }

        const result = await db
          .select({
            log: petActivityLogs,
            activity: activities,
          })
          .from(petActivityLogs)
          .leftJoin(activities, eq(petActivityLogs.activityId, activities.id))
          .where(eq(petActivityLogs.petId, input.petId))
          .orderBy(desc(petActivityLogs.logDate), desc(petActivityLogs.createdAt))
          .limit(input.limit);

        return result;
      }, "Erro ao buscar atividades do pet");
    }),

  /**
   * Todas as atividades registradas em uma data (admin)
   */
  getByDate: adminProcedure
    .input(z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}/, "Data inválida (use YYYY-MM-DD)"),
    }))
    .query(async ({ input }) => {
      return safeAsync(async () => {
        const result = await db
          .select({
            log: petActivityLogs,
            activity: activities,
            pet: {
              id: pets.id,
              name: pets.name,
              photoUrl: pets.photoUrl,
            },
          })
          .from(petActivityLogs)
          .leftJoin(activities, eq(petActivityLogs.activityId, activities.id))
          .innerJoin(pets, eq(petActivityLogs.petId, pets.id))
          .where(eq(petActivityLogs.logDate, input.date))
          .orderBy(asc(pets.name), desc(petActivityLogs.createdAt));

        return result;
      }, "Erro ao buscar atividades por data");
    }),
});
