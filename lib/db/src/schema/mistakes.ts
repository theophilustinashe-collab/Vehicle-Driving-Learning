import { pgTable, serial, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { questionsTable } from "./questions";

export const mistakesTable = pgTable("mistakes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  questionId: integer("question_id").references(() => questionsTable.id).notNull(),
  incorrectCount: integer("incorrect_count").default(1).notNull(),
  lastAttemptedAt: timestamp("last_attempted_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    userQuestionIdx: uniqueIndex("user_question_idx").on(table.userId, table.questionId),
  };
});
