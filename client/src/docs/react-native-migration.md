# Migration Guide: Web to React Native

This document outlines how to port the current web implementation to React Native using the technologies specified:
- React Native + Expo
- react-native-maps (for mapping)
- expo-location (for location tracking)

## Location Tracking

### Web Implementation
The web version uses the browser's Geolocation API:
```javascript
navigator.geolocation.getCurrentPosition()
navigator.geolocation.watchPosition()
```

### React Native Implementation
For React Native, use expo-location:
```javascript
import * as Location from 'expo-location';

// Request permissions
const { status } = await Location.requestForegroundPermissionsAsync();

// Get current location
const currentLocation = await Location.getCurrentPositionAsync({
  accuracy: Location.Accuracy.High
});

// Subscribe to location updates
const subscription = await Location.watchPositionAsync(
  {
    accuracy: Location.Accuracy.High,
    distanceInterval: 10, // Update every 10 meters
    timeInterval: 5000, // Update every 5 seconds
  },
  (newLocation) => {
    // Handle location update
  }
);

// Clean up
subscription.remove();
```

## Map Component

### Web Implementation
The web version uses a custom canvas-based implementation with manual path drawing.

### React Native Implementation
Replace with react-native-maps:
```javascript
import MapView, { Marker, Polyline } from 'react-native-maps';

// Basic map with marker
<MapView
  style={{ flex: 1 }}
  region={{
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  }}
  showsUserLocation={true}
  followsUserLocation={true}
>
  <Marker
    coordinate={location}
    title="Your Location"
  />
  
  {/* Path tracking */}
  <Polyline
    coordinates={locationHistory}
    strokeColor="#3b82f6"
    strokeWidth={3}
  />
</MapView>
```

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

The Web3/blockchain integration should work similarly in React Native, but you'll need to:
1. Use react-native-dotenv for environment variables
2. Use a React Native compatible Web3 library like ethers.js (which works in React Native)

## Voice Commands

For TTS in React Native:
```javascript
import * as Speech from 'expo-speech';

// Speak text
Speech.speak(text, {
  language: 'en-US',
  rate: 1.0,
  pitch: 1.0
});
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