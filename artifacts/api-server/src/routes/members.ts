import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, membersTable, membershipsTable } from "@workspace/db";
import {
  ListMembersResponse,
  CreateMemberBody,
  CreateMemberResponse,
  GetMemberResponse,
  UpdateMemberBody,
  UpdateMemberResponse,
  ArchiveMemberBody,
  ArchiveMemberResponse,
} from "@workspace/api-zod";
import { requireGym, type AuthenticatedRequest } from "../middlewares/require-gym";
import { makeId } from "../lib/make-id";
import { recordAudit, notify } from "../lib/activity";

const router: IRouter = Router();

router.get("/members", requireGym, async (req, res, next) => {
  try {
    const { gym } = req as AuthenticatedRequest;
    const rows = await db.query.membersTable.findMany({
      where: eq(membersTable.gymId, gym.id),
      with: { membership: true },
    });
    res.json(ListMembersResponse.parse(rows));
  } catch (err) {
    next(err);
  }
});

router.post("/members", requireGym, async (req, res, next) => {
  try {
    const { gym } = req as AuthenticatedRequest;
    const body = CreateMemberBody.parse(req.body);
    // Matches addMember() exactly: server generates id + memberCode, the
    // member starts with no membership until one is assigned later.
    const [created] = await db
      .insert(membersTable)
      .values({ id: makeId("member"), gymId: gym.id, memberCode: `GYM-${Math.floor(1000 + Math.random() * 8999)}`, ...body })
      .returning();
    if (!created) throw new Error("Failed to create member");

    await recordAudit(gym.id, {
      action: "Member added",
      detail: `${created.name} joined the gym`,
      memberId: created.id,
    });
    await notify(gym.id, {
      title: "New member added",
      body: `${created.name} joined the gym.`,
      type: "member",
      memberId: created.id,
    });

    res.status(201).json(CreateMemberResponse.parse({ ...created, membership: null }));
  } catch (err) {
    next(err);
  }
});

router.get("/members/:id", requireGym, async (req, res, next) => {
  try {
    const { gym } = req as AuthenticatedRequest;
    // Scoping by gymId here (not just the row id) is what makes gym
    // isolation real: a member id from another gym returns 404, same as a
    // nonexistent one, rather than leaking that it exists elsewhere.
    const row = await db.query.membersTable.findFirst({
      where: and(eq(membersTable.id, req.params.id as string), eq(membersTable.gymId, gym.id)),
      with: { membership: true },
    });
    if (!row) {
      res.status(404).json({ error: "Member not found" });
      return;
    }
    res.json(GetMemberResponse.parse(row));
  } catch (err) {
    next(err);
  }
});

router.patch("/members/:id", requireGym, async (req, res, next) => {
  try {
    const { gym } = req as AuthenticatedRequest;
    const patch = UpdateMemberBody.parse(req.body);

    const [updated] = await db
      .update(membersTable)
      .set(patch)
      .where(and(eq(membersTable.id, req.params.id as string), eq(membersTable.gymId, gym.id)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Member not found" });
      return;
    }

    await recordAudit(gym.id, {
      action: "Member edited",
      detail: "Member profile details were updated",
      memberId: updated.id,
    });

    const membership = await db.query.membershipsTable.findFirst({
      where: eq(membershipsTable.memberId, updated.id),
    });

    res.json(UpdateMemberResponse.parse({ ...updated, membership: membership ?? null }));
  } catch (err) {
    next(err);
  }
});

router.patch("/members/:id/archive", requireGym, async (req, res, next) => {
  try {
    const { gym } = req as AuthenticatedRequest;
    const { archived } = ArchiveMemberBody.parse(req.body);

    const [updated] = await db
      .update(membersTable)
      .set({ archived })
      .where(and(eq(membersTable.id, req.params.id as string), eq(membersTable.gymId, gym.id)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Member not found" });
      return;
    }

    await recordAudit(gym.id, {
      action: archived ? "Member archived" : "Member restored",
      detail: archived ? "Member moved to archive" : "Member restored",
      memberId: updated.id,
    });

    const membership = await db.query.membershipsTable.findFirst({
      where: eq(membershipsTable.memberId, updated.id),
    });

    res.json(ArchiveMemberResponse.parse({ ...updated, membership: membership ?? null }));
  } catch (err) {
    next(err);
  }
});

export default router;
