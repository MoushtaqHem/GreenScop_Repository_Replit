import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const gardenTable = pgTable("garden", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  plantName: text("plant_name").notNull(),
  scientificName: text("scientific_name").notNull(),
  description: text("description").notNull(),
  benefits: text("benefits").notNull(),
  care: text("care").notNull(),
  nutrition: jsonb("nutrition").notNull(),
  imageBase64: text("image_base64"),
  savedAt: timestamp("saved_at").defaultNow().notNull(),
});

export const favoritesTable = pgTable("favorites", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  plantName: text("plant_name").notNull(),
  scientificName: text("scientific_name").notNull(),
  description: text("description").notNull(),
  benefits: text("benefits").notNull(),
  care: text("care").notNull(),
  nutrition: jsonb("nutrition").notNull(),
  imageBase64: text("image_base64"),
  savedAt: timestamp("saved_at").defaultNow().notNull(),
});

export const scansTable = pgTable("scans", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  plantName: text("plant_name").notNull(),
  scientificName: text("scientific_name").notNull(),
  imageBase64: text("image_base64"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGardenSchema = createInsertSchema(gardenTable).omit({ savedAt: true });
export const insertFavoritesSchema = createInsertSchema(favoritesTable).omit({ savedAt: true });
export const insertScansSchema = createInsertSchema(scansTable).omit({ createdAt: true });

export type InsertGarden = z.infer<typeof insertGardenSchema>;
export type Garden = typeof gardenTable.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoritesSchema>;
export type Favorite = typeof favoritesTable.$inferSelect;
export type InsertScan = z.infer<typeof insertScansSchema>;
export type Scan = typeof scansTable.$inferSelect;
