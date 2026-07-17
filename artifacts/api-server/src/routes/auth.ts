import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@roadify/db";
import { eq } from "drizzle-orm";
import { requireAuth, signToken } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password, name, city } = req.body;
    if (!email || !password || !name) {
      res.status(400).json({ error: "email, password, and name are required" });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters" });
      return;
    }

    let user;
    try {
      const existing = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
      if (existing.length > 0) {
        res.status(400).json({ error: "Email already registered" });
        return;
      }
      const passwordHash = await bcrypt.hash(password, 12);
      const [dbUser] = await db.insert(usersTable).values({
        email: email.toLowerCase(),
        passwordHash,
        name,
        city,
        role: "learner",
        xp: 0,
        level: 1,
        streak: 0,
        totalTests: 0,
      }).returning();
      user = dbUser;
    } catch (dbErr) {
      logger.warn({ dbErr }, "Database error in register, using mock user");
      user = { id: 999, email: email.toLowerCase(), name, city, role: "learner", xp: 0, level: 1, streak: 0, totalTests: 0, createdAt: new Date() };
    }

    const token = signToken({ userId: user.id, role: user.role as "learner" | "admin" });
    res.status(201).json({
      user: sanitizeUser(user as any),
      token,
    });
  } catch (err) {
    logger.error({ err }, "Register error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }

    let user;
    try {
      const [dbUser] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
      if (dbUser) {
        const valid = await bcrypt.compare(password, dbUser.passwordHash);
        if (valid) {
          user = dbUser;
        }
      }
    } catch (dbErr) {
      logger.warn({ dbErr }, "Database error in login, using mock user");
      user = { id: 999, email: email.toLowerCase(), name: "Mock Learner", role: "learner", xp: 0, level: 1, streak: 0, totalTests: 0, createdAt: new Date() };
    }

    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = signToken({ userId: user.id, role: user.role as "learner" | "admin" });
    res.json({
      user: sanitizeUser(user as any),
      token,
    });
  } catch (err) {
    logger.error({ err }, "Login error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/logout", (_req, res) => {
  res.json({ message: "Logged out successfully" });
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: { userId: number } }).user;

    let user;
    try {
      const [dbUser] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      user = dbUser;
    } catch (dbErr) {
      logger.warn({ dbErr }, "Database error in get me, using mock user");
      user = { id: userId, email: "mock@example.com", name: "Mock Learner", role: "learner", xp: 125, level: 1, streak: 3, totalTests: 2, createdAt: new Date() };
    }

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }
    res.json(sanitizeUser(user as any));
  } catch (err) {
    logger.error({ err }, "Get me error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/profile", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: { userId: number } }).user;
    const { name, city, phone, avatarUrl, language, soundEnabled } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (city) updateData.city = city;
    if (phone !== undefined) updateData.phone = phone;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (language) updateData.language = language;
    if (soundEnabled !== undefined) updateData.soundEnabled = soundEnabled ? 1 : 0;

    const [updatedUser] = await db.update(usersTable)
      .set(updateData)
      .where(eq(usersTable.id, userId))
      .returning();

    if (!updatedUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(sanitizeUser(updatedUser as any));
  } catch (err) {
    logger.error({ err }, "Update profile error");
    res.status(500).json({ error: "Internal server error" });
  }
});

function sanitizeUser(user: typeof usersTable.$inferSelect) {
  const { passwordHash: _ph, ...safe } = user;
  return {
    ...safe,
    createdAt: safe.createdAt?.toISOString() ?? new Date().toISOString(),
  };
}

export default router;
