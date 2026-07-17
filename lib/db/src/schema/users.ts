import { pgTable, serial, text, integer, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum("user_role", ["learner", "admin"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  city: text("city"),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  language: text("language").notNull().default("en"),
  soundEnabled: integer("sound_enabled").notNull().default(1), // 1 for true, 0 for false
  role: userRoleEnum("role").notNull().default("learner"),
  xp: integer("xp").notNull().default(0),
  coins: integer("coins").notNull().default(0),
  level: integer("level").notNull().default(1),
  unlockedItems: text("unlocked_items").default("[]"), // JSON string of IDs
  streak: integer("streak").notNull().default(0),
  totalTests: integer("total_tests").notNull().default(0),
  passRate: real("pass_rate"),
  lastDailyChallengeAt: timestamp("last_daily_challenge_at"),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, lastActiveAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
