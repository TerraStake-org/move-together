import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from './LocationContext';
import { placeDiscovery, type Place } from '@/services/PlaceDiscoveryService';
import { audioPlayer } from '@/services/AudioPlayerService';
import { useToast } from '@/hooks/use-toast';

interface PlaceDiscoveryContextType {
  nearbyPlaces: Place[];
  activePlaces: Place[];
  visitedPlaces: Place[];
  currentPlayingAudio: string | null;
  playAudioGuide: (placeId: string) => Promise<void>;
  stopAudioGuide: () => void;
  collectBadge: (placeId: string) => Promise<boolean>;
  hasVisited: (placeId: string) => boolean;
  showARContent: (placeId: string) => void;
}

const PlaceDiscoveryContext = createContext<PlaceDiscoveryContextType | null>(null);

export const usePlaceDiscovery = () => {
  const context = useContext(PlaceDiscoveryContext);
  if (!context) {
    throw new Error('usePlaceDiscovery must be used within a PlaceDiscoveryProvider');
  }
  return context;
};

interface PlaceDiscoveryProviderProps {
  children: ReactNode;
}

export const PlaceDiscoveryProvider = ({ children }: PlaceDiscoveryProviderProps) => {
  const { location, isTracking } = useLocation();
  const { toast } = useToast();
  
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [currentPlayingAudio, setCurrentPlayingAudio] = useState<string | null>(null);
  
  // Effect to check for nearby places when location changes
  useEffect(() => {
    if (location && isTracking) {
      const places = placeDiscovery.checkNearbyPlaces(location);
      setNearbyPlaces(places);
      
      // Notify about new places
      places.forEach(place => {
        if (!placeDiscovery.hasVisited(place.id)) {
          toast({
            title: `Discovered: ${place.name}`,
            description: 'Tap to learn more about this location.',
            action: (
              <button 
                onClick={() => playAudioGuide(place.id)}
                className="bg-primary hover:bg-primary/90 text-white px-3 py-1 rounded-md text-xs"
              >
                Play Guide
              </button>
            ),
          });
        }
      });
    }
  }, [location, isTracking, toast]);
  
  // Play audio guide for a place
  const playAudioGuide = async (placeId: string): Promise<void> => {
    const place = placeDiscovery.getPlaceById(placeId);
    if (!place || !place.audioGuide) {
      toast({
        title: 'No audio guide available',
        description: 'This location does not have an audio guide.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      await audioPlayer.play(place.audioGuide);
      setCurrentPlayingAudio(placeId);
      placeDiscovery.markPlaceVisited(placeId);
      
      toast({
        title: `Playing: ${place.name}`,
        description: place.description
      });
    } catch (error) {
      console.error('Error playing audio guide:', error);
      toast({
        title: 'Failed to play audio guide',
        description: 'An error occurred while playing the audio guide.',
        variant: 'destructive'
      });
    }
  };
  
  // Stop the current audio guide
  const stopAudioGuide = (): void => {
    audioPlayer.stop();
    setCurrentPlayingAudio(null);
  };
  
  // Collect a badge NFT for a place
  const collectBadge = async (placeId: string): Promise<boolean> => {
    const place = placeDiscovery.getPlaceById(placeId);
    if (!place || !place.badgeNFT) {
      toast({
        title: 'No badge available',
        description: 'This location does not have a badge to collect.',
        variant: 'destructive'
      });
      return false;
    }
    
    // In a real app, this would call the NFT minting function
    // For now, we'll just mark the place as visited
    placeDiscovery.markPlaceVisited(placeId);
    
    toast({
      title: 'Badge Collected!',
      description: `You've earned the ${place.badgeNFT.name}!`,
      variant: 'default',
      // Add action for explicit dismissal
      action: (
        <button 
          onClick={() => toast.dismiss()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs"
        >
          Close
        </button>
      )
    });
    
    return true;
  };
  
  // Show AR content for a place
  const showARContent = (placeId: string): void => {
    const place = placeDiscovery.getPlaceById(placeId);
    if (!place || !place.arContent) {
      toast({
        title: 'No AR content available',
        description: 'This location does not have augmented reality content.',
        variant: 'destructive'
      });
      return;
    }
    
    // In a real app, this would trigger the AR view
    toast({
      title: 'AR View',
      description: `Launching AR view for ${place.name}...`,
      variant: 'default'
    });
  };
  
  // Cleanup audio player on unmount
  useEffect(() => {
    return () => {
      audioPlayer.stop();
    };
  }, []);
  
  // Context value
  const contextValue: PlaceDiscoveryContextType = {
    nearbyPlaces,
    activePlaces: placeDiscovery.getActivePlaces(),
    visitedPlaces: placeDiscovery.getVisitedPlaces(),
    currentPlayingAudio,
    playAudioGuide,
    stopAudioGuide,
    collectBadge,
    hasVisited: (placeId: string) => placeDiscovery.hasVisited(placeId),
    showARContent
  };
  
  return (
    <PlaceDiscoveryContext.Provider value={contextValue}>
      {children}
    </PlaceDiscoveryContext.Provider>
  );
};