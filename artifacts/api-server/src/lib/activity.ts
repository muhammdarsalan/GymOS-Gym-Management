import { db, auditLogsTable, notificationsTable } from "@workspace/db";
import { makeId } from "./make-id";

// Mirrors addAudit()/the inline audit-log inserts in
// artifacts/gymos/context/GymContext.tsx, moved server-side so every
// client that eventually calls this API gets the same activity trail
// instead of each client re-implementing it.
export async function recordAudit(
  gymId: string,
  entry: { action: string; detail?: string; memberId?: string | null },
) {
  await db.insert(auditLogsTable).values({
    id: makeId("audit"),
    gymId,
    action: entry.action,
    detail: entry.detail ?? "",
    memberId: entry.memberId ?? null,
  });
}

export async function notify(
  gymId: string,
  entry: {
    title: string;
    body?: string;
    type: "expiry" | "payment" | "member" | "system";
    memberId?: string | null;
  },
) {
  await db.insert(notificationsTable).values({
    id: makeId("notification"),
    gymId,
    title: entry.title,
    body: entry.body ?? "",
    type: entry.type,
    memberId: entry.memberId ?? null,
  });
}
