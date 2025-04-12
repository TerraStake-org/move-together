/**
 * Custom Map Implementation for React Native
 * This component creates a visually appealing, real-looking map with custom styling.
 * 
 * Features:
 * - Custom map styling with dark and light modes
 * - Current location tracking with smooth animation
 * - Path history visualization
 * - Custom markers for starting and current points
 * - Distance markers every kilometer
 * - Heatmap for frequent locations
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Platform,
  Switch,
  Image,
  Animated,
} from 'react-native';
import MapView, {
  Marker,
  Polyline,
  Circle,
  Heatmap,
  PROVIDER_GOOGLE,
  Callout,
} from 'react-native-maps';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRealTimeLocationRN } from '../hooks/useRealTimeLocationRN';
import { formatDistance } from '../lib/utils';

// Width/height of the device screen
const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// Map region for San Francisco (default starting location)
const initialRegion = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA,
};

// Custom map styles for dark mode
const darkMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#181818"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1b1b1b"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#2c2c2c"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#8a8a8a"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#373737"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#3c3c3c"
      }
    ]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#4e4e4e"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#000000"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#3d3d3d"
      }
    ]
  }
];

// Custom map styles for light mode
const lightMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "on"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e5e5e5"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#dadada"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e5e5e5"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#c9c9c9"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  }
];

// Sample fitness points of interest data
const fitnessPoints = [
  { id: 1, coordinate: { latitude: 37.78925, longitude: -122.4344 }, title: "Outdoor Gym", type: "gym" },
  { id: 2, coordinate: { latitude: 37.78625, longitude: -122.4314 }, title: "Running Track", type: "track" },
  { id: 3, coordinate: { latitude: 37.78725, longitude: -122.4294 }, title: "Yoga in the Park", type: "yoga" },
  { id: 4, coordinate: { latitude: 37.78525, longitude: -122.4334 }, title: "Bike Rental", type: "bike" },
];

// Create distance markers function
const createDistanceMarkers = (path, totalDistance) => {
  if (!path || path.length < 2) return [];
  
  const markers = [];
  let currentDistance = 0;
  const markerInterval = 1; // Place marker every 1km
  
  // Create markers at each kilometer point
  for (let i = 0; i < Math.floor(totalDistance); i += markerInterval) {
    if (i > 0 && path.length > i * 10) {
      // Approximate placement - in a real app would calculate exact point
      const markerPoint = path[Math.min(i * 10, path.length - 1)];
      markers.push({
        id: `distance-${i}`,
        coordinate: markerPoint,
        distance: i,
      });
    }
  }
  
  return markers;
};

// Generate heatmap points based on location history
const generateHeatmapPoints = (locationHistory) => {
  if (!locationHistory || locationHistory.length < 10) return [];
  
  // Create intensity points - more points where user spent more time
  return locationHistory.reduce((points, location, index) => {
    // Add current point
    points.push({
      latitude: location.latitude,
      longitude: location.longitude,
      weight: 1,
    });
    
    // For longer stays, add more points in the same area
    if (index > 0 && 
        Math.abs(location.latitude - locationHistory[index-1].latitude) < 0.0001 &&
        Math.abs(location.longitude - locationHistory[index-1].longitude) < 0.0001) {
      // Add extra points to increase heat for stationary locations
      for (let i = 0; i < 5; i++) {
        points.push({
          latitude: location.latitude + (Math.random() - 0.5) * 0.0001,
          longitude: location.longitude + (Math.random() - 0.5) * 0.0001,
          weight: 0.5,
        });
      }
    }
    
    return points;
  }, []);
};

const CustomMapRN = () => {
  // Use our real-time location hook
  const {
    location,
    locationHistory,
    totalDistance,
    isTracking,
    startTracking,
    stopTracking,
    error,
  } = useRealTimeLocationRN();
  
  // State for the map
  const [darkMode, setDarkMode] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showPOIs, setShowPOIs] = useState(true);
  const [followUser, setFollowUser] = useState(true);
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(0.5)).current;
  
  // Reference to the map component
  const mapRef = useRef(null);
  
  // Start pulse animation for current location marker
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  
  // Center map on location updates if following is enabled
  useEffect(() => {
    if (location && followUser && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }, 500);
    }
  }, [location, followUser]);
  
  // Handle any location tracking errors
  useEffect(() => {
    if (error) {
      console.error("Location error:", error);
      // In a real app, show an alert or toast message
    }
  }, [error]);
  
  // Create distance markers
  const distanceMarkers = useMemo(() => {
    return createDistanceMarkers(locationHistory, totalDistance);
  }, [locationHistory, totalDistance]);
  
  // Create heatmap data
  const heatmapPoints = useMemo(() => {
    return generateHeatmapPoints(locationHistory);
  }, [locationHistory]);
  
  // Handle starting tracking
  const handleStartTracking = async () => {
    await startTracking();
    setFollowUser(true);
  };
  
  // Handle stopping tracking
  const handleStopTracking = async () => {
    await stopTracking();
  };
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  // Center map on user
  const centerOnUser = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }, 500);
      setFollowUser(true);
    }
  };
  
  // When user moves the map manually
  const onUserPanDrag = () => {
    setFollowUser(false);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        customMapStyle={darkMode ? darkMapStyle : lightMapStyle}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        showsTraffic={false}
        showsIndoors={false}
        showsBuildings={false}
        rotateEnabled={true}
        scrollEnabled={true}
        pitchEnabled={true}
        zoomEnabled={true}
        onPanDrag={onUserPanDrag}
      >
        {/* Starting point marker */}
        {locationHistory && locationHistory.length > 0 && (
          <Marker
            coordinate={locationHistory[0]}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.startMarker}>
              <FontAwesome5 name="flag-checkered" size={24} color={darkMode ? "#ffffff" : "#000000"} />
            </View>
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>Starting Point</Text>
                <Text style={styles.calloutText}>You started your journey here</Text>
              </View>
            </Callout>
          </Marker>
        )}
        
        {/* Current location with pulsing effect */}
        {location && (
          <Marker
            coordinate={location}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <Animated.View style={[
              styles.currentLocationMarker,
              { transform: [{ scale: pulseAnim }] }
            ]}>
              <View style={styles.currentLocationDot} />
            </Animated.View>
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>Current Location</Text>
                <Text style={styles.calloutText}>You are here</Text>
                <Text style={styles.calloutText}>Total Distance: {formatDistance(totalDistance)}</Text>
              </View>
            </Callout>
          </Marker>
        )}
        
        {/* Distance markers */}
        {distanceMarkers.map(marker => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.distanceMarker}>
              <Text style={styles.distanceMarkerText}>{marker.distance}km</Text>
            </View>
          </Marker>
        ))}
        
        {/* Points of interest */}
        {showPOIs && fitnessPoints.map(point => (
          <Marker
            key={point.id}
            coordinate={point.coordinate}
            title={point.title}
          >
            <View style={styles.poiMarker}>
              {point.type === 'gym' && <MaterialCommunityIcons name="weight-lifter" size={20} color="#ffffff" />}
              {point.type === 'track' && <MaterialCommunityIcons name="run-fast" size={20} color="#ffffff" />}
              {point.type === 'yoga' && <MaterialCommunityIcons name="yoga" size={20} color="#ffffff" />}
              {point.type === 'bike' && <MaterialCommunityIcons name="bike" size={20} color="#ffffff" />}
            </View>
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{point.title}</Text>
                <Text style={styles.calloutText}>Tap to navigate here</Text>
              </View>
            </Callout>
          </Marker>
        ))}
        
        {/* Path line */}
        {locationHistory && locationHistory.length > 1 && (
          <Polyline
            coordinates={locationHistory}
            strokeWidth={4}
            strokeColor={darkMode ? "#3b82f6" : "#2563eb"}
            lineDashPattern={[0]} // Solid line
            lineCap="round"
            lineJoin="round"
          />
        )}
        
        {/* Accuracy circle around current location */}
        {location && (
          <Circle
            center={location}
            radius={20} // Accuracy radius in meters
            fillColor="rgba(59, 130, 246, 0.2)"
            strokeColor="rgba(59, 130, 246, 0.5)"
            strokeWidth={1}
            zIndex={1}
          />
        )}
        
        {/* Heatmap for frequently visited areas */}
        {showHeatmap && heatmapPoints.length > 0 && (
          <Heatmap
            points={heatmapPoints}
            radius={40}
            opacity={0.7}
            gradient={{
              colors: ["#00ffff", "#0000ff", "#ff0000"],
              startPoints: [0.1, 0.5, 0.9],
              colorMapSize: 500
            }}
          />
        )}
      </MapView>
      
      {/* Map controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, darkMode && styles.controlButtonDark]}
          onPress={centerOnUser}
        >
          <MaterialCommunityIcons
            name="crosshairs-gps"
            size={24}
            color={darkMode ? "#ffffff" : "#000000"}
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.controlButton, darkMode && styles.controlButtonDark]}
          onPress={toggleDarkMode}
        >
          <MaterialCommunityIcons
            name={darkMode ? "weather-sunny" : "weather-night"}
            size={24}
            color={darkMode ? "#ffffff" : "#000000"}
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.controlButton, darkMode && styles.controlButtonDark]}
          onPress={() => setShowHeatmap(!showHeatmap)}
        >
          <MaterialCommunityIcons
            name={showHeatmap ? "fire" : "fire-off"}
            size={24}
            color={darkMode ? "#ffffff" : "#000000"}
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.controlButton, darkMode && styles.controlButtonDark]}
          onPress={() => setShowPOIs(!showPOIs)}
        >
          <MaterialCommunityIcons
            name={showPOIs ? "map-marker-multiple" : "map-marker-off"}
            size={24}
            color={darkMode ? "#ffffff" : "#000000"}
          />
        </TouchableOpacity>
      </View>
      
      {/* Stats panel */}
      <View style={[styles.statsPanel, darkMode && styles.statsPanelDark]}>
        <View style={styles.stat}>
          <Text style={[styles.statLabel, darkMode && styles.statLabelDark]}>Distance</Text>
          <Text style={[styles.statValue, darkMode && styles.statValueDark]}>
            {formatDistance(totalDistance)}
          </Text>
        </View>
      </View>
      
      {/* Action button to start/stop tracking */}
      <TouchableOpacity
        style={[
          styles.actionButton,
          isTracking ? styles.stopButton : styles.startButton,
          darkMode && (isTracking ? styles.stopButtonDark : styles.startButtonDark)
        ]}
        onPress={isTracking ? handleStopTracking : handleStartTracking}
      >
        <Text style={styles.actionButtonText}>
          {isTracking ? 'STOP' : 'START'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  controlsContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  controlButton: {
    backgroundColor: 'white',
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  controlButtonDark: {
    backgroundColor: '#212121',
  },
  statsPanel: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 12,
    padding: 16,
    width: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statsPanelDark: {
    backgroundColor: 'rgba(33, 33, 33, 0.85)',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#1f2937',
    fontSize: 14,
    marginBottom: 4,
  },
  statLabelDark: {
    color: '#e5e7eb',
  },
  statValue: {
    color: '#111827',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statValueDark: {
    color: '#ffffff',
  },
  actionButton: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  startButton: {
    backgroundColor: '#10b981',
  },
  stopButton: {
    backgroundColor: '#ef4444',
  },
  startButtonDark: {
    backgroundColor: '#059669',
  },
  stopButtonDark: {
    backgroundColor: '#dc2626',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  startMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  currentLocationMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentLocationDot: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#3b82f6',
    borderWidth: 2,
    borderColor: 'white',
  },
  distanceMarker: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  distanceMarkerText: {
    color: '#3b82f6',
    fontWeight: 'bold',
    fontSize: 12,
  },
  poiMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  callout: {
    width: 140,
    padding: 8,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  calloutText: {
    fontSize: 12,
  },
});

export default CustomMapRN;