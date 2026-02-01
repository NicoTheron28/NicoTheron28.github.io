import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  startTime: text("start_time").notNull(), // Format: "HH:mm"
  generatedAt: text("generated_at").notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const schoolSettings = pgTable("school_settings", {
  id: serial("id").primaryKey(),
  currentDay: integer("current_day").notNull().default(1), // 1-6
  startTime: text("start_time").notNull().default("07:30"),
  endTime: text("end_time").notNull().default("13:50"),
  startPeriod: integer("start_period").notNull().default(1),
  endPeriod: integer("end_period").notNull().default(8),
  updatedAt: text("updated_at").notNull(),
});

export const insertScheduleSchema = createInsertSchema(schedules).omit({ id: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true });
export const insertSettingsSchema = createInsertSchema(schoolSettings).omit({ id: true });

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;

export type SchoolSettings = typeof schoolSettings.$inferSelect;
export type InsertSchoolSettings = z.infer<typeof insertSettingsSchema>;
