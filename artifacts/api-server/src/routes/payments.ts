import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, paymentsTable, membersTable } from "@workspace/db";
import {
  ListPaymentsResponse,
  CreatePaymentBody,
  CreatePaymentResponse,
  VoidPaymentBody,
  VoidPaymentResponse,
} from "@workspace/api-zod";
import { requireGym, type AuthenticatedRequest } from "../middlewares/require-gym";
import { makeId } from "../lib/make-id";
import { recordAudit, notify } from "../lib/activity";

const router: IRouter = Router();

router.get("/payments", requireGym, async (req, res, next) => {
  try {
    const { gym } = req as AuthenticatedRequest;
    const rows = await db.query.paymentsTable.findMany({ where: eq(paymentsTable.gymId, gym.id) });
    res.json(ListPaymentsResponse.parse(rows));
  } catch (err) {
    next(err);
  }
});

// Matches addPayment() exactly: full payment only, server generates
// receiptNumber/transactionId and the record always starts completed -
// there is no partial-amount or pending status to set here.
router.post("/payments", requireGym, async (req, res, next) => {
  try {
    const { gym } = req as AuthenticatedRequest;
    const body = CreatePaymentBody.parse(req.body);

    const [created] = await db
      .insert(paymentsTable)
      .values({
        id: makeId("payment"),
        gymId: gym.id,
        receiptNumber: `RCP-${Math.floor(10000 + Math.random() * 89999)}`,
        transactionId: `TXN-${Math.floor(100000 + Math.random() * 899999)}`,
        status: "completed",
        ...body,
      })
      .returning();
    if (!created) throw new Error("Failed to create payment");

    const member = await db.query.membersTable.findFirst({
      where: eq(membersTable.id, body.memberId),
    });

    await recordAudit(gym.id, {
      action: "Payment recorded",
      detail: `${created.receiptNumber} \u00b7 ${member?.name ?? "Member"} \u00b7 Rs. ${created.amount.toLocaleString()}`,
      memberId: body.memberId,
    });
    await notify(gym.id, {
      title: "Payment recorded",
      body: `Rs. ${created.amount.toLocaleString()} received from ${member?.name ?? "member"}.`,
      type: "payment",
      memberId: body.memberId,
    });

    res.status(201).json(CreatePaymentResponse.parse(created));
  } catch (err) {
    next(err);
  }
});

// Void-only: matches voidPayment() exactly - status flips completed ->
// voided, the row itself is never edited or deleted, no refund path.
router.patch("/payments/:id/void", requireGym, async (req, res, next) => {
  try {
    const { gym } = req as AuthenticatedRequest;
    const { reason } = VoidPaymentBody.parse(req.body);

    const existing = await db.query.paymentsTable.findFirst({
      where: and(eq(paymentsTable.id, req.params.id as string), eq(paymentsTable.gymId, gym.id)),
    });
    if (!existing) {
      res.status(404).json({ error: "Payment not found" });
      return;
    }

    const [updated] = await db
      .update(paymentsTable)
      .set({ status: "voided" })
      .where(eq(paymentsTable.id, existing.id))
      .returning();
    if (!updated) throw new Error("Failed to void payment");

    await recordAudit(gym.id, {
      action: "Payment voided",
      detail: `${existing.receiptNumber} \u00b7 ${reason}`,
      memberId: existing.memberId,
    });

    res.json(VoidPaymentResponse.parse(updated));
  } catch (err) {
    next(err);
  }
});

export default router;
