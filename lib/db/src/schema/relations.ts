import { relations } from "drizzle-orm";
import { attendanceTable } from "./attendance";
import { auditLogsTable } from "./audit-logs";
import { gymsTable } from "./gyms";
import { membersTable } from "./members";
import { membershipsTable } from "./memberships";
import { notificationsTable } from "./notifications";
import { paymentsTable } from "./payments";
import { plansTable } from "./plans";
import { trainersTable } from "./trainers";
import { usersTable } from "./users";

export const gymsRelations = relations(gymsTable, ({ many }) => ({
  users: many(usersTable),
  members: many(membersTable),
  plans: many(plansTable),
  trainers: many(trainersTable),
  payments: many(paymentsTable),
  attendance: many(attendanceTable),
  auditLogs: many(auditLogsTable),
  notifications: many(notificationsTable),
}));

export const usersRelations = relations(usersTable, ({ one }) => ({
  gym: one(gymsTable, { fields: [usersTable.gymId], references: [gymsTable.id] }),
}));

export const membersRelations = relations(membersTable, ({ one, many }) => ({
  gym: one(gymsTable, { fields: [membersTable.gymId], references: [gymsTable.id] }),
  trainer: one(trainersTable, { fields: [membersTable.trainerId], references: [trainersTable.id] }),
  membership: one(membershipsTable, {
    fields: [membersTable.id],
    references: [membershipsTable.memberId],
  }),
  payments: many(paymentsTable),
  attendance: many(attendanceTable),
}));

export const trainersRelations = relations(trainersTable, ({ one, many }) => ({
  gym: one(gymsTable, { fields: [trainersTable.gymId], references: [gymsTable.id] }),
  members: many(membersTable),
}));

export const plansRelations = relations(plansTable, ({ one, many }) => ({
  gym: one(gymsTable, { fields: [plansTable.gymId], references: [gymsTable.id] }),
  memberships: many(membershipsTable),
}));

export const membershipsRelations = relations(membershipsTable, ({ one }) => ({
  gym: one(gymsTable, { fields: [membershipsTable.gymId], references: [gymsTable.id] }),
  member: one(membersTable, { fields: [membershipsTable.memberId], references: [membersTable.id] }),
  plan: one(plansTable, { fields: [membershipsTable.planId], references: [plansTable.id] }),
}));

export const paymentsRelations = relations(paymentsTable, ({ one }) => ({
  gym: one(gymsTable, { fields: [paymentsTable.gymId], references: [gymsTable.id] }),
  member: one(membersTable, { fields: [paymentsTable.memberId], references: [membersTable.id] }),
  membership: one(membershipsTable, {
    fields: [paymentsTable.membershipId],
    references: [membershipsTable.id],
  }),
}));

export const attendanceRelations = relations(attendanceTable, ({ one }) => ({
  gym: one(gymsTable, { fields: [attendanceTable.gymId], references: [gymsTable.id] }),
  member: one(membersTable, { fields: [attendanceTable.memberId], references: [membersTable.id] }),
}));

export const auditLogsRelations = relations(auditLogsTable, ({ one }) => ({
  gym: one(gymsTable, { fields: [auditLogsTable.gymId], references: [gymsTable.id] }),
  member: one(membersTable, { fields: [auditLogsTable.memberId], references: [membersTable.id] }),
}));

export const notificationsRelations = relations(notificationsTable, ({ one }) => ({
  gym: one(gymsTable, { fields: [notificationsTable.gymId], references: [gymsTable.id] }),
  member: one(membersTable, { fields: [notificationsTable.memberId], references: [membersTable.id] }),
}));
