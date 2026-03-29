import { pgTable, serial, varchar, integer, boolean, text, timestamp, date, index } from "drizzle-orm/pg-core";
import { users, pets } from "./schema";

export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 20 }).notNull().default("avulso"),
  includedDays: integer("included_days").notNull().default(0),
  price: integer("price").notNull().default(0),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("plans_is_active_idx").on(table.isActive),
]);

export type Plan = typeof plans.$inferSelect;
export type InsertPlan = typeof plans.$inferInsert;

export const petPlans = pgTable("pet_plans", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull().references(() => pets.id, { onDelete: "cascade" }),
  planId: integer("plan_id").notNull().references(() => plans.id),
  customName: varchar("custom_name", { length: 100 }),
  customDays: integer("custom_days"),
  customPrice: integer("custom_price"),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  startDate: date("start_date"),
  renewalDay: integer("renewal_day"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("pet_plans_pet_id_idx").on(table.petId),
  index("pet_plans_status_idx").on(table.status),
]);

export type PetPlan = typeof petPlans.$inferSelect;
export type InsertPetPlan = typeof petPlans.$inferInsert;

export const paymentRequests = pgTable("payment_requests", {
  id: serial("id").primaryKey(),
  petPlanId: integer("pet_plan_id").references(() => petPlans.id),
  petId: integer("pet_id").notNull().references(() => pets.id, { onDelete: "cascade" }),
  tutorId: integer("tutor_id").notNull().references(() => users.id),
  amount: integer("amount").notNull().default(0),
  daysRequested: integer("days_requested").notNull().default(0),
  method: varchar("method", { length: 20 }).notNull(),
  proofUrl: text("proof_url"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  adminNotes: text("admin_notes"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("payment_requests_status_idx").on(table.status),
  index("payment_requests_pet_id_idx").on(table.petId),
  index("payment_requests_tutor_id_idx").on(table.tutorId),
]);

export type PaymentRequest = typeof paymentRequests.$inferSelect;
export type InsertPaymentRequest = typeof paymentRequests.$inferInsert;
