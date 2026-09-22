import { Router, type IRouter } from "express";
import { requireGym, type AuthenticatedRequest } from "../middlewares/require-gym";

const router: IRouter = Router();

// Simple authenticated identity check: who am I, and which gym do I belong
// to. Every future data route follows the same requireGym pattern and
// reads req.gym.id to scope its queries.
router.get("/me", requireGym, (req, res) => {
  const { dbUser, gym } = req as AuthenticatedRequest;
  res.json({
    userId: dbUser.id,
    email: dbUser.email,
    role: dbUser.role,
    gym: { id: gym.id, name: gym.name },
  });
});

export default router;
