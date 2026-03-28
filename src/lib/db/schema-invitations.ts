import { pgTable, serial, varchar, boolean, timestamp, integer, jsonb, index } from "drizzle-orm/pg-core";
import { users } from "./schema";

export const invitations = pgTable("invitations", {
  id: serial("id").primaryKey(),
  token: varchar("token", { length: 64 }).notNull().unique(),
  tutorId: integer("tutor_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  petIds: jsonb("pet_ids").$type<number[]>().notNull().default([]),
  dashboardAccess: boolean("dashboard_access").notNull().default(true),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  createdBy: integer("created_by")
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp("expires_at").notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("invitations_token_idx").on(table.token),
  index("invitations_tutor_id_idx").on(table.tutorId),
  index("invitations_status_idx").on(table.status),
]);

export type Invitation = typeof invitations.$inferSelect;
export type InsertInvitation = typeof invitations.$inferInsert;
