import { z } from "zod";
import { router, adminProcedure, protectedProcedure } from "../init";
import { db, pets, petTutors, users, calendarEvents, dailyLogs, petVaccinations, vaccineLibrary, notifications } from "@/lib/db";
import { eq, and, desc, gte, lte, sql, count } from "drizzle-orm";
import { safeAsync } from "@/lib/errors";

export const dashboardRouter = router({
  /**
   * Estatísticas do dashboard admin
   */
  stats: adminProcedure.query(async () => {
    return safeAsync(async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Query única otimizada com múltiplos counts
      const [stats] = await db.execute(sql`
        SELECT 
          (SELECT COUNT(*) FROM pets)::int as total_pets,
          (SELECT COUNT(*) FROM pets WHERE status = 'checked-in')::int as checked_in,
          (SELECT COUNT(*) FROM users WHERE role = 'user')::int as total_tutors,
          (SELECT COUNT(*) FROM pets WHERE approval_status = 'pending')::int as pending_approval,
          (SELECT COUNT(*) FROM daily_logs WHERE log_date >= ${today})::int as logs_today,
          (SELECT COALESCE(SUM(credits), 0) FROM pets)::int as total_credits
      `);

      const result = stats as {
        total_pets: number;
        checked_in: number;
        total_tutors: number;
        pending_approval: number;
        logs_today: number;
        total_credits: number;
      };

      return {
        totalPets: result.total_pets || 0,
        checkedIn: result.checked_in || 0,
        totalTutors: result.total_tutors || 0,
        pendingApproval: result.pending_approval || 0,
        logsToday: result.logs_today || 0,
        monthlyRevenue: (result.total_credits || 0) * 5000,
      };
    }, "Erro ao buscar estatísticas");
  }),

  /**
   * Pets na creche agora
   */
  checkedInPets: adminProcedure.query(async () => {
    return safeAsync(async () => {
      const result = await db
        .select()
        .from(pets)
        .where(eq(pets.status, "checked-in"))
        .orderBy(pets.name);

      return result;
    }, "Erro ao buscar pets na creche");
  }),

  /**
   * Eventos recentes do calendário
   */
  recentEvents: adminProcedure
    .input(z.object({ limit: z.number().default(5) }))
    .query(async ({ input }) => {
      return safeAsync(async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const result = await db
          .select({
            event: calendarEvents,
            pet: {
              id: pets.id,
              name: pets.name,
            },
          })
          .from(calendarEvents)
          .leftJoin(pets, eq(calendarEvents.petId, pets.id))
          .where(gte(calendarEvents.eventDate, today))
          .orderBy(calendarEvents.eventDate)
          .limit(input.limit);

        return result;
      }, "Erro ao buscar eventos recentes");
    }),

  /**
   * Dashboard do tutor
   */
  tutorStats: protectedProcedure.query(async ({ ctx }) => {
    return safeAsync(async () => {
      // Pets do tutor
      const myPets = await db
        .select({
          pet: pets,
        })
        .from(pets)
        .innerJoin(petTutors, eq(pets.id, petTutors.petId))
        .where(eq(petTutors.tutorId, ctx.user.id));

      // Total de créditos
      const totalCredits = myPets.reduce((acc, p) => acc + (p.pet.credits || 0), 0);

      // Próximas vacinas (próximos 30 dias)
      const petIds = myPets.map(p => p.pet.id);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      let upcomingVaccines = 0;
      if (petIds.length > 0) {
        const [result] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(petVaccinations)
          .where(
            and(
              sql`${petVaccinations.petId} = ANY(${petIds})`,
              gte(petVaccinations.nextDueDate, new Date()),
              lte(petVaccinations.nextDueDate, thirtyDaysFromNow)
            )
          );
        upcomingVaccines = result?.count || 0;
      }

      // Notificações não lidas
      const [unreadNotifications] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, ctx.user.id),
            eq(notifications.isRead, false)
          )
        );

      return {
        totalPets: myPets.length,
        totalCredits,
        upcomingVaccines,
        unreadNotifications: unreadNotifications?.count || 0,
        pets: myPets.map(p => p.pet),
      };
    }, "Erro ao buscar estatísticas do tutor");
  }),

  /**
   * Atividade recente (admin)
   */
  recentActivity: adminProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input }) => {
      return safeAsync(async () => {
        // Logs recentes
        const recentLogs = await db
          .select({
            id: dailyLogs.id,
            type: sql<string>`'log'`,
            date: dailyLogs.logDate,
            petId: dailyLogs.petId,
            petName: pets.name,
            description: sql<string>`'Log diário registrado'`,
          })
          .from(dailyLogs)
          .innerJoin(pets, eq(dailyLogs.petId, pets.id))
          .orderBy(desc(dailyLogs.createdAt))
          .limit(input.limit);

        return recentLogs;
      }, "Erro ao buscar atividade recente");
    }),
});
