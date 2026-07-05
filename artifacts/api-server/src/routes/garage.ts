import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router = Router();

const SHOP_ITEMS = [
  { id: "border-gold", name: "Gold Master Border", price: 1000, type: "border" },
  { id: "border-neon", name: "Neon Night Border", price: 2500, type: "border" },
  { id: "bg-aston", name: "Vantage Performance BG", price: 5000, type: "background" },
  { id: "badge-legend", name: "Living Legend Title", price: 10000, type: "title" },
];

router.get("/items", requireAuth, (req, res) => {
  res.json(SHOP_ITEMS);
});

router.post("/buy", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as any).user;
    const { itemId } = req.body;

    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return res.status(404).json({ error: "Item not found" });

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.coins < item.price) {
      return res.status(400).json({ error: "Insufficient VID Coins" });
    }

    const unlocked = JSON.parse(user.unlockedItems || "[]");
    if (unlocked.includes(itemId)) {
      return res.status(400).json({ error: "Item already owned" });
    }

    unlocked.push(itemId);

    await db.update(usersTable).set({
      coins: user.coins - item.price,
      unlockedItems: JSON.stringify(unlocked)
    }).where(eq(usersTable.id, userId));

    res.json({ message: "Purchase successful", unlockedItems: unlocked, remainingCoins: user.coins - item.price });
  } catch (err) {
    logger.error({ err }, "Garage purchase error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
