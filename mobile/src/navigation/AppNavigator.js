import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';

// Import screens
import MapScreen from '../screens/MapScreen';
import WalletScreen from '../screens/WalletScreen';
import RewardsScreen from '../screens/RewardsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#FF6347', // Tomato color
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#121212',
          borderTopColor: '#333',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: '#121212',
          borderBottomColor: '#333',
          borderBottomWidth: 1,
          elevation: 0, // for Android
          shadowOpacity: 0, // for iOS
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="map" color={color} size={size} />
          ),
          headerShown: false, // Hide header on map screen for fullscreen map
        }}
      />
      <Tab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="account-balance-wallet" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Rewards"
        component={RewardsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="redeem" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="settings" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;