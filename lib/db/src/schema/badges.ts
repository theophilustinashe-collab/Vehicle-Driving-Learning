import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const badgesTable = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(), // Lucide icon name
  criteria: text("criteria").notNull(), // e.g. "total_tests:10"
  xpReward: integer("xp_reward").notNull().default(100),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userBadgesTable = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  badgeId: integer("badge_id").references(() => badgesTable.id).notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});
