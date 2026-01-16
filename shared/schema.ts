import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  startTime: text("start_time").notNull(), // Format: "HH:mm"
  generatedAt: text("generated_at").notNull(),
});

export const insertScheduleSchema = createInsertSchema(schedules).omit({ id: true });

export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
