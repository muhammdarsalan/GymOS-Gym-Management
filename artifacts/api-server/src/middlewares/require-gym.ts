import { clerkClient, getAuth } from "@clerk/express";
import { db, gymsTable, usersTable, type Gym, type User } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { RequestHandler, Request } from "express";
import { makeId } from "../lib/make-id";

export type AuthenticatedRequest = Request & {
  dbUser: User;
  gym: Gym;
};

/**
 * Requires a signed-in Clerk user, then resolves the gym/workspace that
 * user belongs to and attaches it to the request as req.gym / req.dbUser.
 * Every route that touches gym data should sit behind this and scope its
 * queries with `eq(someTable.gymId, req.gym.id)` — that FK column only
 * means something once every route actually filters by it.
 *
 * If this is the first time we've seen this Clerk user, we bootstrap a new
 * gym for them (GymOS is one gym per owner account, so first sign-in ==
 * "create my gym"), rather than requiring a separate onboarding flow.
 *
 * Must run after clerkMiddleware() (see app.ts) — that's what populates
 * getAuth(req).
 */
export const requireGym: RequestHandler = async (req, res, next) => {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const existing = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId),
      with: { gym: true },
    });

    if (existing) {
      const authedReq = req as AuthenticatedRequest;
      authedReq.dbUser = existing;
      authedReq.gym = existing.gym;
      next();
      return;
    }

    const clerkUser = await clerkClient.users.getUser(userId);
    const email = clerkUser.primaryEmailAddress?.emailAddress ?? "";
    const displayName =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || email || "New";

    const [gym] = await db
      .insert(gymsTable)
      .values({ id: makeId("gym"), name: `${displayName}'s Gym` })
      .returning();

    if (!gym) {
      throw new Error("Failed to create gym for new user");
    }

    const [dbUser] = await db
      .insert(usersTable)
      .values({ id: userId, gymId: gym.id, email, name: displayName, role: "owner" })
      .returning();

    if (!dbUser) {
      throw new Error("Failed to create user record for new user");
    }

    const authedReq = req as AuthenticatedRequest;
    authedReq.dbUser = dbUser;
    authedReq.gym = gym;
    next();
  } catch (err) {
    next(err);
  }
};
