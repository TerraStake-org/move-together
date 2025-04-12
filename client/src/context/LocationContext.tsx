import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRealTimeLocation } from '@/hooks/useRealTimeLocation';
import { calculateHaversineDistance, isLocationChangeReasonable } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
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
  const { location: currentLocation, error: locationError } = useRealTimeLocation();
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [lastAntiCheatCheck, setLastAntiCheatCheck] = useState<number>(Date.now());
  
  const { toast } = useToast();

  // Convert the location from hook to our format with timestamp
  const location = currentLocation ? {
    latitude: currentLocation.latitude,
    longitude: currentLocation.longitude,
    timestamp: Date.now(),
  } : null;

  // Update location history and calculate distance when tracking is active
  useEffect(() => {
    if (!isTracking || !location) return;

    // Anti-cheat: Check if location change is reasonable
    if (locationHistory.length > 0) {
      const prevLocation = locationHistory[locationHistory.length - 1];
      const timeElapsed = location.timestamp - prevLocation.timestamp;
      
      const isReasonable = isLocationChangeReasonable(
        prevLocation.latitude,
        prevLocation.longitude,
        location.latitude,
        location.longitude,
        timeElapsed
      );

      if (!isReasonable) {
        // Potential GPS spoofing detected
        if (Date.now() - lastAntiCheatCheck > 10000) { // Only show warning every 10 seconds
          toast({
            title: "Suspicious Movement Detected",
            description: "Unrealistic movement pattern detected. This may affect your rewards.",
            variant: "destructive",
          });
          setLastAntiCheatCheck(Date.now());
        }
        return; // Don't update location history or distance
      }
      
      // Calculate distance since last location
      const distanceInMeters = calculateHaversineDistance(
        prevLocation.latitude,
        prevLocation.longitude,
        location.latitude,
        location.longitude
      );
      
      // Only update if moved at least 5 meters (to avoid micro-movements)
      if (distanceInMeters >= 5) {
        setTotalDistance(prev => prev + (distanceInMeters / 1000)); // Convert to km
        setLocationHistory(prev => [...prev, location]);
      }
    } else {
      // First location entry
      setLocationHistory([location]);
    }
  }, [isTracking, location, locationHistory, lastAntiCheatCheck, toast]);

  const startTracking = useCallback(() => {
    setIsTracking(true);
    setLocationHistory([]);
    setTotalDistance(0);
    
    toast({
      title: "Tracking Started",
      description: "Your movement is now being tracked.",
    });
  }, [toast]);

  const stopTracking = useCallback(() => {
    setIsTracking(false);
    
    toast({
      title: "Tracking Stopped",
      description: `You traveled ${totalDistance.toFixed(2)} km.`,
    });
  }, [totalDistance, toast]);

  return (
    <LocationContext.Provider
      value={{
        location,
        isTracking,
        totalDistance,
        startTracking,
        stopTracking,
        error: locationError,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};
