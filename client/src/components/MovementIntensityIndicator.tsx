import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useLocation } from '@/context/LocationContext';

/**
 * A component that visualizes the user's current movement intensity
 * and adapts the app's color theme accordingly
 */
export default function MovementIntensityIndicator() {
  const { theme, colors } = useTheme();
  const { location } = useLocation();
  
  // Get speed (if available) from location data
  const speed = location?.speed || 0;
  
  // Calculate the current intensity level based on theme
  const intensityPercentage = theme === 'default' ? 0 :
                             theme === 'low' ? 25 :
                             theme === 'moderate' ? 50 :
                             theme === 'high' ? 75 : 100;

  // Helper to generate color for each intensity level
  const getIntensityColor = (level: 'default' | 'low' | 'moderate' | 'high' | 'extreme') => {
    switch(level) {
      case 'default': return 'bg-gray-400';
      case 'low': return 'bg-blue-400';
      case 'moderate': return 'bg-green-500';
      case 'high': return 'bg-yellow-500';
      case 'extreme': return 'bg-red-500';
    }
  };
  
  // Format speed for display in proper units
  const formatSpeed = (speedInMetersPerSecond: number): string => {
    const speedInKmh = speedInMetersPerSecond * 3.6; // Convert m/s to km/h
    return speedInKmh.toFixed(1);
  };

  return (
    <div className="mb-6 bg-dark-gray rounded-xl p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-md font-medium text-white">Movement Intensity</h3>
        <div className="flex items-center">
          <span className="material-icons text-primary mr-1">speed</span>
          <span className="text-sm">{formatSpeed(speed)} km/h</span>
        </div>
      </div>
      
      {/* Intensity Bar */}
      <div className="h-2.5 bg-gray-200/10 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getIntensityColor(theme)} transition-all duration-500 ease-out`}
          style={{ width: `${intensityPercentage}%` }}
        ></div>
      </div>
      
      {/* Labels */}
      <div className="flex justify-between mt-1 text-xs text-gray-400">
        <span>Low</span>
        <span>Moderate</span>
        <span>High</span>
        <span>Extreme</span>
      </div>
      
      {/* Current Theme Status */}
      <div className="flex items-center justify-center mt-3">
        <div className={`h-2 w-2 rounded-full ${getIntensityColor(theme)} mr-2`}></div>
        <span className="text-xs text-gray-300">
          Current Intensity: <span className="text-white font-medium capitalize">{theme === 'default' ? 'Resting' : theme}</span>
        </span>
      </div>
    </div>
  );
}