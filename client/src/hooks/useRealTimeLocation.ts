import { useState, useEffect } from 'react';

interface Location {
  latitude: number;
  longitude: number;
}

export const useRealTimeLocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let watchId: number;
    
    const startLocationTracking = async () => {
      try {
        if (!navigator.geolocation) {
          setError('Geolocation is not supported by this browser');
          return;
        }
        
        // Get initial location
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (err) => {
            setError(`Failed to get current location: ${err.message}`);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
          }
        );
        
        // Subscribe to location updates
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (err) => {
            setError(`Location watch error: ${err.message}`);
          },
          {
            enableHighAccuracy: true,
            distanceFilter: 10, // Update every 10 meters
            timeout: 15000,
            maximumAge: 0
          }
        );
      } catch (err) {
        setError(`Couldn't initialize location tracking: ${err instanceof Error ? err.message : String(err)}`);
      }
    };
    
    startLocationTracking();
    
    // Clean up subscription when component unmounts
    return () => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  return { location, error };
};

export default useRealTimeLocation;
