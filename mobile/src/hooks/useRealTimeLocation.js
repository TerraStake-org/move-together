import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Speed threshold for suspicious movement (in meters per second)
const MAX_SPEED_THRESHOLD = 25; // ~90 km/h

// GPS accuracy threshold (in meters)
const MAX_ACCURACY_THRESHOLD = 50;

// Location update frequency (in milliseconds)
const LOCATION_INTERVAL = 5000; // 5 seconds

export const useRealTimeLocation = () => {
  const [location, setLocation] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState(null);
  const [locationWatcher, setLocationWatcher] = useState(null);

  // Request location permissions
  const requestLocationPermissions = async () => {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        setError('Permission to access location was denied');
        return false;
      }

      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        
        if (backgroundStatus !== 'granted') {
          // We can still track in foreground, but warn about background
          Alert.alert(
            'Background Location Access',
            'For best experience, please allow background location access to track your movement when app is minimized.',
            [{ text: 'OK' }]
          );
        }
      }

      // Start listening for location updates
      await getInitialLocation();
      return true;
    } catch (err) {
      setError(`Error requesting permissions: ${err.message}`);
      return false;
    }
  };

  // Get initial location
  const getInitialLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest
      });
      
      const locationWithTimestamp = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp
      };
      
      setLocation(locationWithTimestamp);
      return locationWithTimestamp;
    } catch (err) {
      setError(`Error getting initial location: ${err.message}`);
      return null;
    }
  };

  // Calculate distance between two coordinates in km using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Calculate speed between two points (meters per second)
  const calculateSpeed = (lat1, lon1, timestamp1, lat2, lon2, timestamp2) => {
    const distanceInKm = calculateDistance(lat1, lon1, lat2, lon2);
    const distanceInMeters = distanceInKm * 1000;
    const timeInSeconds = (timestamp2 - timestamp1) / 1000;
    return timeInSeconds > 0 ? distanceInMeters / timeInSeconds : 0;
  };

  // Handle new location updates with anti-cheat checks
  const handleLocationUpdate = (newLocation) => {
    // Anti-cheat: Check GPS accuracy
    if (newLocation.coords.accuracy > MAX_ACCURACY_THRESHOLD) {
      console.log(`Low accuracy reading ignored: ${newLocation.coords.accuracy}m`);
      return;
    }
    
    const locationData = {
      latitude: newLocation.coords.latitude,
      longitude: newLocation.coords.longitude,
      timestamp: newLocation.timestamp
    };

    setLocation(locationData);

    if (isTracking) {
      // Only add to history if tracking is active
      setLocationHistory(prev => {
        const updatedHistory = [...prev, locationData];

        // Calculate distance if we have at least two points
        if (updatedHistory.length >= 2) {
          const lastIndex = updatedHistory.length - 1;
          const prevLoc = updatedHistory[lastIndex - 1];
          const currLoc = updatedHistory[lastIndex];
          
          // Anti-cheat: Check for suspiciously fast movement
          const speed = calculateSpeed(
            prevLoc.latitude, prevLoc.longitude, prevLoc.timestamp,
            currLoc.latitude, currLoc.longitude, currLoc.timestamp
          );
          
          if (speed > MAX_SPEED_THRESHOLD) {
            console.log(`Suspicious speed detected: ${speed.toFixed(2)} m/s - Removing point`);
            // Remove the suspicious point
            return updatedHistory.slice(0, -1); 
          }
          
          // If valid movement, add the distance
          const legDistance = calculateDistance(
            prevLoc.latitude, prevLoc.longitude,
            currLoc.latitude, currLoc.longitude
          );
          
          setTotalDistance(prev => prev + legDistance);
        }
        
        // Save history to storage
        saveLocationHistory(updatedHistory);
        return updatedHistory;
      });
    }
  };

  // Start location tracking
  const startTracking = useCallback(async () => {
    try {
      if (isTracking) return;
      
      const hasPermission = await requestLocationPermissions();
      if (!hasPermission) return;
      
      // Reset state
      setTotalDistance(0);
      
      const initialLocation = await getInitialLocation();
      if (initialLocation) {
        setLocationHistory([initialLocation]);
      }
      
      // Start watching location with high accuracy
      const watcher = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 5, // minimum 5 meters between updates
          timeInterval: LOCATION_INTERVAL
        },
        handleLocationUpdate
      );
      
      setLocationWatcher(watcher);
      setIsTracking(true);
      
      // Save state to storage
      await AsyncStorage.setItem('isTracking', 'true');
      
    } catch (err) {
      setError(`Error starting tracking: ${err.message}`);
    }
  }, [isTracking]);

  // Stop location tracking
  const stopTracking = useCallback(async () => {
    if (locationWatcher) {
      locationWatcher.remove();
      setLocationWatcher(null);
    }
    
    setIsTracking(false);
    
    // Save final state and reset tracking flag
    await saveLocationHistory(locationHistory);
    await AsyncStorage.setItem('isTracking', 'false');
    
    // Keep history visible after stopping (don't clear it)
  }, [locationWatcher, locationHistory]);

  // Save location history to AsyncStorage
  const saveLocationHistory = async (history) => {
    try {
      await AsyncStorage.setItem('locationHistory', JSON.stringify(history));
      await AsyncStorage.setItem('totalDistance', totalDistance.toString());
    } catch (err) {
      console.error('Error saving location history', err);
    }
  };

  // Load location history from AsyncStorage
  const loadLocationHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem('locationHistory');
      const savedDistance = await AsyncStorage.getItem('totalDistance');
      const savedIsTracking = await AsyncStorage.getItem('isTracking');
      
      if (savedHistory) {
        setLocationHistory(JSON.parse(savedHistory));
      }
      
      if (savedDistance) {
        setTotalDistance(parseFloat(savedDistance));
      }
      
      // Resume tracking if it was active before
      if (savedIsTracking === 'true') {
        startTracking();
      }
    } catch (err) {
      console.error('Error loading location history', err);
    }
  };

  // Initialize permissions and load history
  useEffect(() => {
    requestLocationPermissions();
    loadLocationHistory();
    
    return () => {
      if (locationWatcher) {
        locationWatcher.remove();
      }
    };
  }, []);

  return {
    location,
    locationHistory,
    isTracking,
    startTracking,
    stopTracking,
    totalDistance,
    error
  };
};