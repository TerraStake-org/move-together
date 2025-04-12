import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useLocation } from '@/context/LocationContext';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Mapping of theme names to human-readable activity levels
const intensityLabels = {
  default: 'Resting',
  low: 'Walking',
  moderate: 'Jogging',
  high: 'Running',
  extreme: 'Sprinting',
};

const MovementIntensityIndicator = () => {
  const { theme, colors } = useTheme();
  const { location, isTracking } = useLocation();
  
  // Calculate speed in km/h
  const speedKmh = location?.speed ? (location.speed * 3.6).toFixed(1) : '0.0';
  
  // Determine progress percentage based on theme
  const getProgressPercentage = () => {
    switch (theme) {
      case 'low': return 20;
      case 'moderate': return 40;
      case 'high': return 70;
      case 'extreme': return 100;
      default: return 5;
    }
  };
  
  return (
    <div className="p-4 rounded-lg bg-black/20 backdrop-blur-sm border border-gray-800 mb-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex flex-col">
          <h3 className="text-sm font-medium text-gray-300">Movement Intensity</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge 
              style={{ backgroundColor: colors.primary, color: '#000' }}
              className="font-bold"
            >
              {intensityLabels[theme]}
            </Badge>
            <span className="text-xs text-gray-400">
              {isTracking ? `${speedKmh} km/h` : 'Not tracking'}
            </span>
          </div>
        </div>
        <div 
          className="w-6 h-6 rounded-full" 
          style={{ backgroundColor: colors.primary }}
        />
      </div>
      
      <Progress 
        value={getProgressPercentage()} 
        className="h-2 mt-2"
        style={{ 
          '--progress-background': colors.secondary,
        } as React.CSSProperties}
      />
    </div>
  );
};

export default MovementIntensityIndicator;