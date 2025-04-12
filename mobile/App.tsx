import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { LocationProvider } from './src/hooks/useRealTimeLocation';
import { Web3Provider } from './src/web3/Web3Context';

export default function App() {
  return (
    <SafeAreaProvider>
      <Web3Provider>
        <LocationProvider>
          <NavigationContainer>
            <AppNavigator />
            <StatusBar style="light" />
          </NavigationContainer>
        </LocationProvider>
      </Web3Provider>
    </SafeAreaProvider>
  );
}