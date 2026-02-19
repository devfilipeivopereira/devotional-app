import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  uuid,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

// ─── Devotional Series ───────────────────────────────────────
export const devotionalSeries = pgTable("devotional_series", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  tags: text("tags").array().default(sql`'{}'::text[]`),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ─── Devotional Days ─────────────────────────────────────────
export const devotionalDays = pgTable("devotional_days", {
  id: uuid("id").primaryKey().defaultRandom(),
  seriesId: uuid("series_id")
    .notNull()
    .references(() => devotionalSeries.id, { onDelete: "cascade" }),
  dayNumber: integer("day_number").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ─── Devotional Blocks ───────────────────────────────────────
export const devotionalBlocks = pgTable("devotional_blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  dayId: uuid("day_id")
    .notNull()
    .references(() => devotionalDays.id, { onDelete: "cascade" }),
  blockType: text("block_type").notNull(), // quote, scripture, reflection, prayer, breathing, action, journal_prompt, image_meditation
  content: jsonb("content").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ─── Devotional Media ────────────────────────────────────────
export const devotionalMedia = pgTable("devotional_media", {
  id: uuid("id").primaryKey().defaultRandom(),
  blockId: uuid("block_id").references(() => devotionalBlocks.id, {
    onDelete: "cascade",
  }),
  mediaType: text("media_type").notNull(), // image, audio, video
  url: text("url").notNull(),
  altText: text("alt_text"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ─── User Progress ───────────────────────────────────────────
export const devotionalProgress = pgTable("devotional_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  dayId: uuid("day_id")
    .notNull()
    .references(() => devotionalDays.id, { onDelete: "cascade" }),
  lastBlockId: uuid("last_block_id").references(() => devotionalBlocks.id),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ─── User Journal ────────────────────────────────────────────
export const devotionalJournal = pgTable("devotional_journal", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  dayId: uuid("day_id")
    .notNull()
    .references(() => devotionalDays.id, { onDelete: "cascade" }),
  blockId: uuid("block_id").references(() => devotionalBlocks.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ─── Types ───────────────────────────────────────────────────
export type DevotionalSeries = typeof devotionalSeries.$inferSelect;
export type DevotionalDay = typeof devotionalDays.$inferSelect;
export type DevotionalBlock = typeof devotionalBlocks.$inferSelect;
export type DevotionalMedia = typeof devotionalMedia.$inferSelect;
export type DevotionalProgress = typeof devotionalProgress.$inferSelect;
export type DevotionalJournal = typeof devotionalJournal.$inferSelect;

export type BlockType =
  | "quote"
  | "scripture"
  | "reflection"
  | "prayer"
  | "breathing"
  | "action"
  | "journal_prompt"
  | "image_meditation";

export interface QuoteContent {
  text: string;
  author: string;
}

export interface ScriptureContent {
  book: string;
  chapter: string;
  verse_start: string;
  verse_end: string;
  text: string;
}

export interface ReflectionContent {
  text: string;
}

export interface PrayerContent {
  text: string;
}

export interface BreathingContent {
  duration_seconds: number;
  instructions: string;
}

export interface ActionContent {
  text: string;
  call_to_action: string;
  link?: string;
}

export interface JournalPromptContent {
  prompt: string;
}

export interface ImageMeditationContent {
  image_id: string;
  caption: string;
}
