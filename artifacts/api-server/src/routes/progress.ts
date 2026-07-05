import { Router } from "express";
import { db, testSessionsTable, usersTable, questionsTable, bookmarksTable, mistakesTable, badgesTable, userBadgesTable, questionProgressTable } from "@workspace/db";
import { eq, desc, and, sql, inArray } from "drizzle-orm";
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

    const [masteredData] = await db.select({ count: sql<number>`count(*)` })
      .from(questionProgressTable)
      .where(and(eq(questionProgressTable.userId, userId), eq(questionProgressTable.isMastered, true)));

    const [totalQuestionsData] = await db.select({ count: sql<number>`count(*)` })
      .from(questionsTable)
      .where(eq(questionsTable.status, "published"));

    const totalQuestionsInPool = Number(totalQuestionsData?.count || 1);
    const masteredCount = Number(masteredData?.count || 0);

    const totalQuestionsAnswered = sessions.reduce((sum, s) => sum + (s.total ?? 0), 0);
    const correctAnswers = sessions.reduce((sum, s) => sum + (s.score ?? 0), 0);
    const accuracy = totalQuestionsAnswered > 0 ? (correctAnswers / totalQuestionsAnswered) * 100 : 0;

    // Pro Readiness Logic: heavily weighted by Mastery
    const masteryPercentage = (masteredCount / totalQuestionsInPool) * 100;
    const examReadiness = (masteryPercentage * 0.8) + (accuracy * 0.2);

    const weeklyActivity = getWeeklyActivity(sessions);
    const rank = getRank(user.level ?? 1);

    res.json({
      totalTests: user.totalTests ?? 0,
      totalQuestions: totalQuestionsAnswered,
      correctAnswers,
      accuracy: Math.round(accuracy * 10) / 10,
      streak: user.streak ?? 0,
      xp: user.xp ?? 0,
      level: user.level ?? 1,
      rank,
      examReadiness: Math.round(examReadiness * 10) / 10,
      weeklyActivity,
      masteredQuestions: masteredCount,
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
    let sessions: typeof testSessionsTable.$inferSelect[] = [];

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

    if (!user) {
      user = { id: userId, name: "Learner", level: 1, xp: 0, streak: 0, totalTests: 0 };
    }

    const [masteredData] = await db.select({ count: sql<number>`count(*)` })
      .from(questionProgressTable)
      .where(and(eq(questionProgressTable.userId, userId), eq(questionProgressTable.isMastered, true)));

    const [totalQuestionsData] = await db.select({ count: sql<number>`count(*)` })
      .from(questionsTable)
      .where(eq(questionsTable.status, "published"));

    const totalQuestionsInPool = Number(totalQuestionsData?.count || 1);
    const masteredCount = Number(masteredData?.count || 0);

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

    const totalQuestionsAnswered = sessions.reduce((sum, s) => sum + (s.total ?? 0), 0);
    const correctAnswers = sessions.reduce((sum, s) => sum + (s.score ?? 0), 0);
    const accuracy = totalQuestionsAnswered > 0 ? (correctAnswers / totalQuestionsAnswered) * 100 : 0;

    const masteryPercentage = (masteredCount / totalQuestionsInPool) * 100;
    const examReadiness = (masteryPercentage * 0.8) + (accuracy * 0.2);

    const weeklyActivity = getWeeklyActivity(sessions);
    const rankLabel = getRank(user.level ?? 1);

    const allUsers = await db.select({ id: usersTable.id }).from(usersTable).orderBy(desc(usersTable.xp));
    const numericRank = allUsers.findIndex(u => u.id === userId) + 1;

    let dailyChallengeCompleted = false;
    if (user.lastDailyChallengeAt) {
      const today = new Date().setHours(0,0,0,0);
      const last = new Date(user.lastDailyChallengeAt).setHours(0,0,0,0);
      dailyChallengeCompleted = (today === last);
    }

    res.json({
      recentTests,
      accuracy: Math.round(accuracy * 10) / 10,
      streak: user.streak ?? 0,
      examReadiness: Math.round(examReadiness * 10) / 10,
      totalTests: user.totalTests ?? 0,
      xp: user.xp ?? 0,
      level: user.level ?? 1,
      rank: rankLabel,
      numericRank,
      weeklyActivity,
      masteredQuestions: masteredCount,
      dailyChallengeCompleted,
    });
  } catch (err) {
    logger.error({ err }, "Get dashboard error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/leaderboard", requireAuth, async (req, res) => {
  try {
    const { period = "alltime" } = req.query as Record<string, string>;

    let users;
    if (period === "alltime") {
      users = await db.select().from(usersTable)
        .orderBy(desc(usersTable.xp))
        .limit(50);
    } else {
      const now = new Date();
      let startDate = new Date();
      if (period === "daily") startDate.setHours(0, 0, 0, 0);
      else if (period === "weekly") startDate.setDate(now.getDate() - 7);
      else if (period === "monthly") startDate.setMonth(now.getMonth() - 1);
      else startDate.setFullYear(2000);

      users = await db.select().from(usersTable)
        .where(sql`${usersTable.lastActiveAt} > ${startDate}`)
        .orderBy(desc(usersTable.xp))
        .limit(50);
    }

    const entries = users.map((u, i) => ({
      rank: i + 1,
      userId: u.id,
      name: u.name,
      avatarUrl: u.avatarUrl,
      city: u.city || "Zimbabwe",
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

    // Get all published questions to group by category
    const allQuestions = await db.select().from(questionsTable).where(eq(questionsTable.status, "published"));

    // Get user's progress
    const progress = await db.select().from(questionProgressTable).where(eq(questionProgressTable.userId, userId));
    const progressMap = new Map(progress.map(p => [p.questionId, p]));

    const catStats: Record<string, { total: number; mastered: number }> = {};

    for (const q of allQuestions) {
      if (!catStats[q.category]) catStats[q.category] = { total: 0, mastered: 0 };
      catStats[q.category].total++;

      const p = progressMap.get(q.id);
      if (p?.isMastered) {
        catStats[q.category].mastered++;
      }
    }

    const result = Object.entries(catStats).map(([category, stats]) => ({
      category,
      total: stats.total,
      correct: stats.mastered, // Map 'mastered' to 'correct' for UI compatibility
      accuracy: stats.total > 0 ? Math.round((stats.mastered / stats.total) * 1000) / 10 : 0,
    }));

    res.json(result);
  } catch (err) {
    logger.error({ err }, "Get category breakdown error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/mistakes", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: { userId: number } }).user;
    const mistakes = await db.select()
      .from(mistakesTable)
      .where(eq(mistakesTable.userId, userId))
      .orderBy(desc(mistakesTable.incorrectCount));

    if (mistakes.length === 0) {
      res.json([]);
      return;
    }

    const qIds = mistakes.map(m => m.questionId);
    const questions = await db.select().from(questionsTable)
      .where(and(eq(questionsTable.status, "published"), inArray(questionsTable.id, qIds)));

    const result = questions.map(q => {
      const m = mistakes.find(mistake => mistake.questionId === q.id);
      return {
        ...q,
        incorrectCount: m?.incorrectCount || 1,
        lastAttemptedAt: m?.lastAttemptedAt || new Date().toISOString(),
      };
    });

    res.json(result);
  } catch (err) {
    logger.error({ err }, "Get mistakes error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/badges", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: { userId: number } }).user;

    const [allBadges, userEarned] = await Promise.all([
      db.select().from(badgesTable),
      db.select({ badgeId: userBadgesTable.badgeId }).from(userBadgesTable).where(eq(userBadgesTable.userId, userId))
    ]);

    const earnedIds = new Set(userEarned.map(u => u.badgeId));

    const result = allBadges.map(b => ({
      ...b,
      earned: earnedIds.has(b.id)
    }));

    res.json(result);
  } catch (err) {
    logger.error({ err }, "Get badges error");
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
      .where(and(eq(questionsTable.status, "published"), inArray(questionsTable.id, qIds)));

    const filtered = questions.map(q => ({
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

router.post("/daily-challenge/complete", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: { userId: number } }).user;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const now = new Date();
    const lastChallenge = user.lastDailyChallengeAt;

    if (lastChallenge) {
      const today = new Date().setHours(0,0,0,0);
      const last = new Date(lastChallenge).setHours(0,0,0,0);
      if (today === last) {
        res.status(400).json({ error: "Already completed today" });
        return;
      }
    }

    const xpGain = 50;
    const newXp = (user.xp ?? 0) + xpGain;
    const newLevel = Math.floor(newXp / 500) + 1;

    await db.update(usersTable).set({
      xp: newXp,
      level: newLevel,
      lastDailyChallengeAt: now,
      lastActiveAt: now,
    }).where(eq(usersTable.id, userId));

    res.json({ message: "Challenge complete", xpEarned: xpGain, totalXp: newXp, level: newLevel });
  } catch (err) {
    logger.error({ err }, "Daily challenge error");
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
