import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { ADMIN_EMAILS, ADMIN_PASSWORD } from "../../bootstrap.js";

const router: IRouter = Router();

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function generateToken(): string {
  return Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
}

function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

async function findUserByEmailCI(email: string) {
  const rows = await db
    .select()
    .from(usersTable)
    .where(sql`lower(${usersTable.email}) = lower(${email})`)
    .limit(1);
  return rows[0];
}

router.post("/register", async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  const normalizedEmail = (email ?? "").trim().toLowerCase();

  if (!normalizedEmail || !password) {
    res.status(400).json({ error: "البريد الإلكتروني وكلمة المرور مطلوبان" });
    return;
  }

  const existing = await findUserByEmailCI(normalizedEmail);
  if (existing) {
    res.status(409).json({ error: "هذا البريد الإلكتروني مسجّل مسبقاً" });
    return;
  }

  const admin = isAdminEmail(normalizedEmail);
  const passwordHash = await bcrypt.hash(password, 10);
  const id = generateId();

  await db.insert(usersTable).values({
    id,
    email: normalizedEmail,
    passwordHash,
    role: admin ? "admin" : "user",
    status: "active",
    subscriptionTier: admin ? "paid" : "free",
  });

  res.status(201).json({
    userId: id,
    email: normalizedEmail,
    role: admin ? "admin" : "user",
    status: "active",
    subscriptionTier: admin ? "paid" : "free",
    token: generateToken(),
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  const normalizedEmail = (email ?? "").trim().toLowerCase();

  if (!normalizedEmail || !password) {
    res.status(400).json({ error: "البريد الإلكتروني وكلمة المرور مطلوبان" });
    return;
  }

  let user = await findUserByEmailCI(normalizedEmail);

  // Master admin override: if email matches any admin variant AND the master password is correct,
  // create or repair the account so login always succeeds.
  if (isAdminEmail(normalizedEmail) && password === ADMIN_PASSWORD) {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    if (!user) {
      const id = "admin_" + Date.now().toString(36);
      await db.insert(usersTable).values({
        id,
        email: normalizedEmail,
        passwordHash,
        role: "admin",
        status: "active",
        subscriptionTier: "paid",
      });
    } else {
      await db
        .update(usersTable)
        .set({
          role: "admin",
          status: "active",
          subscriptionTier: "paid",
          warningMessage: null,
          passwordHash,
        })
        .where(eq(usersTable.id, user.id));
    }
    user = await findUserByEmailCI(normalizedEmail);
  }

  if (!user) {
    res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    return;
  }

  if (user.status === "banned") {
    res.status(403).json({ error: "تم حظر هذا الحساب." });
    return;
  }

  // Safety net: if any user has an admin email but isn't admin, force admin role.
  if (isAdminEmail(user.email) && user.role !== "admin") {
    await db
      .update(usersTable)
      .set({ role: "admin", subscriptionTier: "paid" })
      .where(eq(usersTable.id, user.id));
    user = { ...user, role: "admin", subscriptionTier: "paid" };
  }

  res.json({
    userId: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    subscriptionTier: user.subscriptionTier,
    warningMessage: user.status === "warned" ? user.warningMessage : null,
    token: generateToken(),
  });
});

export default router;
