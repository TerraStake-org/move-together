/**
 * React Native map component using react-native-maps
 * This is a reference implementation for migrating to React Native
 * This file is not used in the web app
 */

import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRealTimeLocationRN } from '../hooks/useRealTimeLocationRN';
import { Button } from './ui/Button'; // Assume you've created React Native UI components

const RealTimeLocationMap = () => {
  const { 
    location, 
    error, 
    isTracking, 
    totalDistance, 
    locations, 
    startTracking, 
    stopTracking 
  } = useRealTimeLocationRN();
  
  const [mapType, setMapType] = useState('standard'); // standard, satellite, hybrid
  
  // Memoize the map region to avoid unnecessary re-renders
  const mapRegion = useMemo(() => {
    if (!location) return null;
    
    return {
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }, [location]);
  
  // Toggle map type
  const toggleMapType = () => {
    setMapType(prev => {
      switch (prev) {
        case 'standard': return 'satellite';
        case 'satellite': return 'hybrid';
        case 'hybrid': return 'standard';
        default: return 'standard';
      }
    });
  };
  
  // Handle tracking toggle
  const handleTrackingToggle = () => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };
  
  // Display loading state
  if (!location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Waiting for GPS signal...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Map View */}
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={mapRegion}
        showsUserLocation={true}
        followsUserLocation={true}
        showsCompass={true}
        showsTraffic={false}
        mapType={mapType}
      >
        {/* User's current location marker */}
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude
          }}
          title="Your Location"
          pinColor="#3b82f6"
        />
        
        {/* Path tracking polyline */}
        {locations.length > 1 && (
          <Polyline
            coordinates={locations}
            strokeColor="#3b82f6"
            strokeWidth={3}
            lineDashPattern={[0]}
          />
        )}
      </MapView>
      
      {/* Status Overlay */}
      <View style={styles.statusOverlay}>
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDot, { backgroundColor: isTracking ? '#10b981' : '#6b7280' }]} />
          <Text style={styles.statusText}>
            {isTracking ? 'GPS Tracking Active' : 'Tracking Paused'}
          </Text>
        </View>
        
        {isTracking && (
          <Text style={styles.distanceText}>
            Distance: {totalDistance.toFixed(2)} km
          </Text>
        )}
      </View>
      
      {/* Map Controls */}
      <View style={styles.mapControls}>
        <Button
          icon="layers"
          onPress={toggleMapType}
          style={styles.controlButton}
        />
      </View>
      
      {/* Tracking Button */}
      <View style={styles.trackingButtonContainer}>
        <Button
          icon={isTracking ? "stop" : "play-arrow"}
          onPress={handleTrackingToggle}
          style={[
            styles.trackingButton,
            { backgroundColor: isTracking ? '#ef4444' : '#3b82f6' }
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1f2937',
  },
  loadingText: {
    marginTop: 10,
    color: '#e5e7eb',
    fontSize: 16,
  },
  statusOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    padding: 12,
    borderRadius: 8,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '500',
  },
  distanceText: {
    color: '#e5e7eb',
    fontSize: 14,
    marginTop: 8,
  },
  mapControls: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  trackingButtonContainer: {
    position: 'absolute',
    bottom: 32,
    right: 16,
  },
  trackingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RealTimeLocationMap;