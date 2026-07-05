import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router = Router();

router.post("/buy", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: { userId: number } }).user;
    const { itemId } = req.body;

    if (!itemId) {
      res.status(400).json({ error: "itemId is required" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const SHOP_ITEMS: Record<string, number> = {
      "border-gold": 1000,
      "border-neon": 2500,
      "bg-aston": 5000,
      "badge-legend": 10000,
    };

    const price = SHOP_ITEMS[itemId];
    if (!price) {
      res.status(400).json({ error: "Invalid item" });
      return;
    }

    if ((user.coins ?? 0) < price) {
      res.status(400).json({ error: "Insufficient coins" });
      return;
    }

    const unlocked = JSON.parse(user.unlockedItems || "[]");
    if (unlocked.includes(itemId)) {
      res.status(400).json({ error: "Item already owned" });
      return;
    }

    unlocked.push(itemId);

    await db.update(usersTable)
      .set({
        coins: (user.coins ?? 0) - price,
        unlockedItems: JSON.stringify(unlocked),
      })
      .where(eq(usersTable.id, userId));

    res.json({ success: true, message: "Purchase complete" });
  } catch (err) {
    logger.error({ err }, "Garage purchase error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
