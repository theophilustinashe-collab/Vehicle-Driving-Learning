import { Router } from "express";
import { db, testSessionsTable, usersTable, questionsTable, bookmarksTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router = Router();

router.get("/stats", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: { userId: number } }).user;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const sessions = await db.select().from(testSessionsTable)
      .where(and(eq(testSessionsTable.userId, userId), eq(testSessionsTable.status, "completed")));

    const totalQuestions = sessions.reduce((sum, s) => sum + (s.total ?? 0), 0);
    const correctAnswers = sessions.reduce((sum, s) => sum + (s.score ?? 0), 0);
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    const examReadiness = Math.min(100, accuracy * 0.7 + Math.min(sessions.length * 2, 30));
    const weeklyActivity = getWeeklyActivity(sessions);

    const rank = getRank(user.level ?? 1);

    res.json({
      totalTests: user.totalTests ?? 0,
      totalQuestions,
      correctAnswers,
      accuracy: Math.round(accuracy * 10) / 10,
      streak: user.streak ?? 0,
      xp: user.xp ?? 0,
      level: user.level ?? 1,
      rank,
      examReadiness: Math.round(examReadiness * 10) / 10,
      weeklyActivity,
    });
  } catch (err) {
    logger.error({ err }, "Get user stats error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: { userId: number } }).user;

    let user;
    let sessions = [];

    try {
      const [dbUser] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      user = dbUser;

      if (user) {
        sessions = await db.select().from(testSessionsTable)
          .where(and(eq(testSessionsTable.userId, userId), eq(testSessionsTable.status, "completed")))
          .orderBy(desc(testSessionsTable.completedAt))
          .limit(50);
      }
    } catch (dbErr) {
      logger.warn({ dbErr }, "Database error in dashboard, using mock data");
    }

    // Fallback mock data if DB is unavailable or user not found
    if (!user) {
      user = { id: userId, name: "Learner", level: 1, xp: 0, streak: 0, totalTests: 0 };
    }

    const recentTests = sessions.slice(0, 5).map(s => ({
      sessionId: s.sessionId,
      score: s.score ?? 0,
      total: s.total ?? 25,
      percentage: s.percentage ?? 0,
      passed: s.passed ?? false,
      timeTaken: s.timeTaken ?? 0,
      completedAt: s.completedAt?.toISOString() ?? s.startedAt.toISOString(),
      mode: s.mode,
    }));

    const totalQuestions = sessions.reduce((sum, s) => sum + (s.total ?? 0), 0);
    const correctAnswers = sessions.reduce((sum, s) => sum + (s.score ?? 0), 0);
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const examReadiness = Math.min(100, accuracy * 0.7 + Math.min(sessions.length * 2, 30));
    const weeklyActivity = getWeeklyActivity(sessions);
    const rank = getRank(user.level ?? 1);

    res.json({
      recentTests,
      accuracy: Math.round(accuracy * 10) / 10,
      streak: user.streak ?? 0,
      examReadiness: Math.round(examReadiness * 10) / 10,
      totalTests: user.totalTests ?? 0,
      xp: user.xp ?? 0,
      level: user.level ?? 1,
      rank,
      weeklyActivity,
    });
  } catch (err) {
    logger.error({ err }, "Get dashboard error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/leaderboard", requireAuth, async (req, res) => {
  try {
    const users = await db.select().from(usersTable)
      .orderBy(desc(usersTable.xp))
      .limit(20);

    const entries = users.map((u, i) => ({
      rank: i + 1,
      userId: u.id,
      name: u.name,
      xp: u.xp ?? 0,
      level: u.level ?? 1,
      accuracy: Math.round((u.passRate ?? 0) * 10) / 10,
      totalTests: u.totalTests ?? 0,
    }));

    res.json(entries);
  } catch (err) {
    logger.error({ err }, "Get leaderboard error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/category-breakdown", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: { userId: number } }).user;
    const sessions = await db.select().from(testSessionsTable)
      .where(and(eq(testSessionsTable.userId, userId), eq(testSessionsTable.status, "completed")));

    const allAnswers = sessions.flatMap(s => (s.answers as { questionId: number; isCorrect: boolean }[] ?? []));
    if (allAnswers.length === 0) {
      res.json([]);
      return;
    }

    const questionIds = [...new Set(allAnswers.map(a => a.questionId))];
    const questions = await db.select().from(questionsTable)
      .where(eq(questionsTable.status, "published"));

    const qMap = new Map(questions.map(q => [q.id, q]));
    const catStats: Record<string, { total: number; correct: number }> = {};

    for (const answer of allAnswers) {
      const q = qMap.get(answer.questionId);
      if (!q) continue;
      if (!catStats[q.category]) catStats[q.category] = { total: 0, correct: 0 };
      catStats[q.category].total++;
      if (answer.isCorrect) catStats[q.category].correct++;
    }

    void questionIds;

    const result = Object.entries(catStats).map(([category, stats]) => ({
      category,
      total: stats.total,
      correct: stats.correct,
      accuracy: Math.round((stats.correct / stats.total) * 1000) / 10,
    }));

    res.json(result);
  } catch (err) {
    logger.error({ err }, "Get category breakdown error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/bookmarks", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: { userId: number } }).user;
    const bookmarks = await db.select({ questionId: bookmarksTable.questionId })
      .from(bookmarksTable)
      .where(eq(bookmarksTable.userId, userId));

    if (bookmarks.length === 0) {
      res.json([]);
      return;
    }

    const qIds = bookmarks.map(b => b.questionId);
    const questions = await db.select().from(questionsTable)
      .where(eq(questionsTable.status, "published"));

    const filtered = questions.filter(q => qIds.includes(q.id)).map(q => ({
      ...q,
      options: q.options as string[],
      createdAt: q.createdAt?.toISOString() ?? new Date().toISOString(),
    }));

    res.json(filtered);
  } catch (err) {
    logger.error({ err }, "Get bookmarks error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/bookmarks", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: { userId: number } }).user;
    const { questionId } = req.body;
    if (!questionId) {
      res.status(400).json({ error: "questionId is required" });
      return;
    }
    await db.insert(bookmarksTable).values({ userId, questionId }).onConflictDoNothing();
    res.status(201).json({ message: "Bookmarked" });
  } catch (err) {
    logger.error({ err }, "Add bookmark error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/bookmarks/:questionId", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: { userId: number } }).user;
    const questionId = parseInt(req.params.questionId as string);
    await db.delete(bookmarksTable)
      .where(and(eq(bookmarksTable.userId, userId), eq(bookmarksTable.questionId, questionId)));
    res.json({ message: "Bookmark removed" });
  } catch (err) {
    logger.error({ err }, "Remove bookmark error");
    res.status(500).json({ error: "Internal server error" });
  }
});

function getRank(level: number): string {
  if (level >= 10) return "VID Master";
  if (level >= 7) return "Highway Expert";
  if (level >= 5) return "Safe Driver";
  if (level >= 3) return "Road User";
  return "Beginner Driver";
}

function getWeeklyActivity(sessions: typeof testSessionsTable.$inferSelect[]) {
  const now = new Date();
  const activity = new Array(7).fill(0);
  for (const s of sessions) {
    const completed = s.completedAt ?? s.startedAt;
    const daysDiff = Math.floor((now.getTime() - completed.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff >= 0 && daysDiff < 7) {
      activity[6 - daysDiff]++;
    }
  }
  return activity;
}

export default router;
