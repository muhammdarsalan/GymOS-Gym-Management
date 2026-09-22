import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { gymsTable } from "./gyms";
import { membersTable } from "./members";
import { plansTable } from "./plans";

// Mirrors the Membership type in artifacts/gymos/lib/gymos-data.ts.
// The app only ever reads/writes a single `member.membership` object and
// overwrites it in place on renewal (see app/payment/new.tsx's save()), so
// memberId is unique here too: one current membership per member, not a
// renewal history. Payment history (payments.membershipId) is what already
// records the trail of renewals — this table just holds where things stand
// right now, exactly like the app does today.
export const membershipsTable = pgTable(
  "memberships",
  {
    id: text("id").primaryKey(),
    gymId: text("gym_id")
      .notNull()
      .references(() => gymsTable.id, { onDelete: "cascade" }),
    memberId: text("member_id")
      .notNull()
      .references(() => membersTable.id, { onDelete: "cascade" }),
    planId: text("plan_id")
      .notNull()
      .references(() => plansTable.id, { onDelete: "restrict" }),
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  },
  (table) => [uniqueIndex("memberships_member_id_idx").on(table.memberId)],
);

export const insertMembershipSchema = createInsertSchema(membershipsTable);
export type InsertMembership = z.infer<typeof insertMembershipSchema>;
export type MembershipRow = typeof membershipsTable.$inferSelect;
