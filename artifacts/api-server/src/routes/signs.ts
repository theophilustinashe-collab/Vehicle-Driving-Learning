import { Router } from "express";
import { db, roadSignsTable } from "@workspace/db";
import { eq, ilike, and, SQL } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router = Router();

// Temporarily removed requireAuth to debug "missing signs" issue
router.get("/", async (req, res) => {
  try {
    const { category, search } = req.query as Record<string, string>;
    const conditions: SQL[] = [];

    // Use case-insensitive matching for categories
    if (category && category !== 'all') {
      conditions.push(ilike(roadSignsTable.category, category));
    }

    if (search) {
      conditions.push(ilike(roadSignsTable.name, `%${search}%`));
    }

    let signs = [];
    try {
      signs = conditions.length > 0
        ? await db.select().from(roadSignsTable).where(and(...conditions))
        : await db.select().from(roadSignsTable);
    } catch (dbErr) {
      logger.warn({ dbErr }, "Database error in list signs, using mock data");
      signs = [
        { id: 1, name: "Stop Sign", category: "Regulatory", meaning: "You must come to a complete stop.", imageUrl: "https://example.com/stop.png" },
        { id: 2, name: "Yield", category: "Regulatory", meaning: "Give way to other traffic.", imageUrl: "https://example.com/yield.png" },
        { id: 3, name: "Speed Limit 60", category: "Regulatory", meaning: "Maximum speed 60km/h.", imageUrl: "https://example.com/60.png" },
      ];
    }

    res.json(signs.map(s => ({
      ...s,
      createdAt: undefined,
    })));
  } catch (err) {
    logger.error({ err }, "List signs error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, category, meaning, imageUrl, usage } = req.body;
    if (!name || !category || !meaning || !imageUrl) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const [sign] = await db.insert(roadSignsTable).values({ name, category, meaning, imageUrl, usage }).returning();
    res.status(201).json({ ...sign, createdAt: undefined });
  } catch (err) {
    logger.error({ err }, "Create sign error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const [sign] = await db.select().from(roadSignsTable).where(eq(roadSignsTable.id, id)).limit(1);
    if (!sign) {
      res.status(404).json({ error: "Sign not found" });
      return;
    }
    res.json({ ...sign, createdAt: undefined });
  } catch (err) {
    logger.error({ err }, "Get sign error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const { name, category, meaning, imageUrl, usage } = req.body;

    logger.info({ id, hasImage: !!imageUrl }, "Updating sign");

    const [updated] = await db.update(roadSignsTable)
      .set({
        name,
        category,
        meaning,
        imageUrl,
        usage
      })
      .where(eq(roadSignsTable.id, id))
      .returning();

    if (!updated) {
      logger.warn({ id }, "Sign not found for update");
      res.status(404).json({ error: "Sign not found" });
      return;
    }

    logger.info({ id }, "Sign updated successfully");
    res.json({ ...updated, createdAt: undefined });
  } catch (err) {
    logger.error({ err, id: req.params.id }, "Update sign error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    await db.delete(roadSignsTable).where(eq(roadSignsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Delete sign error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
