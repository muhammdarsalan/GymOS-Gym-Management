import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { gymsTable } from "./gyms";
import { membersTable } from "./members";

// Mirrors AuditLog in artifacts/gymos/lib/gymos-data.ts.
export const auditLogsTable = pgTable("audit_logs", {
  id: text("id").primaryKey(),
  gymId: text("gym_id")
    .notNull()
    .references(() => gymsTable.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  detail: text("detail").notNull().default(""),
  date: timestamp("date", { withTimezone: true }).notNull().defaultNow(),
  memberId: text("member_id").references(() => membersTable.id, { onDelete: "set null" }),
});

export const insertAuditLogSchema = createInsertSchema(auditLogsTable);
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLogRow = typeof auditLogsTable.$inferSelect;
