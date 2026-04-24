import { Router, type IRouter } from "express";
import { db, appSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../../middleware/requireAdmin";

const router: IRouter = Router();

router.use(requireAdmin);

router.get("/", async (_req, res) => {
  const rows = await db.select().from(appSettingsTable);
  const masked = rows.map((r) => ({
    key: r.key,
    value: r.value,
    masked: r.value ? r.value.slice(0, 4) + "•".repeat(Math.max(0, r.value.length - 8)) + r.value.slice(-4) : "",
    updatedAt: r.updatedAt,
  }));
  res.json({ keys: masked });
});

router.put("/:key", async (req, res) => {
  const { key } = req.params;
  const { value } = req.body as { value: string };
  if (typeof value !== "string") {
    res.status(400).json({ error: "value (string) required" });
    return;
  }

  const existing = await db
    .select()
    .from(appSettingsTable)
    .where(eq(appSettingsTable.key, key))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(appSettingsTable).values({ key, value });
  } else {
    await db
      .update(appSettingsTable)
      .set({ value, updatedAt: new Date() })
      .where(eq(appSettingsTable.key, key));
  }

  res.json({ ok: true, key });
});

router.post("/", async (req, res) => {
  const { key, value } = req.body as { key: string; value: string };
  if (!key || typeof value !== "string") {
    res.status(400).json({ error: "key and value required" });
    return;
  }
  const existing = await db
    .select()
    .from(appSettingsTable)
    .where(eq(appSettingsTable.key, key))
    .limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "Key already exists" });
    return;
  }
  await db.insert(appSettingsTable).values({ key, value });
  res.status(201).json({ ok: true, key });
});

router.delete("/:key", async (req, res) => {
  const { key } = req.params;
  const protectedKeys = ["GEMINI_API_KEY", "VITE_GEMINI_API_KEY", "WEATHER_API_KEY"];
  if (protectedKeys.includes(key)) {
    res.status(400).json({ error: "Cannot delete a protected default key" });
    return;
  }
  await db.delete(appSettingsTable).where(eq(appSettingsTable.key, key));
  res.json({ ok: true });
});

export default router;
