# Migration Guide: Web to React Native

This document outlines how to port the current web implementation to React Native using the technologies specified:
- React Native + Expo
- react-native-maps (for mapping)
- expo-location (for location tracking)

## Modern Performance Features

To ensure the app runs efficiently and is future-proof:

### Hermes Engine
Enable Hermes JavaScript engine for improved startup time, reduced memory usage, and smaller app size:

```json
// app.json
{
  "expo": {
    "jsEngine": "hermes"
  }
}
```

### TurboModules and Fabric Support
Ensure libraries are compatible with the New Architecture:

```json
// app.json
{
  "expo": {
    "jsEngine": "hermes",
    "experiments": {
      "turboModules": true,
      "fabric": true
    }
  }
}
```

### React 18 Concurrent Features
Take advantage of React 18's concurrent features:

```jsx
// App.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-native/js/react-native-implementation';

const root = createRoot(rootTag);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

### Library Integration

The app will use these modern, high-performance libraries:

#### react-native-maps
Fully compatible with Fabric architecture when installed properly:
```bash
expo install react-native-maps
```

In app.json:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow $(PRODUCT_NAME) to use your location to track movement and calculate rewards."
        }
      ],
      [
        "react-native-maps",
        {
          "googleMapsApiKey": "YOUR_API_KEY_HERE"
        }
      ]
    ]
  }
}
```

#### react-native-tts
For advanced text-to-speech capabilities:
```bash
expo install react-native-tts
```

Configure permissions in app.json:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-speech",
        {
          "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone for voice commands."
        }
      ]
    ]
  }
}
```

## Location Tracking

### Web Implementation
The web version uses the browser's Geolocation API:
```javascript
navigator.geolocation.getCurrentPosition()
navigator.geolocation.watchPosition()
```

### React Native Implementation
For React Native, use expo-location with a comprehensive approach that includes:

1. Permission handling
2. Background tracking capability
3. Anti-cheat mechanisms
4. AsyncStorage for offline data persistence
5. Battery optimization

A complete implementation is available at `client/src/docs/useRealTimeLocationRN-mock.ts`, which demonstrates:

```javascript
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Request both foreground and background permissions
const requestPermissions = async () => {
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  
  if (foregroundStatus !== 'granted') {
    return false;
  }
  
  const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
  return backgroundStatus === 'granted';
};

// Start location tracking with anti-cheat
const startTracking = async () => {
  // Get initial location
  const currentLocation = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High
  });
  
  // Subscribe to location updates
  locationSubscription.current = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      distanceInterval: 10, // Update every 10 meters
      timeInterval: 5000    // Or every 5 seconds
    },
    newLocation => {
      // Anti-cheat: verify location change is reasonable
      if (previousLocation) {
        const isReasonable = isLocationChangeReasonable(
          previousLocation,
          newLocation.coords,
          60, // Max speed in km/h
          5   // Minimum accuracy in meters
        );
        
        if (!isReasonable) {
          console.warn('Suspicious movement detected');
          return;
        }
        
        // Calculate distance and update rewards
        updateDistance(newLocation.coords);
      }
      
      // Update location state
      setLocation(newLocation.coords);
      previousLocation = newLocation.coords;
    }
  );
};

// Save location data for offline use
const saveLocationHistory = async () => {
  await AsyncStorage.setItem(
    'locationHistory',
    JSON.stringify(locationHistory)
  );
  
  await AsyncStorage.setItem(
    'totalDistance',
    totalDistance.toString()
  );
};

