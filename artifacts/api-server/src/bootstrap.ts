import bcrypt from "bcryptjs";
import { db, usersTable, appSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const ADMIN_EMAIL = "salahenghakimi@gmail.com";
const ADMIN_PASSWORD = "salah106584";
const DEFAULT_KEYS = ["GEMINI_API_KEY", "VITE_GEMINI_API_KEY", "WEATHER_API_KEY"];

export async function bootstrap(): Promise<void> {
  try {
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, ADMIN_EMAIL))
      .limit(1);

    if (existing.length === 0) {
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
      await db.insert(usersTable).values({
        id: "admin_" + Date.now().toString(36),
        email: ADMIN_EMAIL,
        passwordHash,
        role: "admin",
        status: "active",
        subscriptionTier: "paid",
      });
      console.log("[bootstrap] Admin account created:", ADMIN_EMAIL);
    } else if (existing[0].role !== "admin") {
      await db
        .update(usersTable)
        .set({ role: "admin", status: "active", subscriptionTier: "paid" })
        .where(eq(usersTable.email, ADMIN_EMAIL));
      console.log("[bootstrap] Existing user promoted to admin:", ADMIN_EMAIL);
    }

    for (const key of DEFAULT_KEYS) {
      const row = await db
        .select()
        .from(appSettingsTable)
        .where(eq(appSettingsTable.key, key))
        .limit(1);
      if (row.length === 0) {
        await db.insert(appSettingsTable).values({ key, value: "" });
      }
    }
  } catch (err) {
    console.error("[bootstrap] failed:", err);
  }
}
