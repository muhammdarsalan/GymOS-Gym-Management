import { boolean, integer, pgTable, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { gymsTable } from "./gyms";

// Mirrors the Plan type in artifacts/gymos/lib/gymos-data.ts.
// price is stored as whole Rupees (integer) — the app never tracks paisas,
// see formatRs()'s maximumFractionDigits: 0.
export const plansTable = pgTable("plans", {
  id: text("id").primaryKey(),
  gymId: text("gym_id")
    .notNull()
    .references(() => gymsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  durationDays: integer("duration_days").notNull(),
  active: boolean("active").notNull().default(true),
});

export const insertPlanSchema = createInsertSchema(plansTable);
export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type PlanRow = typeof plansTable.$inferSelect;
