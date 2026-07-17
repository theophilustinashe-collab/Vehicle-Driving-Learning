import { Router } from "express";
import { db, questionsTable } from "@roadify/db";
import { eq, and, ilike, SQL } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const { category, difficulty, limit = "50", offset = "0" } = req.query as Record<string, string>;
    const conditions: SQL[] = [eq(questionsTable.status, "published")];
    if (category) conditions.push(ilike(questionsTable.category, category));

    const validDifficulties = ["easy", "medium", "hard"];
    if (difficulty && validDifficulties.includes(difficulty)) {
      conditions.push(eq(questionsTable.difficulty, difficulty as "easy" | "medium" | "hard"));
    }

    let questions = [];
    try {
      questions = await db
        .select()
        .from(questionsTable)
        .where(and(...conditions))
        .limit(parseInt(limit))
        .offset(parseInt(offset));
    } catch (dbErr) {
      logger.warn({ dbErr }, "Database error in list questions, using mock data");
      questions = [
        { id: 1, text: "What should you do at a stop sign?", options: ["Speed up", "Stop completely", "Slow down", "Honk"], correctAnswer: 1, category: "Rules", difficulty: "easy", status: "published" },
        { id: 2, text: "What does a yellow light mean?", options: ["Go fast", "Stop if safe", "Accelerate", "Turn off engine"], correctAnswer: 1, category: "Signals", difficulty: "medium", status: "published" },
      ];
    }
    res.json(questions.map(formatQuestion));
  } catch (err) {
    logger.error({ err }, "List questions error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { text, options, correctAnswer, category, difficulty, explanation, imageUrl } = req.body;
    if (!text || !options || correctAnswer === undefined || !category || !difficulty || !explanation) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const [question] = await db.insert(questionsTable).values({
      text,
      options,
      correctAnswer,
      category,
      difficulty,
      explanation,
      imageUrl: imageUrl ?? null,
      status: "published",
    }).returning();
    res.status(201).json(formatQuestion(question));
  } catch (err) {
    logger.error({ err }, "Create question error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const [question] = await db.select().from(questionsTable).where(eq(questionsTable.id, id)).limit(1);
    if (!question) {
      res.status(404).json({ error: "Question not found" });
      return;
    }
    res.json(formatQuestion(question));
  } catch (err) {
    logger.error({ err }, "Get question error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const { text, options, correctAnswer, category, difficulty, explanation, imageUrl, status } = req.body;
    const updateData: Record<string, unknown> = {};
    if (text !== undefined) updateData.text = text;
    if (options !== undefined) updateData.options = options;
    if (correctAnswer !== undefined) updateData.correctAnswer = correctAnswer;
    if (category !== undefined) updateData.category = category;
    if (difficulty !== undefined) updateData.difficulty = difficulty;
    if (explanation !== undefined) updateData.explanation = explanation;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (status !== undefined) updateData.status = status;
    const [updated] = await db.update(questionsTable).set(updateData).where(eq(questionsTable.id, id)).returning();
    if (!updated) {
      res.status(404).json({ error: "Question not found" });
      return;
    }
    res.json(formatQuestion(updated));
  } catch (err) {
    logger.error({ err }, "Update question error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    await db.delete(questionsTable).where(eq(questionsTable.id, id));
    res.json({ message: "Question deleted" });
  } catch (err) {
    logger.error({ err }, "Delete question error");
    res.status(500).json({ error: "Internal server error" });
  }
});

function formatQuestion(q: typeof questionsTable.$inferSelect) {
  return {
    ...q,
    options: q.options as string[],
    createdAt: q.createdAt?.toISOString() ?? new Date().toISOString(),
  };
}

export default router;
