import { z } from "zod";
import { router, adminProcedure, protectedProcedure } from "../init";
import { db, pets, calendarEvents } from "@/lib/db";
import { eq } from "drizzle-orm";
import { safeAsync, Errors } from "@/lib/errors";
import { DaycareService } from "@/lib/services/daycare.service";

export const checkinRouter = router({
  /**
   * Faz check-in de um pet (Usa DaycareService)
   * O crédito é debitado no CHECK-OUT, não no check-in
   */
  checkIn: adminProcedure
    .input(z.object({ 
      petId: z.number(),
      skipCreditCheck: z.boolean().optional(),
      bypassReason: z.string().max(500).optional(),
      notes: z.string().max(500).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return safeAsync(async () => {
        const result = await DaycareService.processCheckIn({
          petId: input.petId,
          userId: ctx.user!.id,
          skipCreditCheck: input.skipCreditCheck,
          bypassReason: input.bypassReason,
          notes: input.notes,
        });

        return {
          ...result.pet,
          eventId: result.eventId,
          alerts: result.alerts,
          message: result.message,
        };
      }, "Erro ao fazer check-in");
    }),

  /**
   * Faz check-out de um pet (Usa DaycareService - Check-out Inteligente)
   * 
   * Funcionalidades:
   * - Calcula tempo de estadia
   * - Debita crédito correto (meio período vs integral)
   * - Registra transação financeira
   * - Deduz porção de ração do estoque
   * - Verifica saldo e gera alertas
   */
  checkOut: adminProcedure
    .input(z.object({ 
      petId: z.number(),
      notes: z.string().max(500).optional(),
      forceCreditType: z.enum(["half_day", "full_day"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return safeAsync(async () => {
        const result = await DaycareService.processCheckOut({
          petId: input.petId,
          userId: ctx.user!.id,
          notes: input.notes,
          forceCreditType: input.forceCreditType,
        });

        return {
          ...result.pet,
          eventId: result.eventId,
          stayDurationMinutes: result.stayDurationMinutes,
          creditsDeducted: result.creditsDeducted,
          creditType: result.creditType,
          alerts: result.alerts,
          message: result.message,
        };
      }, "Erro ao fazer check-out");
    }),

  /**
   * Valida se um pet pode fazer check-in
   * Retorna lista de alertas e bloqueios
   */
  validateCheckIn: adminProcedure
    .input(z.object({ petId: z.number() }))
    .query(async ({ input }) => {
      return safeAsync(async () => {
        return DaycareService.validateCheckIn(input.petId);
      }, "Erro ao validar check-in");
    }),

  /**
   * Lista pets na creche
   */
  list: protectedProcedure.query(async () => {
    return safeAsync(async () => {
      const result = await db
        .select()
        .from(pets)
        .where(eq(pets.status, "checked-in"))
        .orderBy(pets.name);

      return result;
    }, "Erro ao listar pets na creche");
  }),

  /**
   * Status de check-in de um pet com informações adicionais
   */
  status: protectedProcedure
    .input(z.object({ petId: z.number() }))
    .query(async ({ input }) => {
      return safeAsync(async () => {
        const pet = await db.query.pets.findFirst({
          where: eq(pets.id, input.petId),
        });

        if (!pet) {
          throw Errors.notFound("Pet");
        }

        // Buscar último evento para calcular tempo na creche
        let currentStayMinutes: number | null = null;
        if (pet.status === "checked-in") {
          const lastCheckin = await db.query.calendarEvents.findFirst({
            where: eq(calendarEvents.petId, input.petId),
            orderBy: (c, { desc }) => [desc(c.eventDate)],
          });

          if (lastCheckin && lastCheckin.eventType === "checkin") {
            const checkinTime = new Date(lastCheckin.eventDate);
            currentStayMinutes = Math.round((Date.now() - checkinTime.getTime()) / (1000 * 60));
          }
        }

        return {
          petId: pet.id,
          name: pet.name,
          status: pet.status,
          credits: pet.credits || 0,
          isCheckedIn: pet.status === "checked-in",
          currentStayMinutes,
          hasCredits: (pet.credits || 0) > 0,
          lowCredits: (pet.credits || 0) > 0 && (pet.credits || 0) <= 3,
        };
      }, "Erro ao buscar status do pet");
    }),
});
