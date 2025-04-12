import { pgTable, text, serial, integer, doublePrecision, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address"),
  language: text("language").default("en-US"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  walletAddress: true,
  language: true,
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  distanceKm: doublePrecision("distance_km").notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
  startedAt: timestamp("started_at").notNull(),
  endedAt: timestamp("ended_at").notNull(),
  tokensEarned: doublePrecision("tokens_earned").notNull(),
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  userId: true,
  distanceKm: true,
  durationSeconds: true,
  startedAt: true,
  endedAt: true,
  tokensEarned: true,
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  reward: doublePrecision("reward").notNull(),
  achievedAt: timestamp("achieved_at").notNull(),
  icon: text("icon").notNull(),
});

export const insertAchievementSchema = createInsertSchema(achievements).pick({
  userId: true,
  title: true,
  description: true,
  reward: true,
  achievedAt: true,
  icon: true,
});

export const milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requiredProgress: integer("required_progress").notNull(),
  currentProgress: integer("current_progress").notNull(),
  reward: doublePrecision("reward").notNull(),
  icon: text("icon").notNull(),
  completed: boolean("completed").default(false),
});

export const insertMilestoneSchema = createInsertSchema(milestones).pick({
  userId: true,
  title: true,
  description: true,
  requiredProgress: true,
  currentProgress: true,
  reward: true,
  icon: true,
  completed: true,
});

export const voiceCommands = pgTable("voice_commands", {
  id: serial("id").primaryKey(),
  command: text("command").notNull(),
  icon: text("icon").notNull(),
  action: text("action").notNull(),
  language: text("language").default("en-US"),
});

export const insertVoiceCommandSchema = createInsertSchema(voiceCommands).pick({
  command: true,
  icon: true,
  action: true,
  language: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;

export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;
export type Milestone = typeof milestones.$inferSelect;

export type InsertVoiceCommand = z.infer<typeof insertVoiceCommandSchema>;
export type VoiceCommand = typeof voiceCommands.$inferSelect;
