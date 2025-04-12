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