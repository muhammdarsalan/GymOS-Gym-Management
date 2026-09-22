import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { gymsTable } from "./gyms";
import { membersTable } from "./members";
import { membershipsTable } from "./memberships";

// Mirrors PaymentMethod and Payment in artifacts/gymos/lib/gymos-data.ts.
export const paymentMethodEnum = pgEnum("payment_method", [
  "Cash",
  "Easypaisa",
  "JazzCash",
  "Bank Transfer",
  "Card",
]);

// No partial payments / no refunds: status only ever moves
// completed -> voided (see GymContext.voidPayment), never back, and there
// is no "amount paid so far" concept — full amount only, per the spec.
export const paymentStatusEnum = pgEnum("payment_status", ["completed", "voided"]);

export const paymentsTable = pgTable("payments", {
  id: text("id").primaryKey(),
  gymId: text("gym_id")
    .notNull()
    .references(() => gymsTable.id, { onDelete: "cascade" }),
  receiptNumber: text("receipt_number").notNull(),
  transactionId: text("transaction_id").notNull(),
  memberId: text("member_id")
    .notNull()
    .references(() => membersTable.id, { onDelete: "cascade" }),
  membershipId: text("membership_id").references(() => membershipsTable.id, {
    onDelete: "set null",
  }),
  amount: integer("amount").notNull(),
  method: paymentMethodEnum("method").notNull(),
  date: timestamp("date", { withTimezone: true }).notNull().defaultNow(),
  notes: text("notes").notNull().default(""),
  status: paymentStatusEnum("status").notNull().default("completed"),
});

export const insertPaymentSchema = createInsertSchema(paymentsTable);
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type PaymentRow = typeof paymentsTable.$inferSelect;
