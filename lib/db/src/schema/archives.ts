import { pgTable, serial, text, integer, timestamp, real } from "drizzle-orm/pg-core";

export const leaderboardArchivesTable = pgTable("leaderboard_archives", {
  id: serial("id").primaryKey(),
  weekNumber: integer("week_number").notNull(),
  year: integer("year").notNull(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  rank: integer("rank").notNull(),
  xp: integer("xp").notNull(),
  avatarUrl: text("avatar_url"),
  archivedAt: timestamp("archived_at").defaultNow().notNull(),
});
