import { db } from "./db";
import { insertScheduleSchema, schedules, messages, type Schedule, type InsertSchedule, type Message, type InsertMessage } from "@shared/schema";
import { desc } from "drizzle-orm";

export interface IStorage {
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  getMessage(): Promise<Message | undefined>;
  updateMessage(content: string): Promise<Message>;
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
}

export const storage = new DatabaseStorage();
