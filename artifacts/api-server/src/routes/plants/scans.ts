import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { scansTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  const { userId } = req.query as { userId: string };

  if (!userId) {
    res.status(400).json({ error: "userId required" });
    return;
  }

  const records = await db
    .select()
    .from(scansTable)
    .where(eq(scansTable.userId, userId))
    .orderBy(scansTable.createdAt)
    .limit(20);

  res.json(
    records.map((r) => ({
      id: r.id,
      userId: r.userId,
      plantName: r.plantName,
      scientificName: r.scientificName,
      imageBase64: r.imageBase64,
      createdAt: r.createdAt.toISOString(),
    }))
  );
});

export default router;
