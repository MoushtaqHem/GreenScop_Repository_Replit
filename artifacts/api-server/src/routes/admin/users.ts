import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../../middleware/requireAdmin";

const router: IRouter = Router();

router.use(requireAdmin);

router.get("/", async (_req, res) => {
  const rows = await db.select().from(usersTable);
  res.json({
    users: rows.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      status: u.status,
      subscriptionTier: u.subscriptionTier,
      warningMessage: u.warningMessage,
      createdAt: u.createdAt,
    })),
  });
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { status, subscriptionTier, warningMessage, role } = req.body as {
    status?: string;
    subscriptionTier?: string;
    warningMessage?: string | null;
    role?: string;
  };

  const updates: Record<string, unknown> = {};
  if (status && ["active", "warned", "banned"].includes(status)) updates.status = status;
  if (subscriptionTier && ["free", "paid"].includes(subscriptionTier))
    updates.subscriptionTier = subscriptionTier;
  if (warningMessage !== undefined) updates.warningMessage = warningMessage;
  if (role && ["user", "admin"].includes(role)) updates.role = role;

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "No valid fields to update" });
    return;
  }

  await db.update(usersTable).set(updates).where(eq(usersTable.id, id));
  res.json({ ok: true });
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.json({ ok: true });
});

export default router;
