import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { gardenTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

router.get("/", async (req, res) => {
  const { userId } = req.query as { userId: string };

  if (!userId) {
    res.status(400).json({ error: "userId required" });
    return;
  }

  const plants = await db
    .select()
    .from(gardenTable)
    .where(eq(gardenTable.userId, userId))
    .orderBy(gardenTable.savedAt);

  res.json(
    plants.map((p) => ({
      id: p.id,
      userId: p.userId,
      plantName: p.plantName,
      scientificName: p.scientificName,
      description: p.description,
      benefits: p.benefits,
      care: p.care,
      nutrition: p.nutrition,
      imageBase64: p.imageBase64,
      savedAt: p.savedAt.toISOString(),
    }))
  );
});

router.post("/", async (req, res) => {
  const body = req.body as {
    userId: string;
    plantName: string;
    scientificName: string;
    description: string;
    benefits: string;
    care: string;
    nutrition: unknown[];
    imageBase64?: string;
  };

  const id = generateId();

  await db.insert(gardenTable).values({
    id,
    userId: body.userId,
    plantName: body.plantName,
    scientificName: body.scientificName,
    description: body.description,
    benefits: body.benefits,
    care: body.care,
    nutrition: body.nutrition,
    imageBase64: body.imageBase64 ?? null,
  });

  const [saved] = await db.select().from(gardenTable).where(eq(gardenTable.id, id));

  res.status(201).json({
    id: saved.id,
    userId: saved.userId,
    plantName: saved.plantName,
    scientificName: saved.scientificName,
    description: saved.description,
    benefits: saved.benefits,
    care: saved.care,
    nutrition: saved.nutrition,
    imageBase64: saved.imageBase64,
    savedAt: saved.savedAt.toISOString(),
  });
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await db.delete(gardenTable).where(eq(gardenTable.id, id));
  res.json({ success: true });
});

export default router;
