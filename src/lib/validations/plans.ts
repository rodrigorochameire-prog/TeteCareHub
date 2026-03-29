import { z } from "zod";

// ==========================================
// ENUMS - PLANOS E PAGAMENTOS
// ==========================================

export const planTypeSchema = z.enum(["mensalista", "avulso", "diaria"]);
export type PlanType = z.infer<typeof planTypeSchema>;

// ==========================================
// SCHEMAS - PLANOS
// ==========================================

export const createPlanSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(100),
  type: planTypeSchema,
  includedDays: z.number().int().min(0),
  price: z.number().int().min(0),
  description: z.string().max(500).optional(),
});
export type CreatePlanInput = z.infer<typeof createPlanSchema>;

export const updatePlanSchema = createPlanSchema.partial().extend({
  id: z.number().int().positive(),
  isActive: z.boolean().optional(),
});
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;

// ==========================================
// SCHEMAS - VINCULACAO PET-PLANO
// ==========================================

export const assignPetPlanSchema = z.object({
  petId: z.number().int().positive(),
  planId: z.number().int().positive(),
  customName: z.string().max(100).optional(),
  customDays: z.number().int().min(0).optional(),
  customPrice: z.number().int().min(0).optional(),
  startDate: z.string().optional(),
  renewalDay: z.number().int().min(1).max(31).optional(),
  notes: z.string().max(1000).optional(),
});
export type AssignPetPlanInput = z.infer<typeof assignPetPlanSchema>;

export const updatePetPlanSchema = z.object({
  id: z.number().int().positive(),
  customName: z.string().max(100).optional(),
  customDays: z.number().int().min(0).optional(),
  customPrice: z.number().int().min(0).optional(),
  status: z.enum(["active", "paused", "cancelled"]).optional(),
  renewalDay: z.number().int().min(1).max(31).optional(),
  notes: z.string().max(1000).optional(),
});
export type UpdatePetPlanInput = z.infer<typeof updatePetPlanSchema>;

// ==========================================
// SCHEMAS - PAGAMENTOS
// ==========================================

export const paymentRequestSchema = z.object({
  petId: z.number().int().positive(),
  amount: z.number().int().min(0),
  daysRequested: z.number().int().min(1),
  method: z.enum(["pix", "cartao", "dinheiro", "transferencia"]),
  proofUrl: z.string().optional(),
});
export type PaymentRequestInput = z.infer<typeof paymentRequestSchema>;

export const reviewPaymentSchema = z.object({
  id: z.number().int().positive(),
  action: z.enum(["approve", "reject"]),
  adminNotes: z.string().max(500).optional(),
});
export type ReviewPaymentInput = z.infer<typeof reviewPaymentSchema>;

export const registerManualPaymentSchema = z.object({
  petId: z.number().int().positive(),
  days: z.number().int().min(1),
  amount: z.number().int().min(0),
  method: z.enum(["pix", "cartao", "dinheiro", "transferencia"]),
  notes: z.string().max(500).optional(),
});
export type RegisterManualPaymentInput = z.infer<typeof registerManualPaymentSchema>;

// ==========================================
// SCHEMAS - AUSENCIAS
// ==========================================

export const markAbsenceSchema = z.object({
  petId: z.number().int().positive(),
  date: z.string(),
  absenceType: z.enum(["falta", "feriado", "cancelado"]),
  notes: z.string().max(500).optional(),
});
export type MarkAbsenceInput = z.infer<typeof markAbsenceSchema>;
