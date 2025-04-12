import { Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { nlpService } from "../services/nlpService";

/**
 * API for handling voice commands with natural language processing
 * Receives voice command text and returns the appropriate action and parameters
 */

// Define schema for voice command processing request
const processVoiceCommandSchema = z.object({
  text: z.string().min(1).max(1000),
  language: z.string().default("en-US"),
  userId: z.number().optional(),
});

export async function processVoiceCommand(req: Request, res: Response) {
  try {
    // Validate request body
    const result = processVoiceCommandSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid request format", 
        details: result.error.format() 
      });
    }
    
    const { text, language, userId } = result.data;
    
    // Get available voice commands
    const commands = await storage.getVoiceCommands(language);
    
    // Set available commands for NLP service
    nlpService.setCommands(commands);
    
    // Process voice command with natural language processing
    const matchResult = await nlpService.processInput(text, language);
    
    if (!matchResult) {
      return res.status(200).json({
        success: false,
        error: "No matching command found",
        suggestions: commands.slice(0, 3).map(cmd => cmd.command) // Provide top 3 available commands as suggestions
      });
    }
    
    // Log the command usage (could be stored in database in the future)
    console.log(`User ${userId || 'anonymous'} used voice command: ${matchResult.command.command}`);
    
    // Return the matched command data
    return res.status(200).json({
      success: true,
      action: matchResult.command.action,
      confidence: matchResult.confidence,
      command: matchResult.command.command,
      params: matchResult.params || {},
      icon: matchResult.command.icon
    });
  } catch (error) {
    console.error("Error processing voice command:", error);
    return res.status(500).json({
      success: false,
      error: "Server error processing voice command"
    });
  }
}

// Get all available voice commands for a language
export async function getAllVoiceCommands(req: Request, res: Response) {
  try {
    const language = req.query.language as string || "en-US";
    
    const commands = await storage.getVoiceCommands(language);
    
    return res.status(200).json({
      success: true,
      commands
    });
  } catch (error) {
    console.error("Error fetching voice commands:", error);
    return res.status(500).json({
      success: false,
      error: "Server error fetching voice commands"
    });
  }
}

// Create a new voice command
export async function createVoiceCommand(req: Request, res: Response) {
  try {
    const { command, icon, action, language } = req.body;
    
    if (!command || !icon || !action) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: command, icon, or action"
      });
    }
    
    const newCommand = await storage.createVoiceCommand({
      command,
      icon,
      action,
      language: language || "en-US"
    });
    
    return res.status(201).json({
      success: true,
      command: newCommand
    });
  } catch (error) {
    console.error("Error creating voice command:", error);
    return res.status(500).json({
      success: false,
      error: "Server error creating voice command"
    });
  }
}