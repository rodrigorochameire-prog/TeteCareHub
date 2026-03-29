import { z } from "zod";
import { router, adminProcedure } from "../init";
import { db, pets, daycareSettings } from "@/lib/db";
import { eq } from "drizzle-orm";
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
