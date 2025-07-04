import { 
  users, type User, type InsertUser,
  activities, type Activity, type InsertActivity,
  achievements, type Achievement, type InsertAchievement,
  milestones, type Milestone, type InsertMilestone,
  voiceCommands, type VoiceCommand, type InsertVoiceCommand
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<Omit<User, "id">>): Promise<User | undefined>;
  
  // Activity methods
  createActivity(activity: InsertActivity): Promise<Activity>;
  getActivitiesByUserId(userId: number): Promise<Activity[]>;
  
  // Achievement methods
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  getAchievementsByUserId(userId: number): Promise<Achievement[]>;
  
  // Milestone methods
  createMilestone(milestone: InsertMilestone): Promise<Milestone>;
  getMilestonesByUserId(userId: number): Promise<Milestone[]>;
  updateMilestone(id: number, data: Partial<Omit<Milestone, "id">>): Promise<Milestone | undefined>;
  
  // Voice command methods
  getVoiceCommands(language?: string): Promise<VoiceCommand[]>;
  createVoiceCommand(command: InsertVoiceCommand): Promise<VoiceCommand>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private activities: Map<number, Activity>;
  private achievements: Map<number, Achievement>;
  private milestones: Map<number, Milestone>;
  private voiceCommands: Map<number, VoiceCommand>;
  
  private userId: number;
  private activityId: number;
  private achievementId: number;
  private milestoneId: number;
  private voiceCommandId: number;

  constructor() {
    this.users = new Map();
    this.activities = new Map();
    this.achievements = new Map();
    this.milestones = new Map();
    this.voiceCommands = new Map();
    
    this.userId = 1;
    this.activityId = 1;
    this.achievementId = 1;
    this.milestoneId = 1;
    this.voiceCommandId = 1;
    
    // Seed voice commands for different languages
    this.seedVoiceCommands();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, data: Partial<Omit<User, "id">>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Activity methods
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityId++;
    const activity: Activity = { ...insertActivity, id };
    this.activities.set(id, activity);
    return activity;
  }
  
  async getActivitiesByUserId(userId: number): Promise<Activity[]> {
    return Array.from(this.activities.values()).filter(
      (activity) => activity.userId === userId,
    );
  }
  
  // Achievement methods
  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const id = this.achievementId++;
    const achievement: Achievement = { ...insertAchievement, id };
    this.achievements.set(id, achievement);
    return achievement;
  }
  
  async getAchievementsByUserId(userId: number): Promise<Achievement[]> {
    return Array.from(this.achievements.values()).filter(
      (achievement) => achievement.userId === userId,
    );
  }
  
  // Milestone methods
  async createMilestone(insertMilestone: InsertMilestone): Promise<Milestone> {
    const id = this.milestoneId++;
    const milestone: Milestone = { ...insertMilestone, id };
    this.milestones.set(id, milestone);
    return milestone;
  }
  
  async getMilestonesByUserId(userId: number): Promise<Milestone[]> {
    return Array.from(this.milestones.values()).filter(
      (milestone) => milestone.userId === userId,
    );
  }
  
  async updateMilestone(id: number, data: Partial<Omit<Milestone, "id">>): Promise<Milestone | undefined> {
    const milestone = this.milestones.get(id);
    if (!milestone) return undefined;
    
    const updatedMilestone = { ...milestone, ...data };
    this.milestones.set(id, updatedMilestone);
    return updatedMilestone;
  }
  
  // Voice command methods
  async getVoiceCommands(language: string = "en-US"): Promise<VoiceCommand[]> {
    return Array.from(this.voiceCommands.values()).filter(
      (command) => command.language === language,
    );
  }
  
  async createVoiceCommand(insertCommand: InsertVoiceCommand): Promise<VoiceCommand> {
    const id = this.voiceCommandId++;
    const command: VoiceCommand = { ...insertCommand, id };
    this.voiceCommands.set(id, command);
    return command;
  }
  
  private seedVoiceCommands() {
    const commonCommands = [
      { 
        command: "Navigate to downtown", 
        icon: "navigation", 
        action: "navigation" 
      },
      { 
        command: "Start tracking my run", 
        icon: "track_changes", 
        action: "tracking" 
      },
      { 
        command: "Check my MOVE balance", 
        icon: "savings", 
        action: "balance" 
      }
    ];
    
    // English commands
    commonCommands.forEach(cmd => {
      this.createVoiceCommand({
        command: cmd.command,
        icon: cmd.icon,
        action: cmd.action,
        language: "en-US"
      });
    });
    
    // Spanish commands
    [
      { command: "Navegar al centro", icon: "navigation", action: "navigation" },
      { command: "Comenzar a rastrear mi carrera", icon: "track_changes", action: "tracking" },
      { command: "Verificar mi saldo de MOVE", icon: "savings", action: "balance" }
    ].forEach(cmd => {
      this.createVoiceCommand({
        ...cmd,
        language: "es-ES"
      });
    });
    
    // French commands
    [
      { command: "Naviguer vers le centre-ville", icon: "navigation", action: "navigation" },
      { command: "Commencer à suivre ma course", icon: "track_changes", action: "tracking" },
      { command: "Vérifier mon solde MOVE", icon: "savings", action: "balance" }
    ].forEach(cmd => {
      this.createVoiceCommand({
        ...cmd,
        language: "fr-FR"
      });
    });
    
    // Japanese commands
    [
      { command: "ダウンタウンへナビゲート", icon: "navigation", action: "navigation" },
      { command: "ランニングの追跡を開始", icon: "track_changes", action: "tracking" },
      { command: "MOVEの残高を確認", icon: "savings", action: "balance" }
    ].forEach(cmd => {
      this.createVoiceCommand({
        ...cmd,
        language: "ja-JP"
      });
    });
  }
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUser(id: number, data: Partial<Omit<User, "id">>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }
  
  // Activity methods
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values(insertActivity)
      .returning();
    return activity;
  }
  
  async getActivitiesByUserId(userId: number): Promise<Activity[]> {
    return db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId));
  }
  
  // Achievement methods
  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const [achievement] = await db
      .insert(achievements)
      .values(insertAchievement)
      .returning();
    return achievement;
  }
  
  async getAchievementsByUserId(userId: number): Promise<Achievement[]> {
    return db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId));
  }
  
  // Milestone methods
  async createMilestone(insertMilestone: InsertMilestone): Promise<Milestone> {
    const [milestone] = await db
      .insert(milestones)
      .values(insertMilestone)
      .returning();
    return milestone;
  }
  
  async getMilestonesByUserId(userId: number): Promise<Milestone[]> {
    return db
      .select()
      .from(milestones)
      .where(eq(milestones.userId, userId));
  }
  
  async updateMilestone(id: number, data: Partial<Omit<Milestone, "id">>): Promise<Milestone | undefined> {
    const [updatedMilestone] = await db
      .update(milestones)
      .set(data)
      .where(eq(milestones.id, id))
      .returning();
    return updatedMilestone || undefined;
  }
  
  // Voice command methods
  async getVoiceCommands(language: string = "en-US"): Promise<VoiceCommand[]> {
    return db
      .select()
      .from(voiceCommands)
      .where(eq(voiceCommands.language, language));
  }
  
  async createVoiceCommand(insertCommand: InsertVoiceCommand): Promise<VoiceCommand> {
    const [command] = await db
      .insert(voiceCommands)
      .values(insertCommand)
      .returning();
    return command;
  }
  
  // Seed voice commands
  async seedVoiceCommands() {
    // Check if commands already exist
    const existingCommands = await db.select().from(voiceCommands).limit(1);
    if (existingCommands.length > 0) {
      return; // Voice commands already exist
    }
    
    const commonCommands = [
      { 
        command: "Navigate to downtown", 
        icon: "navigation", 
        action: "navigation" 
      },
      { 
        command: "Start tracking my run", 
        icon: "track_changes", 
        action: "tracking" 
      },
      { 
        command: "Check my MOVE balance", 
        icon: "savings", 
        action: "balance" 
      }
    ];
    
    // English commands
    await Promise.all(commonCommands.map(cmd => 
      this.createVoiceCommand({
        command: cmd.command,
        icon: cmd.icon,
        action: cmd.action,
        language: "en-US"
      })
    ));
    
    // Spanish commands
    await Promise.all([
      { command: "Navegar al centro", icon: "navigation", action: "navigation" },
      { command: "Comenzar a rastrear mi carrera", icon: "track_changes", action: "tracking" },
      { command: "Verificar mi saldo de MOVE", icon: "savings", action: "balance" }
    ].map(cmd => 
      this.createVoiceCommand({
        ...cmd,
        language: "es-ES"
      })
    ));
    
    // French commands
    await Promise.all([
      { command: "Naviguer vers le centre-ville", icon: "navigation", action: "navigation" },
      { command: "Commencer à suivre ma course", icon: "track_changes", action: "tracking" },
      { command: "Vérifier mon solde MOVE", icon: "savings", action: "balance" }
    ].map(cmd => 
      this.createVoiceCommand({
        ...cmd,
        language: "fr-FR"
      })
    ));
    
    // Japanese commands
    await Promise.all([
      { command: "ダウンタウンへナビゲート", icon: "navigation", action: "navigation" },
      { command: "ランニングの追跡を開始", icon: "track_changes", action: "tracking" },
      { command: "MOVEの残高を確認", icon: "savings", action: "balance" }
    ].map(cmd => 
      this.createVoiceCommand({
        ...cmd,
        language: "ja-JP"
      })
    ));
  }
}

// Create an instance of DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();

// Seed voice commands in the database when the server starts
storage.seedVoiceCommands().catch(err => {
  console.error("Error seeding voice commands:", err);
});
