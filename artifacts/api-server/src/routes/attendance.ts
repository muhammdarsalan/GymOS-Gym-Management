import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, attendanceTable } from "@workspace/db";
import {
  ListAttendanceResponse,
  CreateAttendanceBody,
  CreateAttendanceResponse,
  CheckoutAttendanceResponse,
} from "@workspace/api-zod";
import { requireGym, type AuthenticatedRequest } from "../middlewares/require-gym";
import { makeId } from "../lib/make-id";
import { recordAudit } from "../lib/activity";

const router: IRouter = Router();

router.get("/attendance", requireGym, async (req, res, next) => {
  try {
    const { gym } = req as AuthenticatedRequest;
    const rows = await db.query.attendanceTable.findMany({ where: eq(attendanceTable.gymId, gym.id) });
    res.json(ListAttendanceResponse.parse(rows));
  } catch (err) {
    next(err);
  }
});

// Matches addAttendance() exactly: manual source, no checkOut yet.
router.post("/attendance", requireGym, async (req, res, next) => {
  try {
    const { gym } = req as AuthenticatedRequest;
    const { memberId } = CreateAttendanceBody.parse(req.body);

    const [created] = await db
      .insert(attendanceTable)
      .values({ id: makeId("attendance"), gymId: gym.id, memberId, source: "manual" })
      .returning();
    if (!created) throw new Error("Failed to record attendance");

    await recordAudit(gym.id, {
      action: "Attendance recorded",
      detail: "Manual check-in recorded",
      memberId,
    });

    res.status(201).json(CreateAttendanceResponse.parse(created));
  } catch (err) {
    next(err);
  }
});

// Matches checkoutAttendance() exactly: just stamps checkOut, no audit
// log entry - the app doesn't log check-outs today, only check-ins.
router.patch("/attendance/:id/checkout", requireGym, async (req, res, next) => {
  try {
    const { gym } = req as AuthenticatedRequest;

    const [updated] = await db
      .update(attendanceTable)
      .set({ checkOut: new Date() })
      .where(and(eq(attendanceTable.id, req.params.id as string), eq(attendanceTable.gymId, gym.id)))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Attendance record not found" });
      return;
    }

    res.json(CheckoutAttendanceResponse.parse(updated));
  } catch (err) {
    next(err);
  }
});

export default router;
