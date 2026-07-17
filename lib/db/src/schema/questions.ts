import { pgTable, serial, text, integer, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"]);
export const questionStatusEnum = pgEnum("question_status", ["draft", "approved", "published", "archived"]);

export const questionsTable = pgTable("questions", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  options: jsonb("options").notNull().$type<string[]>(),
  correctAnswer: integer("correct_answer").notNull(),
  category: text("category").notNull(),
  difficulty: difficultyEnum("difficulty").notNull().default("medium"),
  explanation: text("explanation").notNull(),
  imageUrl: text("image_url"),
  status: questionStatusEnum("status").notNull().default("published"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertQuestionSchema = createInsertSchema(questionsTable).omit({ id: true, createdAt: true });
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questionsTable.$inferSelect;
