import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, plansTable } from "@workspace/db";
import { ListPlansResponse, CreatePlanBody, CreatePlanResponse, TogglePlanResponse } from "@workspace/api-zod";
import { requireGym, type AuthenticatedRequest } from "../middlewares/require-gym";
import { makeId } from "../lib/make-id";

const router: IRouter = Router();

router.get("/plans", requireGym, async (req, res, next) => {
  try {
    const { gym } = req as AuthenticatedRequest;
    const rows = await db.query.plansTable.findMany({ where: eq(plansTable.gymId, gym.id) });
    res.json(ListPlansResponse.parse(rows));
  } catch (err) {
    next(err);
  }
});

router.post("/plans", requireGym, async (req, res, next) => {
  try {
    const { gym } = req as AuthenticatedRequest;
    const body = CreatePlanBody.parse(req.body);
    const [created] = await db
      .insert(plansTable)
      .values({ id: makeId("plan"), gymId: gym.id, active: true, ...body })
      .returning();
    if (!created) throw new Error("Failed to create plan");
    res.status(201).json(CreatePlanResponse.parse(created));
  } catch (err) {
    next(err);
  }
});

// Matches togglePlan() exactly: flips active, no arbitrary field edits -
// the app never lets you rename a plan or change its price after creation.
router.patch("/plans/:id/toggle", requireGym, async (req, res, next) => {
  try {
    const { gym } = req as AuthenticatedRequest;
    const existing = await db.query.plansTable.findFirst({
      where: and(eq(plansTable.id, req.params.id as string), eq(plansTable.gymId, gym.id)),
    });
    if (!existing) {
      res.status(404).json({ error: "Plan not found" });
      return;
    }
    const [updated] = await db
      .update(plansTable)
      .set({ active: !existing.active })
      .where(eq(plansTable.id, existing.id))
      .returning();
    if (!updated) throw new Error("Failed to toggle plan");
    res.json(TogglePlanResponse.parse(updated));
  } catch (err) {
    next(err);
  }
});

export default router;
