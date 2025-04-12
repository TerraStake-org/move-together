import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import useTts from '@/hooks/useTts';
import { apiRequest } from '@/lib/queryClient';
import { VoiceCommand } from '@shared/schema';

interface VoiceCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VoiceCommandModal({ isOpen, onClose }: VoiceCommandModalProps) {
  const { speak, stop, voices, selectedVoice, setVoicePreference } = useTts();
  const { toast } = useToast();
  
  const [listening, setListening] = useState(false);
  const [language, setLanguage] = useState<string>("en-US");
  const [recognizedText, setRecognizedText] = useState<string>("");
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const recognitionRef = useRef<any>(null);
  
  // Languages available
  const languages = [
    { code: "en-US", name: "English (US)" },
    { code: "es-ES", name: "Español" },
    { code: "fr-FR", name: "Français" },
    { code: "ja-JP", name: "日本語" },
    { code: "de-DE", name: "Deutsch" },
    { code: "zh-CN", name: "中文" }
  ];
  
  // Fetch voice commands for the selected language
  useEffect(() => {
    const fetchVoiceCommands = async () => {
      if (isOpen) {
        try {
          setIsLoading(true);
          const res = await apiRequest('GET', `/api/voice-commands?language=${language}`, undefined);
          const data = await res.json();
          setCommands(data);
        } catch (error) {
          toast({
            title: "Failed to load voice commands",
            description: "Could not retrieve the available commands.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchVoiceCommands();
  }, [isOpen, language, toast]);
  
  // Handle speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      // Initialize speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      // Configure recognition
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      // Set up event handlers
      recognitionRef.current.onresult = (event: any) => {
        const result = event.results[0][0].transcript;
        setRecognizedText(result);
        processCommand(result);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        setListening(false);
        toast({
          title: "Voice Recognition Error",
          description: `Error: ${event.error}`,
          variant: "destructive",
        });
      };
      
      recognitionRef.current.onend = () => {
        setListening(false);
      };
    }
    
    return () => {
      // Clean up
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [toast]);
  
  // Update recognition language when language changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, [language]);
  
  // Process voice command
  const processCommand = (text: string) => {
    // Find matching command
    const matchedCommand = commands.find(cmd => 
      text.toLowerCase().includes(cmd.command.toLowerCase())
    );
    
    if (matchedCommand) {
      toast({
        title: "Command Recognized",
        description: `Executing: ${matchedCommand.command}`,
      });
      
      // Provide voice feedback
      speak({ 
        text: `Executing command: ${matchedCommand.command}`, 
        language 
      });
      
      // In a real app, we would execute the command action here
      // For now, we'll just close the modal after a delay
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      // No matching command
      speak({ 
        text: "Sorry, I didn't recognize that command.", 
        language 
      });
      
      setRecognizedText("");
    }
  };
  
  // Start listening
  const handleStartListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Not Supported",
        description: "Voice recognition is not supported in this browser.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setListening(true);
      setRecognizedText("");
      recognitionRef.current.start();
      
      // Provide voice feedback
      speak({ 
        text: "Listening. Please say a command.", 
        language 
      });
    } catch (error) {
      setListening(false);
      toast({
        title: "Recognition Error",
        description: "An error occurred while starting voice recognition.",
        variant: "destructive",
      });
    }
  };
  
  // Stop listening
  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setListening(false);
    stop(); // Stop any ongoing speech
  };
  
  // Handle language change
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    
    // Update recognition language
    if (recognitionRef.current) {
      recognitionRef.current.lang = value;
    }
    
    // Find appropriate voice for this language
    const langVoices = voices.filter(voice => voice.language.startsWith(value.split('-')[0]));
    if (langVoices.length > 0 && langVoices[0].voiceURI !== selectedVoice) {
      setVoicePreference(langVoices[0].voiceURI);
    }
  };
  
  // Filter voices by selected language
  const filteredVoices = voices.filter(voice => 
    voice.language.startsWith(language.split('-')[0])
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-dark-gray border-gray-700 text-light-gray sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Voice Commands</DialogTitle>
        </DialogHeader>
        
        <div className="bg-dark rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium">Language</h3>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="bg-dark-gray text-sm rounded-lg p-2 border border-gray-700 w-40">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent className="bg-dark-gray border-gray-700">
                {languages.map(lang => (
                  <SelectItem key={lang.code} value={lang.code} className="hover:bg-primary/10">
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-center my-6">
            <Button
              variant={listening ? "destructive" : "default"}
              className={`w-20 h-20 rounded-full ${listening ? 'bg-error hover:bg-error/90' : 'bg-primary hover:bg-primary/90'} flex items-center justify-center`}
              onClick={listening ? handleStopListening : handleStartListening}
            >
              <span className="material-icons text-4xl">mic</span>
            </Button>
          </div>
          
          {recognizedText && (
            <div className="bg-dark-gray/50 p-3 rounded-lg mb-3 text-center">
              <p className="text-sm text-gray-300">"{recognizedText}"</p>
            </div>
          )}
          
          <p className="text-sm text-center text-gray-400">
            {listening ? 'Listening...' : 'Tap the mic and say a command'}
          </p>
        </div>
        
        <div className="mb-2">
          <h3 className="text-sm font-medium mb-2">Available Commands</h3>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {commands.map((command) => (
                <div 
                  key={command.id}
                  className="bg-dark rounded-lg p-2 flex items-center"
                >
                  <span className="material-icons text-primary mr-2">{command.icon}</span>
                  <span className="text-sm">"{command.command}"</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
