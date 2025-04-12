import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, FastForward, Rewind, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { usePlaceDiscovery } from '@/context/PlaceDiscoveryContext';
import { audioPlayer } from '@/services/AudioPlayerService';
import { cn } from '@/lib/utils';

export default function AudioGuidePlayer() {
  const { currentPlayingAudio, stopAudioGuide } = usePlaceDiscovery();
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  
  // Show/hide player based on whether audio is playing
  useEffect(() => {
    setIsVisible(!!currentPlayingAudio);
    setIsPaused(false);
  }, [currentPlayingAudio]);
  
  // Handle play/pause
  const handlePlayPause = () => {
    if (isPaused) {
      audioPlayer.resume();
      setIsPaused(false);
    } else {
      audioPlayer.pause();
      setIsPaused(true);
    }
  };
  
  // Handle stop
  const handleStop = () => {
    stopAudioGuide();
  };
  
  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    audioPlayer.setVolume(newVolume);
    
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };
  
  // Handle mute toggle
  const handleMuteToggle = () => {
    if (isMuted) {
      audioPlayer.setVolume(volume || 0.5);
      setIsMuted(false);
    } else {
      audioPlayer.setVolume(0);
      setIsMuted(true);
    }
  };
  
  if (!isVisible) return null;
  
  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg transition-transform duration-300 z-50",
        !isVisible && "translate-y-full"
      )}
    >
      <div className="container max-w-lg mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={handlePlayPause}
            >
              {isPaused ? (
                <Play className="h-4 w-4" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={handleStop}
            >
              <VolumeX className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-2 flex-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={handleMuteToggle}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              
              <Slider
                value={[isMuted ? 0 : volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="w-24"
              />
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Audio Guide Playing
          </div>
        </div>
      </div>
    </div>
  );
}