// Battery optimization with background modes
const setupBackgroundTracking = async () => {
  await Location.startLocationUpdatesAsync('background-location-task', {
    accuracy: Location.Accuracy.Balanced,
    distanceInterval: 100,    // Less frequent updates in background
    timeInterval: 60000,      // Update every minute in background
    foregroundService: {
      notificationTitle: "Move to Earn",
      notificationBody: "Tracking your movement in background"
    },
    // iOS background mode with significant changes only
    pausesUpdatesAutomatically: true,
    activityType: Location.ActivityType.Fitness
  });
};
```

## Map Component

### Web Implementation
The web version uses a custom canvas-based implementation with manual path drawing.

### React Native Implementation
A complete implementation is available in `client/src/docs/CustomMapRN.tsx`, which demonstrates:

1. Visually stunning map with custom styling and dark mode
2. Real-time location tracking with animated markers
3. Path visualization and heatmap for frequently visited areas
4. Distance markers placed at kilometer intervals
5. Points of interest with custom icons
6. Comprehensive UI controls for user interaction

The map includes these advanced visual features:

```javascript
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, StyleSheet, Dimensions, TouchableOpacity, 
  Text, Animated
} from 'react-native';
import MapView, {
  Marker, Polyline, Circle, Heatmap, 
  PROVIDER_GOOGLE, Callout
} from 'react-native-maps';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRealTimeLocationRN } from '../hooks/useRealTimeLocationRN';

const CustomMapRN = () => {
  // State and refs
  const { location, locationHistory, totalDistance, isTracking } = useRealTimeLocationRN();
  const [darkMode, setDarkMode] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const mapRef = useRef(null);
  
  // Animated values for marker pulsing effect
  const pulseAnim = useRef(new Animated.Value(0.5)).current;
  
  // Start pulse animation
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
  
  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        customMapStyle={darkMode ? darkMapStyle : lightMapStyle}
        showsUserLocation={true}
        showsCompass={true}
        showsScale={true}
      >
        {/* Starting point marker */}
        {locationHistory && locationHistory.length > 0 && (
          <Marker coordinate={locationHistory[0]}>
            <View style={styles.startMarker}>
              <FontAwesome5 name="flag-checkered" size={24} color="#000000" />
            </View>
          </Marker>
        )}
        
        {/* Current location with pulsing effect */}
        {location && (
          <Marker coordinate={location}>
            <Animated.View style={[
              styles.currentLocationMarker,
              { transform: [{ scale: pulseAnim }] }
            ]}>
              <View style={styles.currentLocationDot} />
            </Animated.View>
          </Marker>
        )}
        
        {/* Path line */}
        {locationHistory && locationHistory.length > 1 && (
          <Polyline
            coordinates={locationHistory}
            strokeWidth={4}
            strokeColor="#3b82f6"
            lineCap="round"
            lineJoin="round"
          />
        )}
        
        {/* Heatmap for frequently visited areas */}
        {showHeatmap && (
          <Heatmap
            points={generateHeatmapPoints(locationHistory)}
            radius={40}
            opacity={0.7}
            gradient={{
              colors: ["#00ffff", "#0000ff", "#ff0000"],
              startPoints: [0.1, 0.5, 0.9],
            }}
          />
        )}
      </MapView>
      
      {/* Map controls, stats panel, and action buttons */}
    </View>
  );
};
```

The map supports custom styling with beautiful themes, including a nature-inspired retro style:

```javascript
// Import the map styles
import { retroNatureStyle } from './mapStyles';

// Use the retro nature style in the MapView component
<MapView
  customMapStyle={retroNatureStyle}
  provider={PROVIDER_GOOGLE}
  // other props...
>
  {/* Map content */}
