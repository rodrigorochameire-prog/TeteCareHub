import { z } from "zod";

// ==========================================
// SCHEMAS - CATEGORIAS DE DESPESAS
// ==========================================

export const createExpenseCategorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  icon: z.string().max(50).optional(),
});
export type CreateExpenseCategoryInput = z.infer<typeof createExpenseCategorySchema>;

export const updateExpenseCategorySchema = createExpenseCategorySchema.partial().extend({
  id: z.number().int().positive(),
});
export type UpdateExpenseCategoryInput = z.infer<typeof updateExpenseCategorySchema>;

// ==========================================
// SCHEMAS - DESPESAS
// ==========================================

export const createExpenseSchema = z.object({
  categoryId: z.number().int().positive("Categoria é obrigatória"),
  description: z.string().min(1, "Descrição é obrigatória").max(200, "Descrição muito longa"),
  amount: z.number().int().positive("Valor deve ser positivo"), // em centavos
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}/, "Data inválida (use YYYY-MM-DD)"),
  supplier: z.string().max(100).optional(),
  receiptUrl: z.string().url("URL inválida").max(2000).optional().nullable(),
  notes: z.string().max(2000).optional(),
});
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

export const updateExpenseSchema = createExpenseSchema.partial().extend({
  id: z.number().int().positive(),
});
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;

// ==========================================
// SCHEMAS - FILTROS
// ==========================================

export const expenseFiltersSchema = z.object({
  month: z.number().int().min(0).max(11),
  year: z.number().int().min(2020).max(2100),
  categoryId: z.number().int().positive().optional(),
});
export type ExpenseFiltersInput = z.infer<typeof expenseFiltersSchema>;
