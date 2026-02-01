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
  
  app.post(api.schedules.create.path, async (req, res) => {
    try {
      const input = api.schedules.create.input.parse(req.body);
      const schedule = await storage.createSchedule(input);
      res.status(201).json(schedule);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get("/api/message", async (_req, res) => {
    const message = await storage.getMessage();
    res.json(message || { content: "" });
  });

  app.post("/api/settings", async (req, res) => {
    const { day, adminKey } = req.body;
    const isAuthorized = adminKey === process.env.SESSION_SECRET || adminKey === "Chap@4472" || adminKey === process.env.PASSWORD;
    if (!isAuthorized) return res.status(401).json({ message: "Unauthorized" });
    try {
      const settings = await storage.updateSettings(day);
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
