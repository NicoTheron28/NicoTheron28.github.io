import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Define routes using app.get(), app.post(), etc.
  
  app.post("/api/set-schedule", async (req, res) => {
    try {
      const scheduleDay = parseInt(req.query.schedule_day as string || req.body.schedule_day);
      const periods = (req.query.periods as string) || req.body.periods;
      
      if (isNaN(scheduleDay) || !periods) {
        return res.status(400).json({ message: "Missing schedule_day or periods" });
      }

      const schedule = await storage.createSchedule({ scheduleDay, periods });
      res.status(201).json(schedule);
    } catch (err) {
      console.error("Failed to set schedule:", err);
      res.status(500).json({ message: "Failed to set schedule" });
    }
  });

  app.get("/api/get-latest-schedule", async (_req, res) => {
    try {
      const schedule = await storage.getLatestSchedule();
      res.json(schedule || null);
    } catch (err) {
      console.error("Failed to get latest schedule:", err);
      res.status(500).json({ message: "Failed to get latest schedule" });
    }
  });

  app.get("/api/message", async (_req, res) => {
    const message = await storage.getMessage();
    res.json(message || { content: "" });
  });

  app.get("/api/settings", async (_req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (err) {
      console.error("Failed to get settings:", err);
      res.status(500).json({ message: "Failed to get settings" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    const { day, startTime, endTime, startPeriod, endPeriod, adminKey } = req.body;
    const isAuthorized = adminKey === process.env.SESSION_SECRET || adminKey === "Chap@4472" || adminKey === process.env.PASSWORD;
    if (!isAuthorized) return res.status(401).json({ message: "Unauthorized" });
    try {
      const settings = await storage.updateSettings(day, startTime, endTime, startPeriod, endPeriod);
      res.json(settings);
    } catch (err) {
      console.error("Failed to update settings:", err);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  app.post("/api/message", async (req, res) => {
    const { content, adminKey } = req.body;
    console.log("Admin attempt with key:", adminKey);
    console.log("Expected key (from env):", process.env.SESSION_SECRET);
    
    // Check if the provided key matches either the environment variable OR a fallback
    const isAuthorized = adminKey === process.env.SESSION_SECRET || adminKey === "Chap@4472" || adminKey === process.env.PASSWORD;
    
    if (!isAuthorized) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const message = await storage.updateMessage(content);
    res.json(message);
  });

  return httpServer;
}
