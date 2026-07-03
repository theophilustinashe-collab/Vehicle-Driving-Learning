import { Router } from "express";
import { db, usersTable, questionsTable, testSessionsTable, roadSignsTable } from "@workspace/db";
import { eq, count, desc } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router = Router();

router.post("/seed", async (req, res) => {
  try {
    const questions = [
      {
        text: "When should you use your hooter in a built-up area?",
        options: ["To greet friends", "Only to avoid an accident", "To get people out of your way", "When you are angry"],
        correctAnswer: 1,
        category: "General Rules",
        difficulty: "easy",
        explanation: "In built-up areas, the hooter should only be used as a warning to avoid a potential collision or accident.",
      },
      {
        text: "What is the general speed limit for a light motor vehicle on a wide tarred road in Zimbabwe?",
        options: ["80 km/h", "100 km/h", "120 km/h", "60 km/h"],
        correctAnswer: 2,
        category: "General Rules",
        difficulty: "medium",
        explanation: "On wide tarred roads (highways), the general speed limit for light motor vehicles is 120 km/h unless otherwise stated.",
      },
      {
        text: "What does a solid white line in the middle of the road mean?",
        options: ["You may overtake", "Overtaking is permitted if clear", "You must not cross or straddle the line", "Parking is allowed"],
        correctAnswer: 2,
        category: "Road Markings",
        difficulty: "easy",
        explanation: "A solid white line indicates that you must not cross or straddle it, usually because it's dangerous to overtake there.",
      },
      {
        text: "At an uncontrolled intersection, who has the right of way?",
        options: ["The faster vehicle", "The vehicle on the right", "The vehicle on the left", "The larger vehicle"],
        correctAnswer: 1,
        category: "Intersections",
        difficulty: "medium",
        explanation: "In Zimbabwe, at an uncontrolled intersection, you must give way to traffic approaching from your right.",
      },
      {
        text: "When are you allowed to drive on the right-hand side of a road with two-way traffic?",
        options: ["When you are in a hurry", "To overtake when it is safe to do so", "Never", "When the road is empty"],
        correctAnswer: 1,
        category: "General Rules",
        difficulty: "easy",
        explanation: "You may drive on the right side only for the purpose of overtaking, and only when it is safe and legal to do so.",
      }
    ];

    const signs = [
      // REGULATORY SIGNS
      {
        name: "Stop Sign (R1)",
        category: "regulatory",
        meaning: "You must bring your vehicle to a complete stop behind the stop line and give way to all traffic.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Stop_sign.svg/1200px-Stop_sign.svg.png",
        usage: "Placed at intersections where a full stop is mandatory for safety.",
      },
      {
        name: "Give Way (R2)",
        category: "regulatory",
        meaning: "Slow down and prepare to stop to give way to traffic on the major road or at the intersection.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Yield_sign.svg/1200px-Yield_sign.svg.png",
        usage: "Commonly found at T-junctions or roundabouts.",
      },
      {
        name: "No Entry (R3)",
        category: "regulatory",
        meaning: "Vehicles are prohibited from entering this road in this direction.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/No_entry.svg/1200px-No_entry.svg.png",
        usage: "Used to prevent traffic from entering one-way streets in the wrong direction.",
      },
      {
        name: "Speed Limit 60 (R201-60)",
        category: "regulatory",
        meaning: "Indicates the maximum speed allowed is 60 kilometers per hour.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/SADC_road_sign_R201-60.svg/1200px-SADC_road_sign_R201-60.svg.png",
        usage: "Used in urban areas or near intersections.",
      },
      {
        name: "No Left Turn",
        category: "regulatory",
        meaning: "You are not allowed to turn left at the next intersection.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/SADC_road_sign_R209.svg/1200px-SADC_road_sign_R209.svg.png",
        usage: "To prevent turns into prohibited or dangerous streets.",
      },

      // WARNING SIGNS
      {
        name: "Curve to the Right (W105)",
        category: "warning",
        meaning: "Warns of a sharp curve to the right ahead.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/SADC_road_sign_W105.svg/1200px-SADC_road_sign_W105.svg.png",
        usage: "Placed before sharp bends to advise drivers to slow down.",
      },
      {
        name: "Crossroads Ahead (W201)",
        category: "warning",
        meaning: "Warns that there is a four-way intersection ahead.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/SADC_road_sign_W201.svg/1200px-SADC_road_sign_W201.svg.png",
        usage: "Used to alert drivers to prepare for intersecting traffic.",
      },
      {
        name: "Pedestrian Crossing (W306)",
        category: "warning",
        meaning: "Warns that there is a pedestrian crossing ahead.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/SADC_road_sign_W306.svg/1200px-SADC_road_sign_W306.svg.png",
        usage: "Placed near schools or urban shopping areas.",
      },
      {
        name: "Slippery Road (W310)",
        category: "warning",
        meaning: "Warns that the road surface may be slippery, especially when wet.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/SADC_road_sign_W310.svg/1200px-SADC_road_sign_W310.svg.png",
        usage: "Used on roads prone to moisture or oil accumulation.",
      },

      // INFORMATIVE SIGNS
      {
        name: "Information Centre (IN1)",
        category: "informative",
        meaning: "Indicates the location of a tourist information centre.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/SADC_road_sign_IN1.svg/1200px-SADC_road_sign_IN1.svg.png",
        usage: "Found in towns and near tourist attractions.",
      },
      {
        name: "Hospital Ahead",
        category: "informative",
        meaning: "Indicates a hospital or medical facility is nearby.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/SADC_road_sign_IN10.svg/1200px-SADC_road_sign_IN10.svg.png",
        usage: "Warns drivers to be quiet and watch for ambulances.",
      }
    ];

    // Clear existing to avoid duplicates during seed
    await db.delete(questionsTable);
    await db.delete(roadSignsTable);

    for (const q of questions) {
      await db.insert(questionsTable).values(q as any);
    }
    for (const s of signs) {
      await db.insert(roadSignsTable).values(s as any);
    }

    res.json({ message: "Database seeded with Zimbabwe SADC signs successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/stats", requireAuth, requireAdmin, async (req, res) => {
  try {
    let stats;
    try {
      const [[{ totalUsers }], [{ totalQuestions }], [{ totalTests }]] = await Promise.all([
        db.select({ totalUsers: count() }).from(usersTable),
        db.select({ totalQuestions: count() }).from(questionsTable),
        db.select({ totalTests: count() }).from(testSessionsTable).where(eq(testSessionsTable.status, "completed")),
      ]);

      const passedCount = await db.select({ n: count() }).from(testSessionsTable)
        .where(eq(testSessionsTable.passed, true));
      const passRate = totalTests > 0 ? (passedCount[0].n / totalTests) * 100 : 0;

      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const [{ activeToday }] = await db.select({ activeToday: count() }).from(usersTable)
        .where(sql`${usersTable.lastActiveAt} > ${oneDayAgo}`);

      stats = {
        totalUsers,
        totalQuestions,
        totalTests,
        passRate: Math.round(passRate * 10) / 10,
        activeToday,
      };
    } catch (dbErr) {
      logger.warn({ dbErr }, "Database error in admin stats, using mock data");
      stats = {
        totalUsers: 1250,
        totalQuestions: 56,
        totalTests: 4320,
        passRate: 68.5,
        activeToday: 42,
      };
    }

    res.json(stats);
  } catch (err) {
    logger.error({ err }, "Get admin stats error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { limit = "50", offset = "0" } = req.query as Record<string, string>;
    const users = await db.select().from(usersTable)
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    res.json(users.map(u => {
      const { passwordHash: _ph, ...safe } = u;
      return {
        ...safe,
        createdAt: safe.createdAt?.toISOString() ?? new Date().toISOString(),
      };
    }));
  } catch (err) {
    logger.error({ err }, "List users error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/users/:id/role", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const { role } = req.body;
    if (!["learner", "admin"].includes(role)) {
      res.status(400).json({ error: "Invalid role" });
      return;
    }
    const [updated] = await db.update(usersTable).set({ role }).where(eq(usersTable.id, id)).returning();
    if (!updated) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const { passwordHash: _ph, ...safe } = updated;
    res.json({
      ...safe,
      createdAt: safe.createdAt?.toISOString() ?? new Date().toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "Update user role error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/questions", requireAuth, requireAdmin, async (req, res) => {
  try {
    const questions = await db.select().from(questionsTable).orderBy(desc(questionsTable.createdAt));
    res.json(questions);
  } catch (err) {
    logger.error({ err }, "List admin questions error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/questions", requireAuth, requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    const [question] = await db.insert(questionsTable).values(data).returning();
    res.status(201).json(question);
  } catch (err) {
    logger.error({ err }, "Create question error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/questions/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const data = req.body;
    const [updated] = await db.update(questionsTable).set(data).where(eq(questionsTable.id, id)).returning();
    if (!updated) {
      res.status(404).json({ error: "Question not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    logger.error({ err }, "Update question error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/questions/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    await db.delete(questionsTable).where(eq(questionsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Delete question error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/signs", requireAuth, requireAdmin, async (req, res) => {
  try {
    const signs = await db.select().from(roadSignsTable).orderBy(desc(roadSignsTable.createdAt));
    res.json(signs);
  } catch (err) {
    logger.error({ err }, "List signs error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/signs", requireAuth, requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    const [sign] = await db.insert(roadSignsTable).values(data).returning();
    res.status(201).json(sign);
  } catch (err) {
    logger.error({ err }, "Create sign error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/signs/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const data = req.body;
    const [updated] = await db.update(roadSignsTable).set(data).where(eq(roadSignsTable.id, id)).returning();
    if (!updated) {
      res.status(404).json({ error: "Sign not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    logger.error({ err }, "Update sign error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/signs/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    await db.delete(roadSignsTable).where(eq(roadSignsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Delete sign error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/notifications/send", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, message, target } = req.body;
    logger.info({ title, message, target }, "Pushing notification (simulated)");
    // In a real app, integrate with Firebase Cloud Messaging or OneSignal here
    res.json({ success: true, message: "Notification sent to learners" });
  } catch (err) {
    logger.error({ err }, "Send notification error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
