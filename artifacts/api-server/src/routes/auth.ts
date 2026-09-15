import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@roadify/db";
import { eq } from "drizzle-orm";
import { requireAuth, signToken } from "../middlewares/auth";
import { logger } from "../lib/logger";
import { z } from "zod";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  city: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/register", async (req, res) => {
  try {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      console.warn("[Auth] Validation Failure:", JSON.stringify(validation.error.format()));
      res.status(400).json({ error: "Invalid registration details", details: validation.error.format() });
      return;
    }
    const { email, password, name, city } = validation.data;

    let user;
    try {
      const existing = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
      if (existing.length > 0) {
        res.status(400).json({ error: "This email is already associated with an account." });
        return;
      }
      const passwordHash = await bcrypt.hash(password, 12);

      const ADMIN_EMAILS = ["google-user@gmail.com", "admin@roadify.co.zw", "theophilustinashe@gmail.com"];
      const role = ADMIN_EMAILS.includes(email.toLowerCase()) ? "admin" : "learner";

      const [dbUser] = await db.insert(usersTable).values({
        email: email.toLowerCase(),
        passwordHash,
        name,
        city: city || null,
        role: role,
        xp: 0,
        level: 1,
        streak: 0,
        totalTests: 0,
      }).returning();
      user = dbUser;
      logger.info({ userId: user.id }, "User registered successfully");
    } catch (dbErr: any) {
      console.error("[Auth] Registration Database Error:", dbErr.message, dbErr.stack);
      if (process.env.NODE_ENV === "production") {
        res.status(500).json({ error: "Database error during registration. Please try again." });
        return;
      }
      logger.warn({ dbErr }, "Database error in register, using mock user");
      user = { id: 999, email: email.toLowerCase(), name, city, role: "learner", xp: 0, level: 1, streak: 0, totalTests: 0, createdAt: new Date() };
    }

    const token = signToken({ userId: user.id, role: user.role as "learner" | "admin" });
    res.status(201).json({
      user: sanitizeUser(user as any),
      token,
    });
  } catch (err: any) {
    console.error("[Auth] Global Register Error:", err.message);
    logger.error({ err }, "Register error");
    res.status(500).json({ error: "Could not complete registration due to a system error." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: "Invalid login credentials" });
      return;
    }
    const { email, password } = validation.data;

    let user;
    try {
      const [dbUser] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
      if (dbUser) {
        const valid = await bcrypt.compare(password, dbUser.passwordHash);
        if (valid) {
          user = dbUser;

          // MASTER ADMIN ELEVATION: Grant admin role to specific emails
          const ADMIN_EMAILS = ["google-user@gmail.com", "admin@roadify.co.zw", "theophilustinashe@gmail.com"];
          if (ADMIN_EMAILS.includes(email.toLowerCase()) && user.role !== "admin") {
            const [elevated] = await db.update(usersTable)
              .set({ role: "admin" })
              .where(eq(usersTable.id, user.id))
              .returning();
            user = elevated;
            logger.info({ userId: user.id }, "User elevated to Admin via Master List");
          }

          logger.info({ userId: user.id }, "User logged in");
        }
      }
    } catch (dbErr) {
      if (process.env.NODE_ENV === "production") throw dbErr;
      logger.warn({ dbErr }, "Database error in login, using mock user");

      const ADMIN_EMAILS = ["google-user@gmail.com", "admin@roadify.co.zw", "theophilustinashe@gmail.com"];
      const role = ADMIN_EMAILS.includes(email.toLowerCase()) ? "admin" : "learner";

      user = { id: 999, email: email.toLowerCase(), name: "Mock Learner", role, xp: 0, level: 1, streak: 0, totalTests: 0, createdAt: new Date() };
    }

    if (!user) {
      // generic error to prevent enumeration
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
    res.status(500).json({ error: "Authentication failed" });
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

const profileUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  city: z.string().optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  avatarUrl: z.string().max(2 * 1024 * 1024).optional().nullable(), // 2MB limit for base64
  language: z.enum(["en", "sn", "nd"]).optional(),
  soundEnabled: z.boolean().optional(),
});

router.patch("/profile", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: { userId: number } }).user;
    const validation = profileUpdateSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({ error: "Invalid profile data", details: validation.error.format() });
      return;
    }

    const { name, city, phone, avatarUrl, language, soundEnabled } = validation.data;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (city !== undefined) updateData.city = city;
    if (phone !== undefined) updateData.phone = phone;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (language) updateData.language = language;
    if (soundEnabled !== undefined) updateData.soundEnabled = soundEnabled ? 1 : 0;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: "No update data provided" });
      return;
    }

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
    res.status(500).json({ error: "Failed to update profile" });
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
