import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

// Types for voice commands
interface VoiceCommand {
  id: number;
  command: string;
  icon: string;
  action: string;
  language: string;
}

interface VoiceCommandResult {
  success: boolean;
  action: string;
  confidence: number;
  command: string;
  params: Record<string, string | number>;
  icon: string;
}

interface VoiceCommandError {
  success: false;
  error: string;
  suggestions?: string[];
}

/**
 * Hook for working with voice commands and NLP processing
 * 
 * Provides functionality to:
 * - Get available voice commands
 * - Process voice input with NLP
 * - Create new voice commands
 */
export function useVoiceCommands(language = 'en-US') {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const { toast } = useToast();

  // Fetch available commands
  const { data: commands = [], isLoading: isLoadingCommands, error: commandsError } = useQuery({
    queryKey: ['/api/voice-commands', language],
    queryFn: async () => {
      const response = await fetch(`/api/voice-commands?language=${language}`);
      if (!response.ok) {
        throw new Error('Failed to fetch voice commands');
      }
      const data = await response.json();
      return data.commands || [];
    }
  });

  // Process voice command with NLP
  const { mutate: processCommand, isLoading: isProcessing } = useMutation({
    mutationFn: async (text: string): Promise<VoiceCommandResult | VoiceCommandError> => {
      const response = await fetch('/api/voice-commands/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language })
      });
      
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'Command recognized',
          description: `"${data.command}" with ${Math.round(data.confidence * 100)}% confidence`,
        });
      } else {
        toast({
          title: 'Command not recognized',
          description: data.error,
          variant: 'destructive'
        });
      }
    },
    onError: () => {
      toast({
        title: 'Error processing command',
        description: 'Failed to process voice command',
        variant: 'destructive'
      });
    }
  });

  // Create a new voice command
  const { mutate: createCommand } = useMutation({
    mutationFn: async (command: { command: string; icon: string; action: string; language?: string }) => {
      const response = await fetch('/api/voice-commands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create voice command');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Command created',
        description: 'New voice command was created successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error creating command',
        description: 'Failed to create new voice command',
        variant: 'destructive'
      });
    }
  });

  // Start voice recognition (placeholder - would use platform-specific implementation)
  const startListening = useCallback(() => {
    setIsListening(true);
    
    // This is a placeholder for actual voice recognition
    // In a real implementation, this would use:
    // - Web: Web Speech API
    // - React Native: react-native-voice or expo-speech
    
    toast({
      title: 'Listening...',
      description: 'Say a command',
    });
    
    // Simulate recognition after 2 seconds for development
    setTimeout(() => {
      // Would normally get this from speech recognition API
      const simulatedTranscript = "Start tracking my run";
      setTranscript(simulatedTranscript);
      processCommand(simulatedTranscript);
      setIsListening(false);
    }, 2000);
  }, [processCommand, toast]);

  // Stop voice recognition
  const stopListening = useCallback(() => {
    setIsListening(false);
    // In a real implementation, this would stop the speech recognition
  }, []);

  // Execute an action based on recognized command
  const executeAction = useCallback((action: string, params: Record<string, string | number> = {}) => {
    console.log(`Executing action: ${action} with params:`, params);
    
    // This would be implemented based on your application's needs
    // For example:
    switch (action) {
      case 'navigation':
        // Navigate to a location
        const location = params.location || 'default';
        toast({
          title: 'Navigating',
          description: `Navigating to ${location}`,
        });
        break;
        
      case 'tracking':
        // Start tracking activity
        toast({
          title: 'Tracking started',
          description: 'Started tracking your activity',
        });
        break;
        
      case 'balance':
        // Check balance
        toast({
          title: 'Checking balance',
          description: 'Fetching your MOVE token balance',
        });
        break;
        
      default:
        toast({
          title: 'Unknown action',
          description: `Don't know how to execute ${action}`,
          variant: 'destructive'
        });
    }
  }, [toast]);

  // Process transcript when it changes
  useEffect(() => {
    if (transcript && !isListening) {
      processCommand(transcript);
    }
  }, [transcript, isListening, processCommand]);

  return {
    commands,
    isLoadingCommands,
    commandsError,
    isListening,
    isProcessing,
    transcript,
    startListening,
    stopListening,
    processCommand,
    createCommand,
    executeAction
  };
}