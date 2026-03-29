import { pgTable, serial, varchar, integer, boolean, text, timestamp, date, index } from "drizzle-orm/pg-core";
import { users } from "./schema";

// ==========================================
// CATEGORIAS DE DESPESAS
// ==========================================

export const expenseCategories = pgTable("expense_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 50 }),
  isDefault: boolean("is_default").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ExpenseCategory = typeof expenseCategories.$inferSelect;
export type InsertExpenseCategory = typeof expenseCategories.$inferInsert;

// ==========================================
// DESPESAS
// ==========================================

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull().references(() => expenseCategories.id),
  description: varchar("description", { length: 200 }).notNull(),
  amount: integer("amount").notNull(), // em centavos
  date: date("date").notNull(),
  supplier: varchar("supplier", { length: 100 }),
  receiptUrl: text("receipt_url"),
  notes: text("notes"),
  createdById: integer("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("expenses_date_idx").on(table.date),
  index("expenses_category_idx").on(table.categoryId),
]);

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;
