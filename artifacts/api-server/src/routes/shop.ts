import { Router } from "express";
import { db, usersTable } from "@roadify/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router = Router();

const SHOP_ITEMS: Record<string, { price: number; name: string }> = {
  "streak-freeze": { price: 500, name: "Streak Freeze" },
  "toyota-supra": { price: 2500, name: "Supra MK4 Legend" },
  "border-neon": { price: 1500, name: "Cyber-Pulse Border" },
  "bmw-m4": { price: 4500, name: "M4 Competition" },
  "title-legend": { price: 8000, name: "Elite Roadmaster" },
  "porsche-911": { price: 15000, name: "GT3 RS Heritage" },
};

router.post("/purchase", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: { userId: number } }).user;
    const { itemId } = req.body;

    if (!itemId || !SHOP_ITEMS[itemId]) {
      res.status(400).json({ error: "Invalid item ID" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const item = SHOP_ITEMS[itemId];
    if ((user.coins ?? 0) < item.price) {
      res.status(400).json({ error: `Insufficient coins. You need ${item.price} coins.` });
      return;
    }

    let unlocked: string[] = [];
    try {
      unlocked = JSON.parse(user.unlockedItems || "[]");
      if (!Array.isArray(unlocked)) unlocked = [];
    } catch (e) {
      unlocked = [];
    }

    if (unlocked.includes(itemId)) {
      res.status(400).json({ error: "Item already unlocked" });
      return;
    }

    unlocked.push(itemId);

    await db.update(usersTable)
      .set({
        coins: (user.coins ?? 0) - item.price,
        unlockedItems: JSON.stringify(unlocked),
      })
      .where(eq(usersTable.id, userId));

    res.json({
      success: true,
      message: `Unlocked ${item.name}`,
      remainingCoins: (user.coins ?? 0) - item.price,
      unlockedItems: unlocked
    });
  } catch (err) {
    logger.error({ err }, "Shop purchase error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
