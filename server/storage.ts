import { db } from "./db";
import { insertScheduleSchema, schedules, type Schedule, type InsertSchedule } from "@shared/schema";

export interface IStorage {
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
}

export class DatabaseStorage implements IStorage {
  async createSchedule(insertSchedule: InsertSchedule): Promise<Schedule> {
    const [schedule] = await db
      .insert(schedules)
      .values(insertSchedule)
      .returning();
    return schedule;
  }
}

export const storage = new DatabaseStorage();
