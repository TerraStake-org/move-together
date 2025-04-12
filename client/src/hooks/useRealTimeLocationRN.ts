/**
 * React Native version of the useRealTimeLocation hook
 * This demonstrates how to implement location tracking using Expo Location
 * This file is for reference only and not used in the web app
 */

import { useState, useEffect, useCallback } from 'react';
// For React Native, you would use:
// import * as Location from 'expo-location';

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp?: number;
}

export const useRealTimeLocationRN = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [totalDistance, setTotalDistance] = useState(0);
  const [lastLocation, setLastLocation] = useState<LocationData | null>(null);
  const [subscription, setSubscription] = useState<any>(null); // Would be Location.LocationSubscription

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
    
    // Calculate max possible distance based on time elapsed (assuming max human speed of 35 m/s)
    const maxSpeedMps = 35; // meters per second (fast sprinter/vehicle)
    const timeElapsedSeconds = timeElapsedMs / 1000;
    const maxPossibleDistance = timeElapsedSeconds * maxSpeedMps;
    
    // Allow some buffer (e.g., 20% more than theoretical max)
    const isReasonable = distanceMeters <= maxPossibleDistance * 1.2;
    
    if (!isReasonable) {
      console.warn(`Unreasonable location change detected`);
    }
    
    return isReasonable;
  }, [calculateDistance]);

  // Start tracking user location
  const startTracking = useCallback(async () => {
    if (isTracking) return;
    
    try {
      // For React Native, you would use:
      /*
      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return;
      }
      
      // Reset tracking state
      setLocations([]);
      setTotalDistance(0);
      setIsTracking(true);
      
      // Start watching position
      const locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10, // Update every 10 meters
          timeInterval: 5000, // Update every 5 seconds
        },
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: position.timestamp
          };
          
          setLocation(newLocation);
          
          // Add to locations history and calculate distance if not the first point
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
            }
          }
          
          setLastLocation(newLocation);
        }
      );
      
      setSubscription(locationSubscription);
      */
    } catch (err) {
      setError(`Couldn't initialize location tracking: ${err instanceof Error ? err.message : String(err)}`);
      setIsTracking(false);
    }
  }, [isTracking, lastLocation, calculateDistance, isLocationChangeReasonable]);

  // Stop tracking user location
  const stopTracking = useCallback(() => {
    // For React Native, you would use:
    /*
    if (subscription) {
      subscription.remove();
      setSubscription(null);
    }
    */
    setIsTracking(false);
  }, [subscription]);

  // Initialize - get initial location but don't start tracking
  useEffect(() => {
    // For React Native, you would use:
    /*
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          setError('Permission to access location was denied');
          return;
        }
        
        // Get initial location
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });
        
        const initialLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: position.timestamp
        };
        
        setLocation(initialLocation);
        setLastLocation(initialLocation);
      } catch (err) {
        setError(`Failed to get current location: ${err instanceof Error ? err.message : String(err)}`);
      }
    })();
    
    // Clean up subscription when component unmounts
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
    */
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

export default useRealTimeLocationRN;