</MapView>
```

The enhanced retro nature style creates a rich, detailed outdoor aesthetic with natural tones:

```javascript
// Nature-inspired retro adventure style (partial)
export const retroNatureStyle = [
  // Warm sand base color with increased saturation for terrain
  {
    "elementType": "geometry",
    "stylers": [
      { "color": "#e8ddcb" },
      { "saturation": 15 }
    ]
  },
  // Rich brown text with soft cream outline
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#4a3928" }]
  },
  // Varied natural terrain features with texture
  {
    "featureType": "landscape.natural.terrain",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#c6bb9f" },
      { "visibility": "on" }
    ]
  },
  // Vibrant green for parks with enhanced saturation
  {
    "featureType": "poi.park",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#a7bd74" },
      { "saturation": 15 },
      { "lightness": 5 }
    ]
  },
  // Golden highways with saturation boost
  {
    "featureType": "road.highway",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#f8c967" },
      { "lightness": 5 },
      { "saturation": 15 }
    ]
  },
  // Vibrant blue-green for water features
  {
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#abd9c6" },
      { "saturation": 10 },
      { "lightness": 5 }
    ]
  }
];
```

For a basic implementation with fewer visual features, see `client/src/docs/RealTimeLocationMapRN-mock.tsx`.

## UI Components

Replace web-specific UI components with React Native equivalents:

| Web Component | React Native Equivalent |
|---------------|-------------------------|
| `<div>` | `<View>` |
| `<p>`, `<span>` | `<Text>` |
| `<button>` | `<TouchableOpacity>` or `<Button>` |
| `<input>` | `<TextInput>` |
| `<canvas>` | Use react-native-maps `<Polyline>` for path drawing |
| CSS styles | StyleSheet.create() or styled-components |

## Anti-Cheat Mechanisms

The anti-cheat logic for detecting unreasonable movements can remain essentially the same, with only syntactical adjustments for React Native.

## Distance Calculation

The Haversine formula used for distance calculations is pure JavaScript and can be used in React Native without modification.

## Rewards Integration

A complete implementation of blockchain reward functionality is available in `client/src/docs/TokenMinterRN-mock.ts`. This example demonstrates:

1. Setting up Ethereum providers and wallets in React Native
2. Creating and recovering wallets with mnemonics
3. Interacting with MOVE token contracts
4. Securely storing private keys
5. Implementing "move-to-earn" reward calculations

The implementation uses ethers.js, which works in React Native:

```javascript
import { ethers } from 'ethers';
import Config from 'react-native-config'; // For environment variables
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get wallet and sign transactions
const getWallet = async () => {
  // Get private key from secure storage
  const privateKey = await AsyncStorage.getItem('wallet_private_key');
  
  const provider = new ethers.providers.JsonRpcProvider(
    Config.ETHEREUM_RPC_URL
  );
  
  const wallet = new ethers.Wallet(privateKey, provider);
  return wallet;
};

// Get token contract instance
const getTokenContract = async (signer) => {
  return new ethers.Contract(
    MOVE_TOKEN_ADDRESS, 
    MOVE_TOKEN_ABI, 
    signer
  );
};

// Reward user based on distance traveled
export const rewardUserForDistance = async (userAddress, distanceKm) => {
  // Calculate tokens based on distance (e.g., 10 tokens per km)
  const tokenAmount = distanceKm * 10;
  
  const wallet = await getWallet();
  const contract = await getTokenContract(wallet);
  
  // Call the reward function
  const tx = await contract.rewardUser(
    userAddress, 
    ethers.utils.parseUnits(tokenAmount.toString(), 18)
  );
  
  await tx.wait();
  
  return {
    success: true,
    hash: tx.hash,
    amount: tokenAmount
  };
};
```

## Voice Commands and TTS

For TTS in React Native, you have two primary options:

### Option 1: Expo Speech (Simple)
```javascript
import * as Speech from 'expo-speech';

// Speak text
Speech.speak(text, {
  language: 'en-US',
  rate: 1.0,
  pitch: 1.0
});

// Get available voices
const availableVoices = await Speech.getAvailableVoicesAsync();
```

### Option 2: react-native-tts (Advanced)
For more advanced features, including voice selection and control:

```bash
# Installation
npm install react-native-tts
```

Basic usage:
```javascript
import Tts from 'react-native-tts';

// Initialize
Tts.setDefaultRate(0.5);
Tts.setDefaultPitch(1.2);
Tts.setDefaultLanguage('en-US');

// Event listeners
Tts.addEventListener('tts-start', () => console.log('Started speaking'));
Tts.addEventListener('tts-finish', () => console.log('Finished speaking'));
Tts.addEventListener('tts-cancel', () => console.log('Speaking canceled'));

