import { createContext, useContext, ReactNode } from 'react';
import useRealTimeLocation from '@/hooks/useRealTimeLocation';
import { useToast } from '@/hooks/use-toast';

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp?: number;
}

interface LocationContextType {
  location: LocationData | null;
  isTracking: boolean;
  totalDistance: number;
  startTracking: () => void;
  stopTracking: () => void;
  error: string | null;
}

const LocationContext = createContext<LocationContextType>({
  location: null,
  isTracking: false,
  totalDistance: 0,
  startTracking: () => {},
  stopTracking: () => {},
  error: null,
});

export const useLocation = () => useContext(LocationContext);

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider = ({ children }: LocationProviderProps) => {
  // Use our enhanced hook that handles location tracking, anti-cheat, and distance calculation
  const { 
    location, 
    error, 
    isTracking, 
    totalDistance, 
    startTracking: internalStartTracking, 
    stopTracking: internalStopTracking 
  } = useRealTimeLocation();
  
  const { toast } = useToast();

  // Wrapper for start tracking that adds UI notifications
  const startTracking = () => {
    internalStartTracking();
    toast({
      title: "Tracking Started",
      description: "Your movement is now being tracked.",
    });
  };

  // Wrapper for stop tracking that adds UI notifications
  const stopTracking = () => {
    internalStopTracking();
    toast({
      title: "Tracking Stopped",
      description: `You traveled ${totalDistance.toFixed(2)} km.`,
    });
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        isTracking,
        totalDistance,
        startTracking,
        stopTracking,
        error,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};
