import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { gymsTable } from "./gyms";
import { membersTable } from "./members";

// Mirrors AttendanceRecord in artifacts/gymos/lib/gymos-data.ts. "biometric"
// is included now even though the hardware isn't wired up yet, so the
// column doesn't need to change when that placeholder is filled in later.
export const attendanceSourceEnum = pgEnum("attendance_source", ["manual", "biometric"]);

export const attendanceTable = pgTable("attendance", {
  id: text("id").primaryKey(),
  gymId: text("gym_id")
    .notNull()
    .references(() => gymsTable.id, { onDelete: "cascade" }),
  memberId: text("member_id")
    .notNull()
    .references(() => membersTable.id, { onDelete: "cascade" }),
  checkIn: timestamp("check_in", { withTimezone: true }).notNull().defaultNow(),
  checkOut: timestamp("check_out", { withTimezone: true }),
  source: attendanceSourceEnum("source").notNull().default("manual"),
});

export const insertAttendanceSchema = createInsertSchema(attendanceTable);
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type AttendanceRow = typeof attendanceTable.$inferSelect;
