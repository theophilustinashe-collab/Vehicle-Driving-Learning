import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const roadSignsTable = pgTable("road_signs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  meaning: text("meaning").notNull(),
  imageUrl: text("image_url").notNull(),
  usage: text("usage"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRoadSignSchema = createInsertSchema(roadSignsTable).omit({ id: true, createdAt: true });
export type InsertRoadSign = z.infer<typeof insertRoadSignSchema>;
export type RoadSign = typeof roadSignsTable.$inferSelect;
