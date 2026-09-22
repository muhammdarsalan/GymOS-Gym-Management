import { boolean, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { gymsTable } from "./gyms";
import { membersTable } from "./members";

// Mirrors Notification in artifacts/gymos/lib/gymos-data.ts.
export const notificationTypeEnum = pgEnum("notification_type", [
  "expiry",
  "payment",
  "member",
  "system",
]);

export const notificationsTable = pgTable("notifications", {
  id: text("id").primaryKey(),
  gymId: text("gym_id")
    .notNull()
    .references(() => gymsTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  type: notificationTypeEnum("type").notNull(),
  date: timestamp("date", { withTimezone: true }).notNull().defaultNow(),
  read: boolean("read").notNull().default(false),
  memberId: text("member_id").references(() => membersTable.id, { onDelete: "set null" }),
});

export const insertNotificationSchema = createInsertSchema(notificationsTable);
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type NotificationRow = typeof notificationsTable.$inferSelect;
