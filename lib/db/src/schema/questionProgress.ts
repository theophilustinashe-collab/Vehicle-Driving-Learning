import { pgTable, serial, integer, timestamp, uniqueIndex, boolean } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { questionsTable } from "./questions";

export const questionProgressTable = pgTable("question_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  questionId: integer("question_id").references(() => questionsTable.id).notNull(),
  correctStreak: integer("correct_streak").default(0).notNull(),
  totalCorrect: integer("total_correct").default(0).notNull(),
  totalIncorrect: integer("total_incorrect").default(0).notNull(),
  isMastered: boolean("is_mastered").default(false).notNull(),
  lastAttemptedAt: timestamp("last_attempted_at").defaultNow().notNull(),
}, (table) => {
  return {
    userQProgIdx: uniqueIndex("user_q_prog_idx").on(table.userId, table.questionId),
  };
});
