import { db } from "./db";
import { insertScheduleSchema, schedules, messages, schoolSettings, type Schedule, type InsertSchedule, type Message, type InsertMessage, type SchoolSettings } from "@shared/schema";
import { desc } from "drizzle-orm";

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
        updatedAt: new Date().toISOString()
      };
    }
  }

  async updateSettings(day: number): Promise<SchoolSettings> {
    const existing = await this.getSettings();
    const [updated] = await db.insert(schoolSettings).values({
      currentDay: day,
      updatedAt: new Date().toISOString()
    }).returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
