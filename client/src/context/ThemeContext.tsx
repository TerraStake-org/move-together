import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from '@/context/LocationContext';

// Define our theme color types
type ThemeColorScheme = 'default' | 'low' | 'moderate' | 'high' | 'extreme';

// Define color palette for each intensity level
type ColorPalette = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  gradient: string[];
};

// Theme color palettes for different intensity levels
const colorPalettes: Record<ThemeColorScheme, ColorPalette> = {
  default: {
    primary: '#FF6347', // Tomato
    secondary: '#4A90E2', // Blue
    accent: '#50C878', // Emerald
    background: '#121212', // Dark
    text: '#FFFFFF', // White
    gradient: ['#121212', '#1E1E1E']
  },
  low: {
    primary: '#5D93E1', // Cool blue
    secondary: '#41B883', // Mint green
    accent: '#7EB6FF', // Light blue
    background: '#121212', // Dark
    text: '#E1E1E1', // Light grey
    gradient: ['#121215', '#171730']
  },
  moderate: {
    primary: '#41B883', // Mint green
    secondary: '#F7D44C', // Yellow
    accent: '#6CC551', // Lime green
    background: '#121212', // Dark
    text: '#FFFFFF', // White
    gradient: ['#111820', '#172218']
  },
  high: {
    primary: '#F7D44C', // Yellow
    secondary: '#FF8A65', // Orange
    accent: '#FFD740', // Amber
    background: '#121212', // Dark
    text: '#FFFFFF', // White
    gradient: ['#1A1500', '#231A00']
  },
  extreme: {
    primary: '#FF5252', // Red
    secondary: '#FF1744', // Bright red
    accent: '#FF8A80', // Light red
    background: '#121212', // Dark
    text: '#FFFFFF', // White
    gradient: ['#1A0000', '#290000']
  }
};

// Define the shape of our theme context
interface ThemeContextType {
  theme: ThemeColorScheme;
  colors: ColorPalette;
  setTheme: (theme: ThemeColorScheme) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

// Create the context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: 'default',
  colors: colorPalettes.default,
  setTheme: () => {},
  isDarkMode: true,
  toggleDarkMode: () => {},
});

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

// Threshold values for speed in km/h to determine intensity levels
const SPEED_THRESHOLDS = {
  WALKING: 4, // 4 km/h is typical walking speed
  JOGGING: 8, // 8 km/h is jogging
  RUNNING: 12, // 12 km/h is running
  SPRINTING: 18 // 18 km/h is very fast
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<ThemeColorScheme>('default');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { location, isTracking } = useLocation();
  
  // Calculate current speed based on location updates
  useEffect(() => {
    if (!isTracking || !location || !location.timestamp) return;
    
    // Simple speed calculation in km/h
    // In a real app, we'd use a more sophisticated algorithm that averages recent speeds
    const speedKmPerHour = location.speed ? location.speed * 3.6 : 0; // Convert m/s to km/h
    
    // Set theme based on movement intensity
    if (speedKmPerHour < SPEED_THRESHOLDS.WALKING) {
      setTheme('low');
    } else if (speedKmPerHour < SPEED_THRESHOLDS.JOGGING) {
      setTheme('moderate');
    } else if (speedKmPerHour < SPEED_THRESHOLDS.RUNNING) {
      setTheme('high');
    } else if (speedKmPerHour >= SPEED_THRESHOLDS.SPRINTING) {
      setTheme('extreme');
    }
    
  }, [location, isTracking]);
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
    // Update document class for global styling
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };
  
  // Prepare the context value
  const contextValue: ThemeContextType = {
    theme,
    colors: colorPalettes[theme], // Get the colors for the current theme
    setTheme,
    isDarkMode,
    toggleDarkMode
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};