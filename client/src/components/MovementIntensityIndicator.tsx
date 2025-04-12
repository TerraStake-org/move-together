import React, { useEffect, useState } from 'react';
import { useTheme, ThemeColorScheme } from '@/context/ThemeContext';
import { useLocation } from '@/context/LocationContext';
import { Activity, Flame, Gauge, Wind, Zap } from 'lucide-react';

/**
 * An enhanced component that visualizes the user's current movement intensity
 * and adapts the app's color theme accordingly with animations and dynamic effects
 */
export default function MovementIntensityIndicator() {
  const { theme, colors } = useTheme();
  const { location } = useLocation();
  const [animating, setAnimating] = useState(false);
  const [prevTheme, setPrevTheme] = useState<ThemeColorScheme>('default');
  
  // Get speed (if available) from location data
  const speed = location?.speed || 0;
  
  // Detect theme changes to trigger animations
  useEffect(() => {
    if (theme !== prevTheme) {
      setAnimating(true);
      const timer = setTimeout(() => setAnimating(false), 1000);
      setPrevTheme(theme);
      return () => clearTimeout(timer);
    }
  }, [theme, prevTheme]);
  
  // Calculate the current intensity level based on theme
  const intensityPercentage = theme === 'default' ? 0 :
                             theme === 'low' ? 25 :
                             theme === 'moderate' ? 50 :
                             theme === 'high' ? 75 : 100;

  // Helper to generate styled gradient for each intensity level
  const getIntensityGradient = (level: ThemeColorScheme) => {
    switch(level) {
      case 'default': return 'from-gray-400 to-gray-500';
      case 'low': return 'from-blue-400 to-blue-600';
      case 'moderate': return 'from-green-400 to-emerald-600';
      case 'high': return 'from-amber-400 to-yellow-600';
      case 'extreme': return 'from-rose-400 to-red-600';
    }
  };
  
  // Get icon based on intensity level
  const getIntensityIcon = (level: ThemeColorScheme) => {
    switch(level) {
      case 'default': return <Activity size={20} />;
      case 'low': return <Wind size={20} />;
      case 'moderate': return <Gauge size={20} />;
      case 'high': return <Flame size={20} />;
      case 'extreme': return <Zap size={20} />;
    }
  };
  
  // Get intensity description
  const getIntensityDescription = (level: ThemeColorScheme): string => {
    switch(level) {
      case 'default': return 'Resting or standing';
      case 'low': return 'Walking slowly';
      case 'moderate': return 'Steady pace';
      case 'high': return 'Fast movement';
      case 'extreme': return 'Sprinting';
    }
  };
  
  // Speed thresholds for different intensity levels (in km/h)
  const speedThresholds = [0, 5, 10.8, 18, 25];
  
  // Format speed for display in proper units
  const formatSpeed = (speedInMetersPerSecond: number): string => {
    const speedInKmh = speedInMetersPerSecond * 3.6; // Convert m/s to km/h
    return speedInKmh.toFixed(1);
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border transition-all duration-500 ${
      theme === 'default' ? 'border-gray-700 bg-gray-900/70' :
      theme === 'low' ? 'border-blue-900 bg-blue-950/70' :
      theme === 'moderate' ? 'border-emerald-900 bg-emerald-950/70' :
      theme === 'high' ? 'border-amber-900 bg-amber-950/70' :
      'border-rose-900 bg-rose-950/70'
    } backdrop-blur-sm p-4`}>
      {/* Pulsing animation on theme change */}
      {animating && (
        <div className="absolute inset-0 opacity-30 animate-pulse-fast"
          style={{ 
            background: `radial-gradient(circle, ${colors.primary}55 0%, transparent 70%)`,
            animation: 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
        />
      )}
    
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <div className={`mr-3 p-2 rounded-full bg-opacity-20 ${
            theme === 'default' ? 'bg-gray-500' :
            theme === 'low' ? 'bg-blue-500' :
            theme === 'moderate' ? 'bg-emerald-500' :
            theme === 'high' ? 'bg-amber-500' :
            'bg-rose-500'
          }`}>
            {getIntensityIcon(theme)}
          </div>
          <div>
            <h3 className="text-md font-semibold text-white">Movement Intensity</h3>
            <p className="text-xs opacity-70">{getIntensityDescription(theme)}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className={`flex items-center font-mono text-xl font-bold ${
            theme === 'default' ? 'text-gray-400' :
            theme === 'low' ? 'text-blue-400' :
            theme === 'moderate' ? 'text-emerald-400' :
            theme === 'high' ? 'text-amber-400' :
            'text-rose-400'
          }`}>
            {formatSpeed(speed)}
            <span className="text-xs ml-1 opacity-60">km/h</span>
          </div>
          <span className="text-xs opacity-60">Current Speed</span>
        </div>
      </div>
      
      {/* Intensity Bar */}
      <div className="h-3 bg-black/30 rounded-full overflow-hidden mb-2 backdrop-blur">
        <div 
          className={`h-full bg-gradient-to-r ${getIntensityGradient(theme)} transition-all duration-700 ease-out`}
          style={{ width: `${intensityPercentage}%` }}
        >
          {/* Animated stripe effect */}
          <div className="w-full h-full opacity-30"
            style={{
              backgroundImage: 'linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)',
              backgroundSize: '1rem 1rem',
              animation: 'progress-stripe 1s linear infinite'
            }}
          />
        </div>
      </div>
      
      {/* Labels with markers */}
      <div className="flex justify-between text-xs opacity-70 relative">
        {['Resting', 'Low', 'Moderate', 'High', 'Extreme'].map((label, index) => {
          // Map the label to the corresponding theme value
          const themeValue = index === 0 ? 'default' : 
                            index === 1 ? 'low' : 
                            index === 2 ? 'moderate' : 
                            index === 3 ? 'high' : 'extreme';
                            
          return (
            <div key={label} className="flex flex-col items-center">
              <div className={`w-1 h-1 rounded-full mb-1 ${theme === themeValue ? 'bg-white' : 'bg-gray-600'}`}></div>
              <span className={theme === themeValue ? 'font-medium text-white' : ''}>
                {label}
              </span>
              <span className="text-xs opacity-50 mt-1">{speedThresholds[index]}+ km/h</span>
            </div>
          );
        })}
      </div>
      
      {/* Theme Adaptations Info */}
      <div className="mt-4 pt-3 border-t border-white/10 text-xs">
        <div className="flex items-center">
          <div className={`h-2 w-2 rounded-full mr-2 animate-pulse ${
            theme === 'default' ? 'bg-gray-400' :
            theme === 'low' ? 'bg-blue-400' :
            theme === 'moderate' ? 'bg-emerald-400' :
            theme === 'high' ? 'bg-amber-400' :
            'bg-rose-400'
          }`}></div>
          <span className="opacity-70">
            Theme adapting to intensity level: <span className="font-semibold capitalize">{theme === 'default' ? 'Resting' : theme}</span>
          </span>
        </div>
      </div>
      
      {/* Add CSS keyframes for animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse-fast {
            0%, 100% { opacity: 0.1; }
            50% { opacity: 0.3; }
          }
          @keyframes progress-stripe {
            0% { background-position: 0 0; }
            100% { background-position: 1rem 0; }
          }
        `
      }} />
    </div>
  );
}