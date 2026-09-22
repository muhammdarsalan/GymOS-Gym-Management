import { pgTable, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { gymsTable } from "./gyms";

// Mirrors the Trainer type in artifacts/gymos/lib/gymos-data.ts.
export const trainersTable = pgTable("trainers", {
  id: text("id").primaryKey(),
  gymId: text("gym_id")
    .notNull()
    .references(() => gymsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  phone: text("phone").notNull().default(""),
  specialization: text("specialization").notNull().default(""),
  notes: text("notes").notNull().default(""),
});

export const insertTrainerSchema = createInsertSchema(trainersTable);
export type InsertTrainer = z.infer<typeof insertTrainerSchema>;
export type TrainerRow = typeof trainersTable.$inferSelect;
