import { z } from "zod";

// ==========================================
// SCHEMAS - ATIVIDADES
// ==========================================

export const createActivitySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  icon: z.string().max(50).optional(),
  displayOrder: z.number().int().min(0).default(0),
});
export type CreateActivityInput = z.infer<typeof createActivitySchema>;

export const updateActivitySchema = createActivitySchema.partial().extend({
  id: z.number().int().positive(),
  isActive: z.boolean().optional(),
});
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;

// ==========================================
// SCHEMAS - REGISTROS DE ATIVIDADES
// ==========================================

export const logActivitySchema = z.object({
  petId: z.number().int().positive(),
  activityId: z.number().int().positive().optional(),
  customName: z.string().max(100).optional(),
  logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/, "Data inválida (use YYYY-MM-DD)"),
  notes: z.string().max(2000).optional(),
});
export type LogActivityInput = z.infer<typeof logActivitySchema>;

export const logMultipleActivitiesSchema = z.object({
  petId: z.number().int().positive(),
  logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/, "Data inválida (use YYYY-MM-DD)"),
  activities: z.array(z.object({
    activityId: z.number().int().positive().optional(),
    customName: z.string().max(100).optional(),
    notes: z.string().max(2000).optional(),
  })).min(1, "Pelo menos uma atividade é obrigatória"),
});
export type LogMultipleActivitiesInput = z.infer<typeof logMultipleActivitiesSchema>;

// ==========================================
// SCHEMAS - CONFIGURAÇÕES DA CRECHE
// ==========================================

export const updateSettingSchema = z.object({
  key: z.string().min(1).max(50),
  value: z.string().min(1, "Valor é obrigatório").max(200),
});
export type UpdateSettingInput = z.infer<typeof updateSettingSchema>;
