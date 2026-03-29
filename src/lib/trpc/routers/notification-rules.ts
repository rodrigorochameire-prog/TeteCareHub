import { router, adminProcedure } from "../init";
import { db, notificationRules } from "@/lib/db";
import { eq } from "drizzle-orm";
import { Errors, safeAsync } from "@/lib/errors";
import { updateNotificationRuleSchema } from "@/lib/validations/notifications-rules";

export const notificationRulesRouter = router({
  /**
   * Lista todas as regras de notificação (admin)
   */
  list: adminProcedure.query(async () => {
    return safeAsync(async () => {
      const result = await db
        .select()
        .from(notificationRules)
        .orderBy(notificationRules.eventType);

      return result;
    }, "Erro ao listar regras de notificação");
  }),

  /**
   * Atualiza uma regra de notificação (admin)
   */
  update: adminProcedure
    .input(updateNotificationRuleSchema)
    .mutation(async ({ input }) => {
      return safeAsync(async () => {
        const { id, ...data } = input;

        const [existing] = await db
          .select()
          .from(notificationRules)
          .where(eq(notificationRules.id, id))
          .limit(1);

        if (!existing) {
          throw Errors.notFound("Regra de notificação");
        }

        const updateData: Record<string, unknown> = {};
        if (data.daysBeforeCustom !== undefined) updateData.daysBeforeCustom = data.daysBeforeCustom;
        if (data.notifyApp !== undefined) updateData.notifyApp = data.notifyApp;
        if (data.notifyWhatsapp !== undefined) updateData.notifyWhatsapp = data.notifyWhatsapp;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;
        updateData.updatedAt = new Date();

        const [updated] = await db
          .update(notificationRules)
          .set(updateData)
          .where(eq(notificationRules.id, id))
          .returning();

        return updated;
      }, "Erro ao atualizar regra de notificação");
    }),

  /**
   * Retorna apenas regras ativas (admin)
   */
  getActiveRules: adminProcedure.query(async () => {
    return safeAsync(async () => {
      const result = await db
        .select()
        .from(notificationRules)
        .where(eq(notificationRules.isActive, true))
        .orderBy(notificationRules.eventType);

      return result;
    }, "Erro ao listar regras de notificação ativas");
  }),
});
