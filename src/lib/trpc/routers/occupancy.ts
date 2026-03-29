import { z } from "zod";
import { router, adminProcedure } from "../init";
import { db, pets, daycareSettings, calendarEvents } from "@/lib/db";
import { eq, and, gte, lte, sql, isNull } from "drizzle-orm";
import { safeAsync } from "@/lib/errors";

const DEFAULT_MAX_CAPACITY = 15;

export const occupancyRouter = router({
  /**
   * Ocupação atual da creche (admin)
   * Retorna pets com check-in + capacidade máxima
   */
  current: adminProcedure.query(async () => {
    return safeAsync(async () => {
      // Buscar pets com check-in ativo
      const checkedInPets = await db
        .select()
        .from(pets)
        .where(eq(pets.status, "checked-in"))
        .orderBy(pets.name);

      // Buscar capacidade máxima
      const [setting] = await db
        .select()
        .from(daycareSettings)
        .where(eq(daycareSettings.key, "max_capacity"))
        .limit(1);

      const maxCapacity = setting ? parseInt(setting.value, 10) : DEFAULT_MAX_CAPACITY;

      return {
        pets: checkedInPets,
        count: checkedInPets.length,
        maxCapacity,
        availableSpots: Math.max(0, maxCapacity - checkedInPets.length),
        isFull: checkedInPets.length >= maxCapacity,
        occupancyPercent: maxCapacity > 0
          ? Math.round((checkedInPets.length / maxCapacity) * 100)
          : 0,
      };
    }, "Erro ao buscar ocupação atual");
  }),

  /**
   * Capacidade máxima da creche (admin)
   */
  getCapacity: adminProcedure.query(async () => {
    return safeAsync(async () => {
      const [setting] = await db
        .select()
        .from(daycareSettings)
        .where(eq(daycareSettings.key, "max_capacity"))
        .limit(1);

      return {
        maxCapacity: setting ? parseInt(setting.value, 10) : DEFAULT_MAX_CAPACITY,
      };
    }, "Erro ao buscar capacidade");
  }),

  /**
   * Relatório mensal de ocupação (admin)
   * Retorna breakdown diário, taxa média, pico, dia mais vazio e ranking de pets
   */
  monthlyReport: adminProcedure
    .input(z.object({ month: z.number().min(0).max(11), year: z.number() }))
    .query(async ({ input }) => {
      return safeAsync(async () => {
        const { month, year } = input;
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0); // último dia do mês
        const totalDays = endDate.getDate();

        // Buscar capacidade
        const [capacitySetting] = await db
          .select()
          .from(daycareSettings)
          .where(eq(daycareSettings.key, "max_capacity"))
          .limit(1);
        const capacity = capacitySetting
          ? parseInt(capacitySetting.value, 10)
          : DEFAULT_MAX_CAPACITY;

        // Buscar todos os check-ins do mês (não deletados)
        const checkins = await db
          .select({
            eventDate: calendarEvents.eventDate,
            petId: calendarEvents.petId,
          })
          .from(calendarEvents)
          .where(
            and(
              eq(calendarEvents.eventType, "checkin"),
              gte(calendarEvents.eventDate, startDate),
              lte(calendarEvents.eventDate, endDate),
              isNull(calendarEvents.deletedAt)
            )
          );

        // Agrupar por dia → contar pets distintos
        const dailyMap = new Map<number, Set<number>>();
        for (let d = 1; d <= totalDays; d++) {
          dailyMap.set(d, new Set());
        }

        for (const row of checkins) {
          if (row.petId == null) continue;
          const day = new Date(row.eventDate).getDate();
          dailyMap.get(day)?.add(row.petId);
        }

        // Breakdown diário
        const dailyBreakdown = Array.from(dailyMap.entries()).map(
          ([day, petSet]) => ({
            day,
            count: petSet.size,
            rate: capacity > 0 ? Math.round((petSet.size / capacity) * 100) : 0,
          })
        );

        // Estatísticas
        const counts = dailyBreakdown.map((d) => d.count);
        const totalCount = counts.reduce((a, b) => a + b, 0);
        const averageOccupancy = totalDays > 0 ? Math.round(totalCount / totalDays) : 0;
        const occupancyRate =
          capacity > 0 && totalDays > 0
            ? Math.round((totalCount / (capacity * totalDays)) * 100)
            : 0;

        const peakDay =
          dailyBreakdown.length > 0
            ? dailyBreakdown.reduce((a, b) => (b.count > a.count ? b : a))
            : null;
        const lowestDay =
          dailyBreakdown.length > 0
            ? dailyBreakdown.reduce((a, b) => (b.count < a.count ? b : a))
            : null;

        // Ranking de pets: quantos dias cada pet apareceu
        const petDaysMap = new Map<number, number>();
        dailyMap.forEach((petSet) => {
          petSet.forEach((petId) => {
            petDaysMap.set(petId, (petDaysMap.get(petId) ?? 0) + 1);
          });
        });

        // Buscar nomes dos pets
        const petIds = Array.from(petDaysMap.keys());
        let petNameMap = new Map<number, string>();
        if (petIds.length > 0) {
          const petRows = await db
            .select({ id: pets.id, name: pets.name })
            .from(pets)
            .where(
              sql`${pets.id} IN (${sql.join(
                petIds.map((id) => sql`${id}`),
                sql`, `
              )})`
            );
          petNameMap = new Map(petRows.map((p) => [p.id, p.name]));
        }

        const petRanking = Array.from(petDaysMap.entries())
          .map(([petId, days]) => ({
            petId,
            name: petNameMap.get(petId) ?? `Pet #${petId}`,
            daysPresent: days,
            percentOfMonth:
              totalDays > 0 ? Math.round((days / totalDays) * 100) : 0,
          }))
          .sort((a, b) => b.daysPresent - a.daysPresent);

        return {
          totalDays,
          capacity,
          averageOccupancy,
          occupancyRate,
          peakDay,
          lowestDay,
          dailyBreakdown,
          petRanking,
        };
      }, "Erro ao gerar relatório de ocupação");
    }),

  /**
   * Define capacidade máxima da creche (admin)
   * Upsert na tabela daycare_settings
   */
  setCapacity: adminProcedure
    .input(z.object({
      maxCapacity: z.number().int().min(1, "Capacidade mínima é 1").max(200, "Capacidade máxima é 200"),
    }))
    .mutation(async ({ input }) => {
      return safeAsync(async () => {
        const [existing] = await db
          .select()
          .from(daycareSettings)
          .where(eq(daycareSettings.key, "max_capacity"))
          .limit(1);

        if (existing) {
          const [updated] = await db
            .update(daycareSettings)
            .set({
              value: String(input.maxCapacity),
              updatedAt: new Date(),
            })
            .where(eq(daycareSettings.key, "max_capacity"))
            .returning();

          return updated;
        }

        const [created] = await db
          .insert(daycareSettings)
          .values({
            key: "max_capacity",
            value: String(input.maxCapacity),
          })
          .returning();

        return created;
      }, "Erro ao definir capacidade");
    }),
});
