import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// A "gym" is the workspace/tenant. Every other table is scoped to one gym
// via gymId so that one gym can never read or write another gym's data.
// The fields below are the same fields the mobile app currently keeps in
// GymSettings (artifacts/gymos/lib/gymos-data.ts) — the gym row doubles as
// that settings record so we don't need a separate settings table.
export const gymsTable = pgTable("gyms", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().default(""),
  address: text("address").notNull().default(""),
  expiryReminders: boolean("expiry_reminders").notNull().default(true),
  allowExpiredCheckIn: boolean("allow_expired_check_in").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGymSchema = createInsertSchema(gymsTable).omit({ createdAt: true });
export type InsertGym = z.infer<typeof insertGymSchema>;
export type Gym = typeof gymsTable.$inferSelect;
