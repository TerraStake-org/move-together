import { useState, useEffect, useCallback } from 'react';

interface Location {
  latitude: number;
  longitude: number;
  timestamp?: number;
  speed?: number; // Speed in m/s
}

// Enhanced to track multiple locations over time (for route tracking) and distance
export const useRealTimeLocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [totalDistance, setTotalDistance] = useState(0);
  const [lastLocation, setLastLocation] = useState<Location | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  }, []);

  // Check if location change is reasonable (anti-cheat)
  const isLocationChangeReasonable = useCallback((
    prevLat: number, 
    prevLng: number, 
    newLat: number, 
    newLng: number, 
    timeElapsedMs: number
  ): boolean => {
    // Calculate distance in kilometers
    const distance = calculateDistance(prevLat, prevLng, newLat, newLng);
    
    // Convert to meters
    const distanceMeters = distance * 1000;
    
    // Calculate max possible distance based on time elapsed (assuming max human speed of 35 m/s or ~126 km/h)
    // This is generous but will filter out teleportation cheats
    const maxSpeedMps = 35; // meters per second (fast sprinter/vehicle)
    const timeElapsedSeconds = timeElapsedMs / 1000;
    const maxPossibleDistance = timeElapsedSeconds * maxSpeedMps;
    
    // Allow some buffer (e.g., 20% more than theoretical max) to account for GPS imprecision
    const isReasonable = distanceMeters <= maxPossibleDistance * 1.2;
    
    // If not reasonable, log the values for debugging
    if (!isReasonable) {
      console.warn(`Unreasonable location change detected:
        Distance: ${distanceMeters.toFixed(2)}m
        Time elapsed: ${timeElapsedSeconds.toFixed(2)}s
        Max allowed: ${(maxPossibleDistance * 1.2).toFixed(2)}m
        Estimated speed: ${(distanceMeters / timeElapsedSeconds).toFixed(2)} m/s
      `);
    }
    
    return isReasonable;
  }, [calculateDistance]);

  // Start tracking user location
  const startTracking = useCallback(() => {
    if (isTracking) return;
    
    try {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by this browser');
        return;
      }
      
      // Reset tracking state
      setLocations([]);
      setTotalDistance(0);
      setIsTracking(true);
      
      // Start watching position
      const id = navigator.geolocation.watchPosition(
        (position) => {
          // Create new location with calculated speed or use provided speed if available
          const now = Date.now();
          let calculatedSpeed = 0;
          
          if (lastLocation && lastLocation.timestamp) {
            const timeElapsedSeconds = (now - lastLocation.timestamp) / 1000;
            if (timeElapsedSeconds > 0) {
              // Calculate distance in meters
              const distanceKm = calculateDistance(
                lastLocation.latitude,
                lastLocation.longitude,
                position.coords.latitude,
                position.coords.longitude
              );
              const distanceMeters = distanceKm * 1000;
              
              // Calculate speed in m/s
              calculatedSpeed = distanceMeters / timeElapsedSeconds;
            }
          }
          
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: now,
            // Use position.coords.speed if available (some browsers support it), otherwise use calculated speed
            speed: position.coords.speed !== null && position.coords.speed !== undefined 
                  ? position.coords.speed 
                  : calculatedSpeed
          };
          
          setLocation(newLocation);
          
          // Add to locations history and calculate distance if this is not the first point
          setLocations(prev => [...prev, newLocation]);
          
          if (lastLocation) {
            // Anti-cheat: check if location change is reasonable
            const timeElapsed = newLocation.timestamp! - (lastLocation.timestamp || Date.now());
            
            if (isLocationChangeReasonable(
              lastLocation.latitude,
              lastLocation.longitude,
              newLocation.latitude,
              newLocation.longitude,
              timeElapsed
            )) {
              // Calculate distance from last location and add to total
              const segmentDistance = calculateDistance(
                lastLocation.latitude,
                lastLocation.longitude,
                newLocation.latitude,
                newLocation.longitude
              );
              
              setTotalDistance(prev => prev + segmentDistance);
            } else {
              console.warn('Location change detected as unreasonable, not counting distance');
            }
          }
          
          setLastLocation(newLocation);
        },
        (err) => {
          setError(`Location watch error: ${err.message}`);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
      
      setWatchId(id);
    } catch (err) {
      setError(`Couldn't initialize location tracking: ${err instanceof Error ? err.message : String(err)}`);
      setIsTracking(false);
    }
  }, [isTracking, lastLocation, calculateDistance, isLocationChangeReasonable]);

  // Stop tracking user location
  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
    
    // Here we would integrate with the MOVE token reward system
    // This is where we would call the rewardUserForDistance function
    console.log(`Tracking stopped. Total distance: ${totalDistance.toFixed(2)} km`);
    
    // For demo purposes only - log the reward they would receive
    if (totalDistance > 0.1) { // Only reward if they moved more than 100m
      console.log(`You would earn ${totalDistance.toFixed(2)} MOVE tokens!`);
      // In a production app, we would call the blockchain function here
    }
  }, [watchId, totalDistance]);

  // Initialize - get initial location but don't start tracking yet
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }
    
    // Get initial location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const initialLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: Date.now(),
          speed: position.coords.speed || 0
        };
        setLocation(initialLocation);
        setLastLocation(initialLocation);
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
    
    // Clean up subscription when component unmounts
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  return { 
    location, 
    error, 
    isTracking, 
    totalDistance, 
    locations, 
    startTracking, 
    stopTracking 
  };
};

export default useRealTimeLocation;
