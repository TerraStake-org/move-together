import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from './LocationContext';

// Types for theme and color scheme
export type ThemeColorScheme = 'default' | 'low' | 'moderate' | 'high' | 'extreme';

// Color palette for different themes
type ColorPalette = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  gradient: string[];
};

// Theme context type
interface ThemeContextType {
  theme: ThemeColorScheme;
  colors: ColorPalette;
  setTheme: (theme: ThemeColorScheme) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: 'default',
  colors: {
    primary: '#FF6347', // Tomato (default primary color)
    secondary: '#3A86FF',
    accent: '#8338EC',
    background: '#121212',
    text: '#FFFFFF',
    gradient: ['#FF6347', '#FF8C42']
  },
  setTheme: () => {},
  isDarkMode: true,
  toggleDarkMode: () => {}
});

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

// Theme provider props
interface ThemeProviderProps {
  children: ReactNode;
}

// Theme provider component
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // State for theme and dark mode
  const [theme, setTheme] = useState<ThemeColorScheme>('default');
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Get location data for speed tracking
  const { location } = useLocation();
  
  // Detect movement intensity based on speed and update theme
  useEffect(() => {
    if (!location || location.speed === undefined) return;
    
    const speed = location.speed; // in m/s
    
    // Speed thresholds for different intensity levels
    // These can be adjusted based on your preference
    if (speed < 0.5) {  // < 0.5 m/s (< 1.8 km/h) - Standing or walking very slowly
      setTheme('default');
    } else if (speed < 1.4) {  // < 1.4 m/s (< 5 km/h) - Walking pace
      setTheme('low');
    } else if (speed < 3) {  // < 3 m/s (< 10.8 km/h) - Jogging
      setTheme('moderate');
    } else if (speed < 5) {  // < 5 m/s (< 18 km/h) - Running
      setTheme('high');
    } else {  // >= 5 m/s (>= 18 km/h) - Sprinting or vehicle
      setTheme('extreme');
    }
  }, [location]);
  
  // Toggle dark mode
  const toggleDarkMode = () => setIsDarkMode(prev => !prev);
  
  // Define color palettes for different intensity levels
  const getColorPalette = (): ColorPalette => {
    // Base colors for different intensity levels
    const themeColors = {
      default: {
        primary: '#FF6347', // Tomato
        secondary: '#3A86FF',
        accent: '#8338EC',
        background: isDarkMode ? '#121212' : '#F8F9FA',
        text: isDarkMode ? '#FFFFFF' : '#212529',
        gradient: ['#FF6347', '#FF8C42']
      },
      low: {
        primary: '#3A86FF', // Blue
        secondary: '#4CC9F0',
        accent: '#3A0CA3',
        background: isDarkMode ? '#121212' : '#F8F9FA',
        text: isDarkMode ? '#FFFFFF' : '#212529',
        gradient: ['#3A86FF', '#4CC9F0']
      },
      moderate: {
        primary: '#06D6A0', // Green
        secondary: '#1B9AAA',
        accent: '#118AB2',
        background: isDarkMode ? '#121212' : '#F8F9FA',
        text: isDarkMode ? '#FFFFFF' : '#212529',
        gradient: ['#06D6A0', '#1B9AAA']
      },
      high: {
        primary: '#FFD166', // Yellow/Gold
        secondary: '#F8C430',
        accent: '#F79824',
        background: isDarkMode ? '#121212' : '#F8F9FA',
        text: isDarkMode ? '#FFFFFF' : '#212529',
        gradient: ['#FFD166', '#F8C430']
      },
      extreme: {
        primary: '#EF476F', // Pink/Red
        secondary: '#F15BB5',
        accent: '#9B5DE5',
        background: isDarkMode ? '#121212' : '#F8F9FA',
        text: isDarkMode ? '#FFFFFF' : '#212529',
        gradient: ['#EF476F', '#F15BB5']
      }
    };
    
    return themeColors[theme];
  };
  
  // Context value
  const contextValue: ThemeContextType = {
    theme,
    colors: getColorPalette(),
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