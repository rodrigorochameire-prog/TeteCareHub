import { pgTable, serial, varchar, integer, boolean, text, timestamp, date, index } from "drizzle-orm/pg-core";
import { users, pets } from "./schema";

// ==========================================
// ATIVIDADES DA CRECHE
// ==========================================

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 50 }),
  isActive: boolean("is_active").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;

// ==========================================
// REGISTROS DE ATIVIDADES POR PET
// ==========================================

export const petActivityLogs = pgTable("pet_activity_logs", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull().references(() => pets.id, { onDelete: "cascade" }),
  activityId: integer("activity_id").references(() => activities.id),
  customName: varchar("custom_name", { length: 100 }),
  logDate: date("log_date").notNull(),
  notes: text("notes"),
  createdById: integer("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("pet_activity_logs_pet_id_idx").on(table.petId),
  index("pet_activity_logs_date_idx").on(table.logDate),
]);

export type PetActivityLog = typeof petActivityLogs.$inferSelect;
export type InsertPetActivityLog = typeof petActivityLogs.$inferInsert;

// ==========================================
// CONFIGURAÇÕES DA CRECHE
// ==========================================

export const daycareSettings = pgTable("daycare_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 50 }).notNull().unique(),
  value: varchar("value", { length: 200 }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type DaycareSetting = typeof daycareSettings.$inferSelect;
export type InsertDaycareSetting = typeof daycareSettings.$inferInsert;