// Get available voices
const voices = await Tts.voices();
const filteredVoices = voices.filter(v => !v.networkConnectionRequired);

// Speak with selected voice
Tts.setDefaultVoice('com.apple.ttsbundle.Samantha-compact');
Tts.speak('Hello world');
```

### Voice Settings Screen
A complete implementation of a voice settings screen is available at `client/src/docs/TtsSettingsScreenRN-mock.tsx`. This example showcases:

- Loading and grouping available voices by language
- Selecting and persisting voice preferences with AsyncStorage
- Supporting multiple languages with appropriate font handling
- Speaking sample phrases in the selected language
- Performance optimization techniques

The implementation is based on the user-provided TTS settings screen code, which demonstrates:

```javascript
// Component implementation that loads voices by language and provides selection interface
const TtsSettingsScreen = () => {
  const [groupedVoices, setGroupedVoices] = useState([]);
  const [expandedLanguages, setExpandedLanguages] = useState({});
  const [selectedVoice, setSelectedVoice] = useState(null);
  
  // Load available voices
  const loadVoices = async () => {
    const allVoices = await Tts.voices();
    // Group voices by language
    // Display in an expandable list
  };
  
  // Select voice and speak sample phrases
  const selectVoice = async (voice) => {
    await AsyncStorage.setItem('selectedVoice', voice.id);
    Tts.setDefaultVoice(voice.id);
    Tts.speak(SAMPLE_PHRASES[voice.language] || SAMPLE_PHRASES['default']);
  };

  // Render section list of available voices grouped by language
  return (
    <SectionList
      sections={groupedVoices}
      renderItem={renderVoiceItem}
      renderSectionHeader={renderSectionHeader}
    />
  );
};
```

## Testing on Device

For optimal GPS testing:
1. Use Expo Go to run your app on a physical device
2. Enable background location tracking with:
```javascript
await Location.requestBackgroundPermissionsAsync();
await Location.startLocationUpdatesAsync(TASK_NAME, {
  accuracy: Location.Accuracy.High,
  distanceInterval: 10,
  timeInterval: 5000,
  foregroundService: {
    notificationTitle: "Move to Earn",
    notificationBody: "Tracking your movement"
  }
});
```

## Offline Capabilities

Use AsyncStorage to cache map data, previous routes, and rewards information for offline use in React Native:
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Save data
await AsyncStorage.setItem('locationHistory', JSON.stringify(locationHistory));

// Retrieve data
const storedHistory = await AsyncStorage.getItem('locationHistory');
if (storedHistory) {
  setLocationHistory(JSON.parse(storedHistory));
}
```

## Performance Optimizations

### React Native List Performance

For activity history lists, use optimized list components:

```jsx
import { FlatList } from 'react-native';

<FlatList
  data={activities}
  renderItem={({ item }) => <ActivityItem activity={item} />}
  keyExtractor={item => item.id.toString()}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
/>
```

### Memoization for Expensive Calculations

Use React.memo and useMemo to prevent unnecessary re-renders and calculations:

```jsx
// Memoize component
const ActivityItem = React.memo(({ activity }) => {
  // Component implementation
});

// Memoize expensive calculations
const sortedActivities = useMemo(() => {
  return [...activities].sort((a, b) => b.timestamp - a.timestamp);
}, [activities]);
```

### Image Optimization

Optimize map markers and images:

```jsx
import FastImage from 'react-native-fast-image';

// Use FastImage instead of Image for better performance
<FastImage
  source={require('../assets/marker.png')}
  style={styles.markerImage}
  resizeMode={FastImage.resizeMode.contain}
/>
```

### Minimize Bridge Traffic

Keep JavaScript and native communication minimal:

```jsx
// Batch updates instead of sending multiple small updates
const batchedLocations = [];

// Collect locations
batchedLocations.push(newLocation);

// Only send to native side when we have enough or after timeout
if (batchedLocations.length >= 10) {
  sendLocationsToNative(batchedLocations);
  batchedLocations = [];
}
```