import { pgTable, serial, text, integer, real, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const testSessionsTable = pgTable("test_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  mode: text("mode").notNull().default("timed"),
  questionIds: jsonb("question_ids").notNull().$type<number[]>(),
  answers: jsonb("answers").$type<{
    questionId: number;
    text?: string;
    selectedAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    explanation?: string;
  }[]>(),
  score: integer("score"),
  total: integer("total"),
  percentage: real("percentage"),
  passed: boolean("passed"),
  timeTaken: integer("time_taken"),
  status: text("status").notNull().default("in_progress"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertTestSessionSchema = createInsertSchema(testSessionsTable).omit({ id: true });
export type InsertTestSession = z.infer<typeof insertTestSessionSchema>;
export type TestSession = typeof testSessionsTable.$inferSelect;
