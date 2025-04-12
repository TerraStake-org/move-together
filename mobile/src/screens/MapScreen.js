import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRealTimeLocation } from '../hooks/useRealTimeLocation';
import { mapStyle } from '../styles/mapStyle';

const { width, height } = Dimensions.get('window');

const MapScreen = () => {
  const [mapType, setMapType] = useState('standard');
  const [showStats, setShowStats] = useState(true);
  const mapRef = useRef(null);
  
  const {
    location,
    locationHistory,
    isTracking,
    startTracking,
    stopTracking,
    totalDistance,
    error
  } = useRealTimeLocation();

  // Format time from seconds
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate session duration in seconds
  const calculateDuration = () => {
    if (!isTracking || locationHistory.length === 0) return 0;
    const startTime = locationHistory[0].timestamp;
    const currentTime = new Date().getTime();
    return Math.floor((currentTime - startTime) / 1000);
  };

  // Calculate pace in minutes per km
  const calculatePace = () => {
    const durationMinutes = calculateDuration() / 60;
    if (totalDistance === 0 || durationMinutes === 0) return 0;
    return durationMinutes / totalDistance;
  };

  // Format pace (min/km)
  const formatPace = (pace) => {
    if (pace === 0) return '--:--';
    const mins = Math.floor(pace);
    const secs = Math.floor((pace - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Center map on current location
  const centerOnLocation = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005
      });
    }
  };

  // Toggle map type between standard and satellite
  const toggleMapType = () => {
    setMapType(mapType === 'standard' ? 'satellite' : 'standard');
  };

  // Handle tracking start/stop
  const toggleTracking = () => {
    if (isTracking) {
      stopTracking();
      Alert.alert(
        'Tracking Stopped',
        `You traveled ${totalDistance.toFixed(2)} km and earned ${(totalDistance * 5).toFixed(1)} MOVE tokens!`,
        [
          { text: 'OK' }
        ]
      );
    } else {
      startTracking();
    }
  };

  // Center map when location changes
  useEffect(() => {
    if (location && mapRef.current && (!locationHistory.length || locationHistory.length === 1)) {
      centerOnLocation();
    }
  }, [location]);

  // Show error if any
  useEffect(() => {
    if (error) {
      Alert.alert('Location Error', error);
    }
  }, [error]);

  return (
    <View style={styles.container}>
      {location ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          customMapStyle={mapStyle}
          mapType={mapType}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={false}
          showsScale={true}
          rotateEnabled={true}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
        >
          {/* Draw path line */}
          {locationHistory.length > 1 && (
            <Polyline
              coordinates={locationHistory}
              strokeWidth={5}
              strokeColor="#FF6347" // Tomato color
              lineCap="round"
              lineJoin="round"
            />
          )}
          
          {/* Starting point marker */}
          {locationHistory.length > 0 && (
            <Marker
              coordinate={locationHistory[0]}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.startMarker}>
                <MaterialIcons name="flag" size={24} color="#FFFFFF" />
              </View>
            </Marker>
          )}
        </MapView>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6347" />
          <Text style={styles.loadingText}>Acquiring GPS signal...</Text>
        </View>
      )}
      
      {/* Map Controls */}
      <SafeAreaView style={styles.controls} edges={['right', 'top']}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={toggleMapType}
        >
          <MaterialIcons name="layers" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.controlButton}
          onPress={centerOnLocation}
        >
          <MaterialIcons name="my-location" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setShowStats(!showStats)}
        >
          <MaterialIcons name="insert-chart" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </SafeAreaView>
      
      {/* Stats Panel */}
      {showStats && (
        <SafeAreaView style={styles.statsContainer} edges={['left', 'top']}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Distance</Text>
            <Text style={styles.statValue}>{totalDistance.toFixed(2)} km</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Duration</Text>
            <Text style={styles.statValue}>{formatTime(calculateDuration())}</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Pace</Text>
            <Text style={styles.statValue}>{formatPace(calculatePace())} min/km</Text>
          </View>
        </SafeAreaView>
      )}
      
      {/* Start/Stop Tracking Button */}
      <SafeAreaView style={styles.actionButtonContainer} edges={['bottom']}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: isTracking ? '#E74C3C' : '#2ECC71' }
          ]}
          onPress={toggleTracking}
        >
          <MaterialIcons 
            name={isTracking ? 'stop' : 'play-arrow'} 
            size={36} 
            color="#FFFFFF" 
          />
          <Text style={styles.actionButtonText}>
            {isTracking ? 'STOP' : 'START'} TRACKING
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  map: {
    width,
    height,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  controls: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'transparent',
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statsContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  statLabel: {
    color: '#BBBBBB',
    fontSize: 14,
    marginRight: 16,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButtonContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    backgroundColor: '#2ECC71',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  startMarker: {
    backgroundColor: '#4CAF50',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});

export default MapScreen;