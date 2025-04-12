import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define location data type
export interface LocationData {
  latitude: number;
  longitude: number;
  timestamp?: number;
  speed?: number; // Speed in m/s
}

// Define context type
interface LocationContextType {
  location: LocationData | null;
  isTracking: boolean;
  totalDistance: number;
  locations: LocationData[];
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  error: string | null;
}

// Create context with default values
const LocationContext = createContext<LocationContextType>({
  location: null,
  isTracking: false,
  totalDistance: 0,
  locations: [],
  startTracking: async () => {},
  stopTracking: () => {},
  error: null
});

// Custom hook to use the context
export const useLocation = () => useContext(LocationContext);

// Props for the provider
interface LocationProviderProps {
  children: ReactNode;
}

// Provider component
export const LocationProvider = ({ children }: LocationProviderProps) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [totalDistance, setTotalDistance] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Mock location updates for development
  // In a real app, this would use browser's geolocation or react-native-location
  useEffect(() => {
    if (!isTracking) return;
    
    // Clear any previous error
    setError(null);
    
    // Mock location data with speed
    let lastLatitude = 37.7749;
    let lastLongitude = -122.4194;
    let speed = 0;
    
    const interval = setInterval(() => {
      // Simulate movement with some randomness
      const randomLat = Math.random() * 0.001 * (Math.random() > 0.5 ? 1 : -1);
      const randomLong = Math.random() * 0.001 * (Math.random() > 0.5 ? 1 : -1);
      
      // Generate new location with slight movement
      const newLatitude = lastLatitude + randomLat;
      const newLongitude = lastLongitude + randomLong;
      
      // Calculate speed based on distance between points
      // For simplicity, we'll use a rough approximation
      // 0.001 degree ≈ 111 meters at the equator
      const distanceMoved = Math.sqrt(
        Math.pow((newLatitude - lastLatitude) * 111000, 2) +
        Math.pow((newLongitude - lastLongitude) * 111000, 2)
      );
      
      // Speed in m/s: distance / time(ms) * 1000
      speed = distanceMoved / 2000 * 1000;
      
      // Create new location object
      const newLocation: LocationData = {
        latitude: newLatitude,
        longitude: newLongitude,
        timestamp: Date.now(),
        speed: speed
      };
      
      // Update state
      setLocation(newLocation);
      setLocations(prev => [...prev, newLocation]);
      
      // Calculate distance from previous point (approximately)
      if (lastLatitude && lastLongitude) {
        const newDistance = calculateDistance(
          lastLatitude, lastLongitude,
          newLatitude, newLongitude
        );
        
        setTotalDistance(prev => prev + newDistance);
      }
      
      // Update last location
      lastLatitude = newLatitude;
      lastLongitude = newLongitude;
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isTracking]);
  
  // Start tracking location
  const startTracking = async () => {
    try {
      // Reset the tracking state
      setTotalDistance(0);
      setLocations([]);
      
      // Get initial position
      // In a real app, this would use Geolocation or Expo Location
      // And would include permission checks
      const initialLocation: LocationData = {
        latitude: 37.7749,
        longitude: -122.4194,
        timestamp: Date.now(),
        speed: 0
      };
      
      setLocation(initialLocation);
      setLocations([initialLocation]);
      setIsTracking(true);
    } catch (err) {
      setError('Failed to start location tracking');
      console.error(err);
    }
  };
  
  // Stop tracking location
  const stopTracking = () => {
    setIsTracking(false);
  };
  
  // Calculate distance between two coordinates in kilometers
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  };
  
  // Convert degrees to radians
  const toRad = (value: number): number => {
    return value * Math.PI / 180;
  };
  
  // Context value
  const contextValue: LocationContextType = {
    location,
    isTracking,
    totalDistance,
    locations,
    startTracking,
    stopTracking,
    error
  };
  
  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
};