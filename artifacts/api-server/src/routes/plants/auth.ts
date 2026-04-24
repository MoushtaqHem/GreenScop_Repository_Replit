import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function generateToken(): string {
  return Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
}

router.post("/register", async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };

  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }

  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (existing.length > 0) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const id = generateId();

  await db.insert(usersTable).values({ id, email, passwordHash });

  res.status(201).json({
    userId: id,
    email,
    role: "user",
    status: "active",
    subscriptionTier: "free",
    token: generateToken(),
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };

  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }

  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (users.length === 0) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const user = users[0];
  const valid = await bcrypt.compare(password, user.passwordHash);

  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  if (user.status === "banned") {
    res.status(403).json({ error: "Your account has been banned." });
    return;
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
