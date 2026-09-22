import { boolean, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { gymsTable } from "./gyms";
import { trainersTable } from "./trainers";

// Mirrors the Member type in artifacts/gymos/lib/gymos-data.ts.
// The `membership` field on that type is not stored here — it lives in its
// own memberships table (see memberships.ts) and is joined in at read time,
// same one-membership-per-member shape the app already assumes.
export const membersTable = pgTable(
  "members",
  {
    id: text("id").primaryKey(),
    gymId: text("gym_id")
      .notNull()
      .references(() => gymsTable.id, { onDelete: "cascade" }),
    memberCode: text("member_code").notNull(),
    name: text("name").notNull(),
    phone: text("phone").notNull().default(""),
    gender: text("gender").notNull().default(""),
    dob: timestamp("dob", { withTimezone: true }),
    address: text("address").notNull().default(""),
    emergencyContact: text("emergency_contact").notNull().default(""),
    joinDate: timestamp("join_date", { withTimezone: true }).notNull().defaultNow(),
    trainerId: text("trainer_id").references(() => trainersTable.id, { onDelete: "set null" }),
    notes: text("notes").notNull().default(""),
    archived: boolean("archived").notNull().default(false),
  },
  (table) => [
    // memberCode ("GYM-1042") must be unique within a gym, but the same
    // code could recur across two different gyms, so the uniqueness is
    // scoped to (gymId, memberCode) rather than memberCode alone.
    uniqueIndex("members_gym_id_member_code_idx").on(table.gymId, table.memberCode),
  ],
);

export const insertMemberSchema = createInsertSchema(membersTable);
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type MemberRow = typeof membersTable.$inferSelect;
