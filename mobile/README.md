# MOVE - Move-to-Earn Mobile App

A cutting-edge mobile application that transforms physical activity into a rewarding blockchain-powered experience, combining location tracking, voice interactions, and cryptocurrency incentives.

## Features

- **GPS-based Location Tracking**: Real-time tracking of movement with distance calculation and path visualization
- **MOVE Token Rewards**: Earn MOVE tokens for physical activity
- **Staking System**: Stake MOVE tokens and earn rewards
- **Voice Feedback**: Customizable voice announcements for workout stats
- **Multi-language Support**: TTS support for various languages
- **Anti-cheat Mechanisms**: Advanced detection to ensure genuine movement
- **Modern UI**: Beautiful and intuitive dark-themed interface

## Project Setup

### Prerequisites

- Node.js 16+
- Expo CLI: `npm install -g expo-cli`
- For iOS development: macOS with Xcode installed
- For Android development: Android Studio with Android SDK

### Installation

1. Clone the repository
2. Navigate to the project directory:
   ```
   cd mobile
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npx expo start
   ```

### Running on Device/Simulator

- iOS (requires macOS):
  ```
  npx expo run:ios
  ```

- Android:
  ```
  npx expo run:android
  ```

- Web (for testing):
  ```
  npx expo start:web
  ```

## Project Structure

```
mobile/
├── assets/                # Static assets like images
├── src/
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── navigation/        # Navigation configuration
│   ├── screens/           # App screens
│   ├── styles/            # Global styles and theme
│   └── web3/              # Blockchain integration
├── App.tsx                # Main app entry point
├── app.json               # Expo configuration
└── package.json           # Project dependencies
```

## Key Technologies

- **React Native**: Cross-platform mobile framework
- **Expo**: Development toolchain and platform
- **React Navigation**: Screen navigation
- **Expo Location**: GPS and location services
- **Expo Speech**: Text-to-speech functionality
- **Ethers.js**: Ethereum blockchain interactions
- **React Native Maps**: Interactive map visualization
- **Expo Secure Store**: Secure storage for wallet keys

## Blockchain Integration

The app interacts with two smart contracts on the Ethereum blockchain:

1. **MOVE Token Contract**: ERC-20 token earned through physical activity
2. **Staking Contract**: Allows users to stake MOVE tokens and earn rewards

## Development Notes

- Location tracking works in both foreground and background modes
- Anti-cheat mechanisms detect unreasonable movement patterns
- Voice feedback uses the device's TTS capabilities
- The app uses secure storage for wallet credentials
- Offline functionality is available for core features

## License

Copyright © 2025 MOVE App. All rights reserved.