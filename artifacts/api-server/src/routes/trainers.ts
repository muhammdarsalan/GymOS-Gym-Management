import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, trainersTable } from "@workspace/db";
import { ListTrainersResponse, CreateTrainerBody, CreateTrainerResponse } from "@workspace/api-zod";
import { requireGym, type AuthenticatedRequest } from "../middlewares/require-gym";
import { makeId } from "../lib/make-id";

const router: IRouter = Router();

router.get("/trainers", requireGym, async (req, res, next) => {
  try {
    const { gym } = req as AuthenticatedRequest;
    const rows = await db.query.trainersTable.findMany({ where: eq(trainersTable.gymId, gym.id) });
    res.json(ListTrainersResponse.parse(rows));
  } catch (err) {
    next(err);
  }
});

// No update/delete route: GymContext only exposes addTrainer today, so
// this matches what the app can actually do rather than adding an edit
// capability the UI has no button for.
router.post("/trainers", requireGym, async (req, res, next) => {
  try {
    const { gym } = req as AuthenticatedRequest;
    const body = CreateTrainerBody.parse(req.body);
    const [created] = await db
      .insert(trainersTable)
      .values({ id: makeId("trainer"), gymId: gym.id, ...body })
      .returning();
    if (!created) throw new Error("Failed to create trainer");
    res.status(201).json(CreateTrainerResponse.parse(created));
  } catch (err) {
    next(err);
  }
});

export default router;
