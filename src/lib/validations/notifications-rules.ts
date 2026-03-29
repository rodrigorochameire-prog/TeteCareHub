import { z } from "zod";

export const notificationEventTypeSchema = z.enum(["vaccine", "preventive", "medication", "booking", "plan_renewal"]);

export const updateNotificationRuleSchema = z.object({
  id: z.number().int().positive(),
  daysBeforeCustom: z.number().int().min(1).max(90).nullable().optional(),
  notifyApp: z.boolean().optional(),
  notifyWhatsapp: z.boolean().optional(),
  isActive: z.boolean().optional(),
});
export type UpdateNotificationRuleInput = z.infer<typeof updateNotificationRuleSchema>;
