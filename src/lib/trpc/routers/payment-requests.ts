import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../init";
import { db, pets, petTutors, petPlans, paymentRequests, notifications, users } from "@/lib/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { Errors, safeAsync } from "@/lib/errors";
import {
  paymentRequestSchema,
  reviewPaymentSchema,
  registerManualPaymentSchema,
} from "@/lib/validations/plans";
import { transactions } from "./finances";

export const paymentRequestsRouter = router({
  /**
   * Tutor cria solicitação de pagamento
   */
  create: protectedProcedure
    .input(paymentRequestSchema)
    .mutation(async ({ ctx, input }) => {
      return safeAsync(async () => {
        const userId = ctx.user!.id;

        // Verificar se o pet pertence ao tutor
        const ownership = await db.query.petTutors.findFirst({
          where: and(
            eq(petTutors.petId, input.petId),
            eq(petTutors.tutorId, userId)
          ),
        });

        if (!ownership) {
          throw Errors.forbidden("Você não tem permissão para este pet");
        }

        // Buscar pet_plan ativo do pet
        const [activePetPlan] = await db
          .select()
          .from(petPlans)
          .where(
            and(
              eq(petPlans.petId, input.petId),
              eq(petPlans.status, "active")
            )
          )
          .limit(1);

        // Criar solicitação de pagamento
        const [request] = await db
          .insert(paymentRequests)
          .values({
            petPlanId: activePetPlan?.id ?? null,
            petId: input.petId,
            tutorId: userId,
            amount: input.amount,
            daysRequested: input.daysRequested,
            method: input.method,
            proofUrl: input.proofUrl || null,
            status: "pending",
          })
          .returning();

        return request;
      }, "Erro ao criar solicitação de pagamento");
    }),

  /**
   * Lista solicitações pendentes (admin)
   */
  listPending: adminProcedure.query(async () => {
    return safeAsync(async () => {
      const result = await db
        .select({
          request: paymentRequests,
          tutor: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
          pet: {
            id: pets.id,
            name: pets.name,
          },
        })
        .from(paymentRequests)
        .innerJoin(users, eq(paymentRequests.tutorId, users.id))
        .innerJoin(pets, eq(paymentRequests.petId, pets.id))
        .where(eq(paymentRequests.status, "pending"))
        .orderBy(desc(paymentRequests.createdAt));

      return result;
    }, "Erro ao listar solicitações pendentes");
  }),

  /**
   * Lista solicitações do tutor logado
   */
  listByTutor: protectedProcedure.query(async ({ ctx }) => {
    return safeAsync(async () => {
      const userId = ctx.user!.id;

      const result = await db
        .select({
          request: paymentRequests,
          pet: {
            id: pets.id,
            name: pets.name,
          },
        })
        .from(paymentRequests)
        .innerJoin(pets, eq(paymentRequests.petId, pets.id))
        .where(eq(paymentRequests.tutorId, userId))
        .orderBy(desc(paymentRequests.createdAt));

      return result;
    }, "Erro ao listar solicitações do tutor");
  }),

  /**
   * Lista solicitações de um pet específico
   * Não-admins só podem ver seus próprios pets
   */
  listByPet: protectedProcedure
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
            throw Errors.forbidden("Você não tem permissão para ver este pet");
          }
        }

        const result = await db
          .select()
          .from(paymentRequests)
          .where(eq(paymentRequests.petId, input.petId))
          .orderBy(desc(paymentRequests.createdAt));

        return result;
      }, "Erro ao listar solicitações do pet");
    }),

  /**
   * Admin revisa (aprova/rejeita) solicitação de pagamento
   */
  review: adminProcedure
    .input(reviewPaymentSchema)
    .mutation(async ({ ctx, input }) => {
      return safeAsync(async () => {
        const adminId = ctx.user!.id;

        const [request] = await db
          .select()
          .from(paymentRequests)
          .where(eq(paymentRequests.id, input.id))
          .limit(1);

        if (!request) {
          throw Errors.notFound("Solicitação de pagamento");
        }

        if (request.status !== "pending") {
          throw Errors.badRequest("Esta solicitação já foi revisada");
        }

        if (input.action === "approve") {
          // Aprovar: atualizar status, incrementar créditos, notificar tutor
          await db
            .update(paymentRequests)
            .set({
              status: "approved",
              reviewedBy: adminId,
              reviewedAt: new Date(),
              adminNotes: input.adminNotes || null,
              updatedAt: new Date(),
            })
            .where(eq(paymentRequests.id, input.id));

          // Incrementar créditos do pet atomicamente
          await db
            .update(pets)
            .set({ credits: sql`credits + ${request.daysRequested}` })
            .where(eq(pets.id, request.petId));

          // Notificar tutor
          await db.insert(notifications).values({
            userId: request.tutorId,
            title: "Pagamento aprovado",
            message: `Seu pagamento de ${request.daysRequested} diária(s) foi aprovado. Os créditos já foram adicionados.`,
            type: "success",
            isRead: false,
          });
        } else {
          // Rejeitar: atualizar status e notificar tutor
          await db
            .update(paymentRequests)
            .set({
              status: "rejected",
              reviewedBy: adminId,
              reviewedAt: new Date(),
              adminNotes: input.adminNotes || null,
              updatedAt: new Date(),
            })
            .where(eq(paymentRequests.id, input.id));

          // Notificar tutor
          await db.insert(notifications).values({
            userId: request.tutorId,
            title: "Pagamento não aprovado",
            message: input.adminNotes
              ? `Seu pagamento não foi aprovado. Motivo: ${input.adminNotes}`
              : "Seu pagamento não foi aprovado. Entre em contato para mais informações.",
            type: "warning",
            isRead: false,
          });
        }

        // Retornar solicitação atualizada
        const [updated] = await db
          .select()
          .from(paymentRequests)
          .where(eq(paymentRequests.id, input.id));

        return updated;
      }, "Erro ao revisar solicitação de pagamento");
    }),

  /**
   * Registra pagamento manual (admin) - crédito direto sem fluxo de aprovação
   */
  registerManual: adminProcedure
    .input(registerManualPaymentSchema)
    .mutation(async ({ ctx, input }) => {
      return safeAsync(async () => {
        const adminId = ctx.user!.id;

        // Verificar se o pet existe
        const pet = await db.query.pets.findFirst({
          where: eq(pets.id, input.petId),
        });

        if (!pet) {
          throw Errors.notFound("Pet");
        }

        // Incrementar créditos do pet atomicamente
        await db
          .update(pets)
          .set({ credits: sql`credits + ${input.days}` })
          .where(eq(pets.id, input.petId));

        // Criar registro de transação
        const [transaction] = await db
          .insert(transactions)
          .values({
            petId: input.petId,
            userId: adminId,
            type: "credit_purchase",
            amount: input.amount,
            credits: input.days,
            description: input.notes || `Pagamento manual: ${input.days} diária(s) via ${input.method}`,
          })
          .returning();

        return transaction;
      }, "Erro ao registrar pagamento manual");
    }),

  /**
   * Lista todas as solicitações (admin) - para histórico
   */
  listAll: adminProcedure.query(async () => {
    return safeAsync(async () => {
      const result = await db
        .select({
          request: paymentRequests,
          tutor: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
          pet: {
            id: pets.id,
            name: pets.name,
          },
        })
        .from(paymentRequests)
        .innerJoin(users, eq(paymentRequests.tutorId, users.id))
        .innerJoin(pets, eq(paymentRequests.petId, pets.id))
        .orderBy(desc(paymentRequests.createdAt));

      return result;
    }, "Erro ao listar todas as solicitações");
  }),

  /**
   * Conta solicitações pendentes (para badge no sidebar)
   */
  pendingCount: adminProcedure.query(async () => {
    return safeAsync(async () => {
      const [result] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(paymentRequests)
        .where(eq(paymentRequests.status, "pending"));

      return result.count;
    }, "Erro ao contar solicitações pendentes");
  }),
});
