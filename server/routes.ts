import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertActivitySchema, insertAchievementSchema, insertMilestoneSchema } from "@shared/schema";
import { z } from "zod";
import { processVoiceCommand, getAllVoiceCommands, createVoiceCommand } from "./controllers/voiceCommandController";
import { initializeTileServer } from "./mapTileServer";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes with /api prefix
  const apiRouter = express.Router();
  
  // User routes
  apiRouter.post("/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid user data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create user" });
      }
    }
  });
  
  apiRouter.get("/users/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  });
  
  apiRouter.patch("/users/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    try {
      const user = await storage.updateUser(id, req.body);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  // Activity routes
  apiRouter.post("/activities", async (req, res) => {
    try {
      const activityData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(activityData);
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid activity data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create activity" });
      }
    }
  });
  
  apiRouter.get("/users/:userId/activities", async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const activities = await storage.getActivitiesByUserId(userId);
    res.json(activities);
  });
  
  // Achievement routes
  apiRouter.post("/achievements", async (req, res) => {
    try {
      const achievementData = insertAchievementSchema.parse(req.body);
      const achievement = await storage.createAchievement(achievementData);
      res.status(201).json(achievement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid achievement data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create achievement" });
      }
    }
  });
  
  apiRouter.get("/users/:userId/achievements", async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const achievements = await storage.getAchievementsByUserId(userId);
    res.json(achievements);
  });
  
  // Milestone routes
  apiRouter.post("/milestones", async (req, res) => {
    try {
      const milestoneData = insertMilestoneSchema.parse(req.body);
      const milestone = await storage.createMilestone(milestoneData);
      res.status(201).json(milestone);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid milestone data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create milestone" });
      }
    }
  });
  
  apiRouter.get("/users/:userId/milestones", async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const milestones = await storage.getMilestonesByUserId(userId);
    res.json(milestones);
  });
  
  apiRouter.patch("/milestones/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid milestone ID" });
    }
    
    try {
      const milestone = await storage.updateMilestone(id, req.body);
      if (!milestone) {
        return res.status(404).json({ message: "Milestone not found" });
      }
      
      res.json(milestone);
    } catch (error) {
      res.status(500).json({ message: "Failed to update milestone" });
    }
  });
  
  // Voice command routes
  apiRouter.get("/voice-commands", getAllVoiceCommands);
  
  // Advanced voice command processing with NLP
  apiRouter.post("/voice-commands/process", processVoiceCommand);
  
  // Create new voice commands
  apiRouter.post("/voice-commands", createVoiceCommand);
  
  // Register the API router
  app.use("/api", apiRouter);

  // Initialize and register the map tile server
  try {
    // Use path.resolve with import.meta.url to get the correct file path in ES modules
    const currentFilePath = new URL(import.meta.url).pathname;
    const projectRoot = path.resolve(path.dirname(currentFilePath), '..');
    const tilesPath = path.join(projectRoot, 'tiles/world.mbtiles');
    
    const tileRouter = await initializeTileServer(tilesPath);
    app.use('/map', tileRouter);
    console.log('Map tile server initialized successfully');
  } catch (error) {
    console.error('Failed to initialize map tile server:', error);
  }

  const httpServer = createServer(app);

  return httpServer;
}
