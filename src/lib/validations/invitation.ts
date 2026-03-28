import { z } from "zod";

// ==========================================
// ENUMS - CONVITES E ONBOARDING
// ==========================================

export const invitationStatusSchema = z.enum(["pending", "completed", "expired"]);
export type InvitationStatus = z.infer<typeof invitationStatusSchema>;

export const onboardingStatusSchema = z.enum(["not_started", "in_progress", "completed"]);
export type OnboardingStatus = z.infer<typeof onboardingStatusSchema>;

export const sourceSchema = z.enum(["admin", "tutor"]);
export type Source = z.infer<typeof sourceSchema>;

// ==========================================
// SCHEMAS - CRIAÇÃO DE CONVITE
// ==========================================

export const createInvitationSchema = z.object({
  tutorId: z.number().int().positive("Tutor e obrigatorio"),
  petIds: z.array(z.number().int().positive()).min(1, "Selecione pelo menos um pet"),
  dashboardAccess: z.boolean().default(true),
});
export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;

// ==========================================
// SCHEMAS - ONBOARDING DO TUTOR
// ==========================================

export const tutorOnboardingStep1Schema = z.object({
  token: z.string().min(1),
  address: z.string().max(500).optional(),
  emergencyContact: z.string().max(200).optional(),
  emergencyPhone: z.string().max(20).optional(),
  notes: z.string().max(2000).optional(),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres").optional(),
});
export type TutorOnboardingStep1Input = z.infer<typeof tutorOnboardingStep1Schema>;

export const petComplementSchema = z.object({
  petId: z.number().int().positive(),
  foodAllergies: z.array(z.string()).optional(),
  medicationAllergies: z.array(z.string()).optional(),
  feedingPreferences: z.string().max(1000).optional(),
  vetName: z.string().max(200).optional(),
  vetPhone: z.string().max(20).optional(),
  vetAddress: z.string().max(500).optional(),
  fearTriggers: z.array(z.string()).optional(),
  notes: z.string().max(2000).optional(),
});
export type PetComplementInput = z.infer<typeof petComplementSchema>;

export const tutorOnboardingStep2Schema = z.object({
  token: z.string().min(1),
  pets: z.array(petComplementSchema).min(1),
});
export type TutorOnboardingStep2Input = z.infer<typeof tutorOnboardingStep2Schema>;

// ==========================================
// SCHEMAS - CONCLUSÃO DO ONBOARDING
// ==========================================

export const completeOnboardingSchema = z.object({
  token: z.string().min(1),
  acceptedTerms: z.boolean().refine((v) => v === true, "Voce deve aceitar os termos"),
});
export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>;
