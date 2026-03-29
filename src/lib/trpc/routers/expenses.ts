import { z } from "zod";
import { router, adminProcedure } from "../init";
import { db, expenses, expenseCategories, pets, petPlans, petTutors, users, plans } from "@/lib/db";
import { paymentRequests } from "@/lib/db";
import { transactions } from "./finances";
import { eq, and, desc, asc, sql, gte, lte } from "drizzle-orm";
import { Errors, safeAsync } from "@/lib/errors";
import {
  createExpenseSchema,
  updateExpenseSchema,
  createExpenseCategorySchema,
  updateExpenseCategorySchema,
  expenseFiltersSchema,
} from "@/lib/validations/expenses";

export const expensesRouter = router({
  // ==========================================
  // CATEGORIAS
  // ==========================================

  /**
   * Lista categorias ativas, ordenadas por nome (admin)
   */
  listCategories: adminProcedure.query(async () => {
    return safeAsync(async () => {
      return db
        .select()
        .from(expenseCategories)
        .where(eq(expenseCategories.isActive, true))
        .orderBy(asc(expenseCategories.name));
    }, "Erro ao listar categorias de despesas");
  }),

  /**
   * Lista todas as categorias, incluindo inativas (admin)
   */
  listAllCategories: adminProcedure.query(async () => {
    return safeAsync(async () => {
      return db
        .select()
        .from(expenseCategories)
        .orderBy(asc(expenseCategories.name));
    }, "Erro ao listar todas as categorias de despesas");
  }),

  /**
   * Cria uma nova categoria (admin)
   */
  createCategory: adminProcedure
    .input(createExpenseCategorySchema)
    .mutation(async ({ input }) => {
      return safeAsync(async () => {
        const [newCategory] = await db
          .insert(expenseCategories)
          .values({
            name: input.name,
            icon: input.icon || null,
            isDefault: false,
            isActive: true,
          })
          .returning();

        return newCategory;
      }, "Erro ao criar categoria de despesa");
    }),

  /**
   * Atualiza uma categoria existente (admin)
   */
  updateCategory: adminProcedure
    .input(updateExpenseCategorySchema)
    .mutation(async ({ input }) => {
      return safeAsync(async () => {
        const { id, ...data } = input;

        const [existing] = await db
          .select()
          .from(expenseCategories)
          .where(eq(expenseCategories.id, id))
          .limit(1);

        if (!existing) {
          throw Errors.notFound("Categoria de despesa");
        }

        const updateData: Record<string, unknown> = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.icon !== undefined) updateData.icon = data.icon;

        const [updated] = await db
          .update(expenseCategories)
          .set(updateData)
          .where(eq(expenseCategories.id, id))
          .returning();

        return updated;
      }, "Erro ao atualizar categoria de despesa");
    }),

  /**
   * Ativa/desativa uma categoria (admin)
   * Impede desativar categorias padrão (isDefault)
   */
  toggleCategory: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      return safeAsync(async () => {
        const [existing] = await db
          .select()
          .from(expenseCategories)
          .where(eq(expenseCategories.id, input.id))
          .limit(1);

        if (!existing) {
          throw Errors.notFound("Categoria de despesa");
        }

        if (existing.isDefault && existing.isActive) {
          throw Errors.badRequest("Não é possível desativar uma categoria padrão");
        }

        const [updated] = await db
          .update(expenseCategories)
          .set({ isActive: !existing.isActive })
          .where(eq(expenseCategories.id, input.id))
          .returning();

        return updated;
      }, "Erro ao alternar status da categoria de despesa");
    }),

  // ==========================================
  // DESPESAS
  // ==========================================

  /**
   * Lista despesas com join de categoria, filtradas por mês/ano/categoria (admin)
   */
  list: adminProcedure
    .input(expenseFiltersSchema)
    .query(async ({ input }) => {
      return safeAsync(async () => {
        const startDate = new Date(input.year, input.month, 1);
        const endDate = new Date(input.year, input.month + 1, 0);
        const startStr = startDate.toISOString().split("T")[0];
        const endStr = endDate.toISOString().split("T")[0];

        const conditions: ReturnType<typeof eq>[] = [
          gte(expenses.date, startStr),
          lte(expenses.date, endStr),
        ];

        if (input.categoryId) {
          conditions.push(eq(expenses.categoryId, input.categoryId));
        }

        return db
          .select({
            expense: expenses,
            category: {
              id: expenseCategories.id,
              name: expenseCategories.name,
              icon: expenseCategories.icon,
            },
          })
          .from(expenses)
          .innerJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
          .where(and(...conditions))
          .orderBy(desc(expenses.date), desc(expenses.createdAt));
      }, "Erro ao listar despesas");
    }),

  /**
   * Cria uma nova despesa (admin)
   */
  create: adminProcedure
    .input(createExpenseSchema)
    .mutation(async ({ ctx, input }) => {
      return safeAsync(async () => {
        const [newExpense] = await db
          .insert(expenses)
          .values({
            categoryId: input.categoryId,
            description: input.description,
            amount: input.amount,
            date: input.date,
            supplier: input.supplier || null,
            receiptUrl: input.receiptUrl || null,
            notes: input.notes || null,
            createdById: ctx.user!.id,
          })
          .returning();

        return newExpense;
      }, "Erro ao criar despesa");
    }),

  /**
   * Atualiza uma despesa existente (admin)
   */
  update: adminProcedure
    .input(updateExpenseSchema)
    .mutation(async ({ input }) => {
      return safeAsync(async () => {
        const { id, ...data } = input;

        const [existing] = await db
          .select()
          .from(expenses)
          .where(eq(expenses.id, id))
          .limit(1);

        if (!existing) {
          throw Errors.notFound("Despesa");
        }

        const updateData: Record<string, unknown> = {};
        if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.amount !== undefined) updateData.amount = data.amount;
        if (data.date !== undefined) updateData.date = data.date;
        if (data.supplier !== undefined) updateData.supplier = data.supplier;
        if (data.receiptUrl !== undefined) updateData.receiptUrl = data.receiptUrl;
        if (data.notes !== undefined) updateData.notes = data.notes;

        const [updated] = await db
          .update(expenses)
          .set(updateData)
          .where(eq(expenses.id, id))
          .returning();

        return updated;
      }, "Erro ao atualizar despesa");
    }),

  /**
   * Exclui uma despesa (admin)
   */
  delete: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      return safeAsync(async () => {
        const [existing] = await db
          .select()
          .from(expenses)
          .where(eq(expenses.id, input.id))
          .limit(1);

        if (!existing) {
          throw Errors.notFound("Despesa");
        }

        await db.delete(expenses).where(eq(expenses.id, input.id));

        return { success: true };
      }, "Erro ao excluir despesa");
    }),

  // ==========================================
  // RELATÓRIOS
  // ==========================================

  /**
   * Resumo mensal de despesas (admin)
   * Retorna total, por categoria e comparação com mês anterior
   */
  monthlySummary: adminProcedure
    .input(z.object({
      month: z.number().int().min(0).max(11),
      year: z.number().int().min(2020).max(2100),
    }))
    .query(async ({ input }) => {
      return safeAsync(async () => {
        // Período do mês atual
        const currentStart = new Date(input.year, input.month, 1);
        const currentEnd = new Date(input.year, input.month + 1, 0);
        const currentStartStr = currentStart.toISOString().split("T")[0];
        const currentEndStr = currentEnd.toISOString().split("T")[0];

        // Período do mês anterior
        const prevMonth = input.month === 0 ? 11 : input.month - 1;
        const prevYear = input.month === 0 ? input.year - 1 : input.year;
        const prevStart = new Date(prevYear, prevMonth, 1);
        const prevEnd = new Date(prevYear, prevMonth + 1, 0);
        const prevStartStr = prevStart.toISOString().split("T")[0];
        const prevEndStr = prevEnd.toISOString().split("T")[0];

        // Total do mês atual
        const [currentTotal] = await db
          .select({
            total: sql<number>`COALESCE(sum(${expenses.amount}), 0)::int`,
          })
          .from(expenses)
          .where(and(
            gte(expenses.date, currentStartStr),
            lte(expenses.date, currentEndStr),
          ));

        // Total do mês anterior
        const [previousTotal] = await db
          .select({
            total: sql<number>`COALESCE(sum(${expenses.amount}), 0)::int`,
          })
          .from(expenses)
          .where(and(
            gte(expenses.date, prevStartStr),
            lte(expenses.date, prevEndStr),
          ));

        // Por categoria no mês atual
        const byCategory = await db
          .select({
            name: expenseCategories.name,
            icon: expenseCategories.icon,
            total: sql<number>`COALESCE(sum(${expenses.amount}), 0)::int`,
          })
          .from(expenses)
          .innerJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
          .where(and(
            gte(expenses.date, currentStartStr),
            lte(expenses.date, currentEndStr),
          ))
          .groupBy(expenseCategories.name, expenseCategories.icon)
          .orderBy(sql`sum(${expenses.amount}) desc`);

        return {
          total: currentTotal?.total || 0,
          byCategory,
          previousMonthTotal: previousTotal?.total || 0,
        };
      }, "Erro ao gerar resumo mensal de despesas");
    }),

  /**
   * Gráfico mensal receita x despesas (admin)
   * Retorna dados dos últimos N meses
   */
  monthlyChart: adminProcedure
    .input(z.object({
      months: z.number().int().min(1).max(24).default(6),
    }).optional())
    .query(async ({ input }) => {
      return safeAsync(async () => {
        const numMonths = input?.months ?? 6;
        const now = new Date();
        const result: Array<{
          month: number;
          year: number;
          revenue: number;
          expenses: number;
          profit: number;
        }> = [];

        for (let i = numMonths - 1; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const month = d.getMonth();
          const year = d.getFullYear();
          const startDate = new Date(year, month, 1);
          const endDate = new Date(year, month + 1, 0, 23, 59, 59);
          const startStr = startDate.toISOString().split("T")[0];
          const endStr = endDate.toISOString().split("T")[0];

          // Receita: transações tipo credit_purchase no mês
          const [rev] = await db
            .select({
              total: sql<number>`COALESCE(sum(${transactions.amount}), 0)::int`,
            })
            .from(transactions)
            .where(and(
              eq(transactions.type, "credit_purchase"),
              gte(transactions.createdAt, startDate),
              lte(transactions.createdAt, endDate),
            ));

          // Despesas do mês
          const [exp] = await db
            .select({
              total: sql<number>`COALESCE(sum(${expenses.amount}), 0)::int`,
            })
            .from(expenses)
            .where(and(
              gte(expenses.date, startStr),
              lte(expenses.date, endStr),
            ));

          const revenue = rev?.total || 0;
          const expTotal = exp?.total || 0;

          result.push({
            month,
            year,
            revenue,
            expenses: expTotal,
            profit: revenue - expTotal,
          });
        }

        return result;
      }, "Erro ao gerar gráfico mensal");
    }),

  /**
   * Relatório de inadimplência (admin)
   * Retorna pets com informações de créditos e categorização por cor
   */
  getDelinquencyReport: adminProcedure.query(async () => {
    return safeAsync(async () => {
      // Buscar pets com plano ativo, tutor e dados de créditos
      const petsData = await db
        .select({
          petId: pets.id,
          petName: pets.name,
          petPhotoUrl: pets.photoUrl,
          credits: pets.credits,
          planName: plans.name,
          tutorName: users.name,
          tutorPhone: users.phone,
        })
        .from(pets)
        .innerJoin(petPlans, and(
          eq(petPlans.petId, pets.id),
          eq(petPlans.status, "active"),
        ))
        .innerJoin(plans, eq(petPlans.planId, plans.id))
        .innerJoin(petTutors, eq(petTutors.petId, pets.id))
        .innerJoin(users, eq(petTutors.tutorId, users.id))
        .where(eq(pets.approvalStatus, "approved"))
        .orderBy(asc(pets.credits), asc(pets.name));

      // Para cada pet, buscar último pagamento aprovado
      const result = await Promise.all(
        petsData.map(async (pet) => {
          const [lastPayment] = await db
            .select({
              createdAt: paymentRequests.createdAt,
            })
            .from(paymentRequests)
            .where(and(
              eq(paymentRequests.petId, pet.petId),
              eq(paymentRequests.status, "approved"),
            ))
            .orderBy(desc(paymentRequests.createdAt))
            .limit(1);

          const credits = pet.credits ?? 0;
          let status: "green" | "yellow" | "red";
          if (credits > 3) {
            status = "green";
          } else if (credits >= 1) {
            status = "yellow";
          } else {
            status = "red";
          }

          return {
            id: pet.petId,
            name: pet.petName,
            photoUrl: pet.petPhotoUrl,
            credits,
            planName: pet.planName,
            tutorName: pet.tutorName,
            tutorPhone: pet.tutorPhone,
            lastPaymentDate: lastPayment?.createdAt || null,
            status,
          };
        })
      );

      return result;
    }, "Erro ao gerar relatório de inadimplência");
  }),
});
