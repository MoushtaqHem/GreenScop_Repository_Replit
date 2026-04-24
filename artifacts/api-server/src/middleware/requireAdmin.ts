import type { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const userId =
    (req.header("x-user-id") as string | undefined) ||
    (req.body && (req.body as { userId?: string }).userId);

  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const rows = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (rows.length === 0 || rows[0].role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }

  next();
}
