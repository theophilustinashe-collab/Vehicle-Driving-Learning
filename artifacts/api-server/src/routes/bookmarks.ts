import { Router } from "express";
import { db, bookmarksTable, questionsTable } from "@roadify/db";
import { eq, and, inArray } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as any).user;

    const userBookmarks = await db.select()
      .from(bookmarksTable)
      .where(eq(bookmarksTable.userId, userId));

    if (userBookmarks.length === 0) {
      res.json([]);
      return;
    }

    const questionIds = userBookmarks.map(b => b.questionId);
    const questions = await db.select()
      .from(questionsTable)
      .where(inArray(questionsTable.id, questionIds));

    res.json(questions);
  } catch (err) {
    logger.error({ err }, "Get bookmarks error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as any).user;
    const { questionId } = req.body;

    if (!questionId) {
      res.status(400).json({ error: "Question ID is required" });
      return;
    }

    // Check if already bookmarked
    const existing = await db.select()
      .from(bookmarksTable)
      .where(and(
        eq(bookmarksTable.userId, userId),
        eq(bookmarksTable.questionId, questionId)
      ))
      .limit(1);

    if (existing.length > 0) {
      res.json({ message: "Already bookmarked" });
      return;
    }

    await db.insert(bookmarksTable).values({
      userId,
      questionId
    });

    res.status(201).json({ success: true, message: "Added to bookmarks" });
  } catch (err) {
    logger.error({ err }, "Add bookmark error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:questionId", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as any).user;
    const questionId = parseInt(req.params.questionId);

    await db.delete(bookmarksTable)
      .where(and(
        eq(bookmarksTable.userId, userId),
        eq(bookmarksTable.questionId, questionId)
      ));

    res.json({ success: true, message: "Removed from bookmarks" });
  } catch (err) {
    logger.error({ err }, "Remove bookmark error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
