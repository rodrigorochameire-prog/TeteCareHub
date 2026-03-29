import { pgTable, serial, varchar, integer, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { users, pets } from "./schema";

export const notificationRules = pgTable("notification_rules", {
  id: serial("id").primaryKey(),
  eventType: varchar("event_type", { length: 30 }).notNull(),
  daysBeforeDefault: integer("days_before_default").notNull(),
  daysBeforeCustom: integer("days_before_custom"),
  notifyApp: boolean("notify_app").notNull().default(true),
  notifyWhatsapp: boolean("notify_whatsapp").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("notification_rules_event_type_idx").on(table.eventType),
]);

export type NotificationRule = typeof notificationRules.$inferSelect;
export type InsertNotificationRule = typeof notificationRules.$inferInsert;

export const notificationLog = pgTable("notification_log", {
  id: serial("id").primaryKey(),
  ruleId: integer("rule_id").references(() => notificationRules.id),
  petId: integer("pet_id").references(() => pets.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id),
  channel: varchar("channel", { length: 20 }).notNull(),
  referenceType: varchar("reference_type", { length: 30 }).notNull(),
  referenceId: integer("reference_id").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  status: varchar("status", { length: 20 }).notNull().default("sent"),
}, (table) => [
  index("notification_log_reference_idx").on(table.referenceType, table.referenceId),
  index("notification_log_user_idx").on(table.userId),
]);

export type NotificationLogEntry = typeof notificationLog.$inferSelect;
export type InsertNotificationLogEntry = typeof notificationLog.$inferInsert;
