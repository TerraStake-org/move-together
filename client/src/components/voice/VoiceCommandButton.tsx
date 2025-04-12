import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2, Volume2 } from 'lucide-react';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';

interface VoiceCommandButtonProps {
  language?: string;
  size?: 'sm' | 'lg';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  position?: 'fixed' | 'relative';
}

/**
 * Voice Command Button Component
 * Provides a UI for activating voice commands with visual feedback
 */
export function VoiceCommandButton({
  language = 'en-US',
  size = 'lg',
  variant = 'secondary',
  position = 'fixed',
}: VoiceCommandButtonProps) {
  const {
    isListening,
    isProcessing,
    startListening,
    stopListening,
    transcript
  } = useVoiceCommands(language);
  
  const [showTranscript, setShowTranscript] = useState(false);
  
  // Handle click to toggle listening
  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
      setShowTranscript(true);
      
      // Hide transcript after 5 seconds
      setTimeout(() => {
        setShowTranscript(false);
      }, 5000);
    }
  };
  
  const positionClass = position === 'fixed' 
    ? 'fixed bottom-16 right-4 z-50' 
    : '';

  return (
    <div className={`relative ${positionClass}`}>
      {/* Voice button */}
      <Button
        variant={variant}
        size={size}
        className={`rounded-full p-4 h-16 w-16 flex items-center justify-center ${isListening ? 'animate-pulse bg-red-500 text-white' : ''}`}
        onClick={handleClick}
        disabled={isProcessing}
        aria-label={isListening ? 'Stop listening' : 'Start voice command'}
      >
        {isProcessing ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : isListening ? (
          <MicOff className="h-6 w-6" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
      </Button>
      
      {/* Transcript display */}
      {showTranscript && transcript && (
        <div className="absolute bottom-20 right-0 bg-background border rounded-md shadow-lg p-3 min-w-[200px] max-w-[300px] text-sm">
          <div className="flex items-start gap-2">
            <Volume2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{transcript}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Voice Command List Component
 * Displays available voice commands
 */
export function VoiceCommandList({ language = 'en-US' }) {
  const { commands, isLoadingCommands } = useVoiceCommands(language);
  
  if (isLoadingCommands) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading voice commands...</span>
      </div>
    );
  }
  
  return (
    <div className="rounded-md border bg-card">
      <div className="p-4 font-medium">Available Voice Commands</div>
      <ul className="divide-y">
        {commands.map((command: any) => (
          <li key={command.id} className="flex items-center p-4 gap-3">
            <div className="flex-shrink-0 w-8 h-8 grid place-items-center bg-muted rounded-full">
              <span className="material-icons text-sm">{command.icon}</span>
            </div>
            <div className="flex-1">
              <div className="font-medium">{command.command}</div>
              <div className="text-sm text-muted-foreground">Action: {command.action}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}