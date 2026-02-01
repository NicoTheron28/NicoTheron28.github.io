import { db } from "./db";
import { insertScheduleSchema, schedules, messages, schoolSettings, type Schedule, type InsertSchedule, type Message, type InsertMessage, type SchoolSettings } from "@shared/schema";
import { desc, eq } from "drizzle-orm";

export interface IStorage {
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  getMessage(): Promise<Message | undefined>;
  updateMessage(content: string): Promise<Message>;
  getSettings(): Promise<SchoolSettings>;
  updateSettings(day: number): Promise<SchoolSettings>;
}

export class DatabaseStorage implements IStorage {
  async createSchedule(insertSchedule: InsertSchedule): Promise<Schedule> {
    const [schedule] = await db
      .insert(schedules)
      .values(insertSchedule)
      .returning();
    return schedule;
  }

  async getMessage(): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).orderBy(desc(messages.updatedAt)).limit(1);
    return message;
  }

  async updateMessage(content: string): Promise<Message> {
    const [message] = await db.insert(messages).values({
      content,
      updatedAt: new Date().toISOString()
    }).returning();
    return message;
  }

  async getSettings(): Promise<SchoolSettings> {
    try {
      const [settings] = await db.select().from(schoolSettings).limit(1);
      if (!settings) {
        const [newSettings] = await db.insert(schoolSettings).values({
          currentDay: 1,
          startTime: "07:30",
          endTime: "13:50",
          startPeriod: 1,
          endPeriod: 8,
          updatedAt: new Date().toISOString()
        }).returning();
        return newSettings;
      }
      return settings;
    } catch (err) {
      console.error("Database settings fetch failed, using fallback:", err);
      return {
        id: 1,
        currentDay: 1,
        startTime: "07:30",
        endTime: "13:50",
        startPeriod: 1,
        endPeriod: 8,
        updatedAt: new Date().toISOString()
      };
    }
  }

  async updateSettings(day: number, startTime?: string, endTime?: string, startPeriod?: number, endPeriod?: number): Promise<SchoolSettings> {
    const updateData: any = {
      currentDay: day,
      updatedAt: new Date().toISOString()
    };
    if (startTime) updateData.startTime = startTime;
    if (endTime) updateData.endTime = endTime;
    if (startPeriod !== undefined) updateData.startPeriod = startPeriod;
    if (endPeriod !== undefined) updateData.endPeriod = endPeriod;

    const [updated] = await db.update(schoolSettings)
      .set(updateData)
      .where(eq(schoolSettings.id, 1))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
