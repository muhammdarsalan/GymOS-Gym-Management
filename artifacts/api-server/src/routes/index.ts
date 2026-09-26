import { Router, type IRouter } from "express";
import healthRouter from "./health";
import meRouter from "./me";
import plansRouter from "./plans";
import trainersRouter from "./trainers";
import membersRouter from "./members";

const router: IRouter = Router();

router.use(healthRouter);
router.use(meRouter);
router.use(plansRouter);
router.use(trainersRouter);
router.use(membersRouter);

export default router;
