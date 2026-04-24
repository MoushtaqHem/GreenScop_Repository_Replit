import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

const ADMIN_EMAIL = "salahenghakimi@gmail.com";
const ADMIN_PASSWORD = "salah106584";

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function generateToken(): string {
  return Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
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
    res.status(400).json({ error: "Email and password required" });
    return;
  }

  const existing = await findUserByEmailCI(normalizedEmail);
  if (existing) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const id = generateId();
  const isAdmin = normalizedEmail === ADMIN_EMAIL;

  await db.insert(usersTable).values({
    id,
    email: normalizedEmail,
    passwordHash,
    role: isAdmin ? "admin" : "user",
    status: "active",
    subscriptionTier: isAdmin ? "paid" : "free",
  });

  res.status(201).json({
    userId: id,
    email: normalizedEmail,
    role: isAdmin ? "admin" : "user",
    status: "active",
    subscriptionTier: isAdmin ? "paid" : "free",
    token: generateToken(),
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  const normalizedEmail = (email ?? "").trim().toLowerCase();

  if (!normalizedEmail || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }

  let user = await findUserByEmailCI(normalizedEmail);

  // Special handling: admin master credentials always work and auto-promote any matching account.
  if (normalizedEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    if (!user) {
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
      const id = "admin_" + Date.now().toString(36);
      await db.insert(usersTable).values({
        id,
        email: ADMIN_EMAIL,
        passwordHash,
        role: "admin",
        status: "active",
        subscriptionTier: "paid",
      });
      user = await findUserByEmailCI(ADMIN_EMAIL);
    } else if (user.role !== "admin" || user.status !== "active") {
      await db
        .update(usersTable)
        .set({
          role: "admin",
          status: "active",
          subscriptionTier: "paid",
          warningMessage: null,
          passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 10),
        })
        .where(eq(usersTable.id, user.id));
      user = await findUserByEmailCI(ADMIN_EMAIL);
    }
  }

  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  if (user.status === "banned") {
    res.status(403).json({ error: "Your account has been banned." });
    return;
  }

  // Safety net: if any user happens to match the admin email (case-insensitive), force admin role.
  if (user.email.toLowerCase() === ADMIN_EMAIL && user.role !== "admin") {
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
