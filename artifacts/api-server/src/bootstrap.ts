import bcrypt from "bcryptjs";
import { db, usersTable, appSettingsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

export const ADMIN_EMAILS = [
  "salahenghakim@gmail.com",
  "salahenghakimi@gmail.com",
];
export const PRIMARY_ADMIN_EMAIL = "salahenghakim@gmail.com";
export const ADMIN_PASSWORD = "salah106584";
const DEFAULT_KEYS = ["GEMINI_API_KEY", "VITE_GEMINI_API_KEY", "WEATHER_API_KEY"];

export async function bootstrap(): Promise<void> {
  try {
    for (const email of ADMIN_EMAILS) {
      const existing = await db
        .select()
        .from(usersTable)
        .where(sql`lower(${usersTable.email}) = ${email}`)
        .limit(1);

      if (existing.length === 0) {
        const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
        await db.insert(usersTable).values({
          id: "admin_" + email.replace(/[^a-z0-9]/gi, "_") + "_" + Date.now().toString(36),
          email,
          passwordHash,
          role: "admin",
          status: "active",
          subscriptionTier: "paid",
        });
        console.log("[bootstrap] Admin account created:", email);
      } else {
        const u = existing[0];
        if (u.role !== "admin" || u.status !== "active") {
          await db
            .update(usersTable)
            .set({
              role: "admin",
              status: "active",
              subscriptionTier: "paid",
              warningMessage: null,
            })
            .where(eq(usersTable.id, u.id));
          console.log("[bootstrap] Existing user promoted to admin:", email);
        }
      }
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
