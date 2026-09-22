import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { gymsTable } from "./gyms";

// Matches the "owner/receptionist authority model" from the product spec.
// Both roles currently have the same permissions in the app (full edit
// rights, only they can delete) — the column exists so that distinction
// can be enforced later without a schema change.
export const userRoleEnum = pgEnum("user_role", ["owner", "receptionist"]);

// id is the Clerk user id (e.g. "user_xxx"), used directly as the primary
// key so no separate mapping table is needed once Clerk auth is wired in.
// This table is schema-only for now — nothing writes to it until the auth
// phase adds Clerk middleware to the API.
export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  gymId: text("gym_id")
    .notNull()
    .references(() => gymsTable.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  name: text("name").notNull().default(""),
  role: userRoleEnum("role").notNull().default("owner"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
