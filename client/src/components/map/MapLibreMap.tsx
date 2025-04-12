import React, { useState, useEffect } from 'react';
import { useLocation } from '@/context/LocationContext';
import { useTheme } from '@/context/ThemeContext';
import { Check, CheckCircle, MapPin, LocateFixed, Navigation } from 'lucide-react';

// A high-quality static offline map component with no external dependencies
// This displays location data and activity information without using any map tiles

interface MapLibreMapProps {
  location: { latitude: number; longitude: number; speed?: number; timestamp?: number } | null;
  onToggleMapType: () => void;
}

const MapLibreMap: React.FC<MapLibreMapProps> = ({ location, onToggleMapType }) => {
  const { locations, isTracking, totalDistance } = useLocation();
  const { theme, colors } = useTheme();
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  
  // Update elapsed time when tracking
  useEffect(() => {
    if (!isTracking || locations.length < 1 || !locations[0].timestamp) return;
    
    const timer = setInterval(() => {
      const startTime = locations[0].timestamp || 0;
      setElapsedTime(Date.now() - startTime);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isTracking, locations]);
  
  // Format time display (HH:MM:SS)
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Calculate pace based on latest data
  const calculatePace = () => {
    if (!locations || locations.length < 2) return "-- min/km";
    
    const firstPoint = locations[0];
    const lastPoint = locations[locations.length - 1];
    
    if (!firstPoint.timestamp || !lastPoint.timestamp) return "-- min/km";
    
    const timeInMinutes = (lastPoint.timestamp - firstPoint.timestamp) / 60000; // convert ms to minutes
    if (timeInMinutes <= 0 || totalDistance <= 0) return "-- min/km";
    
    const paceMinPerKm = timeInMinutes / totalDistance;
    const paceMin = Math.floor(paceMinPerKm);
    const paceSec = Math.floor((paceMinPerKm - paceMin) * 60);
    
    return `${paceMin}:${paceSec.toString().padStart(2, '0')} min/km`;
  };
  
  // Format coordinates
  const formatCoords = (val: number): string => {
    return val.toFixed(5);
  };

  // Generate grid lines for the background
  const generateGrid = () => {
    const lines = [];
    const count = 20; // number of lines in each direction
    
    // Create 20x20 grid
    for (let i = 1; i < count; i++) {
      const position = `${i * (100 / count)}%`;
      // Horizontal lines
      lines.push({
        left: 0,
        top: position,
        right: 0,
        width: '100%',
        height: '1px',
      });
      
      // Vertical lines
      lines.push({
        top: 0,
        left: position,
        bottom: 0,
        width: '1px',
        height: '100%',
      });
    }
    
    return lines;
  };
  
  // Calculate calories based on distance and time
  // Simple estimation (70kg person burns ~65 calories per km)
  const calculateCalories = (): number => {
    return Math.round(totalDistance * 65);
  };
  
  return (
    <div className="relative w-full h-full flex flex-col bg-black text-white overflow-hidden">
      {/* Stats header */}
      <div className="w-full bg-gradient-to-r from-blue-900 to-purple-900 p-4 z-10">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center">
            <LocateFixed className="mr-2 text-emerald-400" size={20} />
            Offline GPS Mode
          </h2>
          <div className="bg-blue-500/20 px-3 py-1 rounded-full text-blue-200 text-sm font-medium">
            {isTracking ? 'Tracking Active' : 'Tracking Paused'}
          </div>
        </div>
      </div>
      
      {/* Grid background */}
      <div className="absolute inset-0 z-0 opacity-15">
        <div className="relative w-full h-full">
          <div className="absolute inset-0" 
            style={{
              background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.2) 0%, transparent 70%)'
            }} 
          />
          
          {generateGrid().map((line, index) => (
            <div
              key={index}
              className="absolute bg-blue-500/30"
              style={line}
            />
          ))}
        </div>
      </div>
      
      {/* Main content */}
      <div className="relative z-1 flex-1 p-4 flex flex-col">
        {/* Map area with animated effect */}
        <div className="relative flex-1 rounded-xl overflow-hidden mb-4 border border-blue-900/50 bg-gradient-to-b from-slate-900 to-blue-900/30">
          {/* Coordinate grid lines - more subtle */}
          <div className="absolute inset-0 opacity-10">
            {Array.from({ length: 10 }).map((_, i) => (
              <React.Fragment key={`grid-${i}`}>
                <div className="absolute bg-white/30 h-px w-full" style={{ top: `${i * 10}%` }} />
                <div className="absolute bg-white/30 w-px h-full" style={{ left: `${i * 10}%` }} />
              </React.Fragment>
            ))}
          </div>
          
          {/* Location marker */}
          {location ? (
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              {/* Accuracy circle */}
              <div className="w-40 h-40 rounded-full border-2 border-blue-500/20 absolute -left-20 -top-20 animate-pulse" />
              <div className="w-24 h-24 rounded-full border-2 border-blue-500/40 absolute -left-12 -top-12" />
              
              {/* Direction indicator */}
              <div className="absolute -left-6 -top-20 transform -rotate-45">
                <Navigation size={24} className="text-blue-400" />
              </div>
              
              {/* Center point */}
              <div className="w-12 h-12 rounded-full bg-blue-900 border-4 border-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <div className="w-4 h-4 rounded-full bg-blue-400 animate-ping absolute" />
                <div className="w-3 h-3 rounded-full bg-blue-300" />
              </div>
              
              {/* Pulsing effect */}
              <div className="absolute w-40 h-40 -left-20 -top-20">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="100" cy="100" r="50" fill="none" stroke="rgba(59, 130, 246, 0.5)" strokeWidth="1">
                    <animate attributeName="r" values="40;80;40" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0.2;0.8" dur="3s" repeatCount="indefinite" />
                  </circle>
                </svg>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center bg-slate-900/80 p-6 rounded-lg">
                <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mb-4 mx-auto"></div>
                <h3 className="text-xl font-semibold mb-2">Acquiring GPS Signal</h3>
                <p className="text-slate-400">Please enable location services</p>
              </div>
            </div>
          )}
          
          {/* Path traces */}
          {locations.length > 1 && (
            <div className="absolute inset-0">
              <svg width="100%" height="100%" className="opacity-70">
                <defs>
                  <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
                <path
                  d="M 100,100 L 150,150 L 200,120 L 250,180"
                  stroke="url(#path-gradient)"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="1,0"
                />
              </svg>
            </div>
          )}
          
          {/* Coordinates overlay */}
          {location && (
            <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm p-3 rounded-lg text-sm">
              <div className="text-slate-400 text-xs mb-1">COORDINATES</div>
              <div className="font-mono">
                {formatCoords(location.latitude)}, {formatCoords(location.longitude)}
              </div>
              {location.speed !== undefined && (
                <div className="mt-1 text-emerald-400 font-semibold">
                  {(location.speed * 3.6).toFixed(1)} km/h
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Metrics cards */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4">
            <div className="text-slate-400 text-xs mb-1">DISTANCE</div>
            <div className="text-2xl font-bold">
              {totalDistance.toFixed(2)} 
              <span className="text-sm text-slate-400 ml-1">km</span>
            </div>
            <div className="mt-1 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500" 
                style={{ width: `${Math.min(totalDistance * 10, 100)}%` }} 
              />
            </div>
          </div>
          
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4">
            <div className="text-slate-400 text-xs mb-1">DURATION</div>
            <div className="text-2xl font-bold">
              {formatTime(elapsedTime)}
            </div>
            <div className="flex items-center mt-1 text-xs text-slate-400">
              <div className="mr-1 text-emerald-400">
                <Check size={12} />
              </div>
              Active tracking
            </div>
          </div>
          
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4">
            <div className="text-slate-400 text-xs mb-1">PACE</div>
            <div className="text-2xl font-bold">
              {calculatePace()}
            </div>
            <div className="flex items-center mt-1 text-xs text-slate-400">
              Average moving speed
            </div>
          </div>
          
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4">
            <div className="text-slate-400 text-xs mb-1">CALORIES</div>
            <div className="text-2xl font-bold">
              {calculateCalories()}
              <span className="text-sm text-slate-400 ml-1">kcal</span>
            </div>
            <div className="flex items-center mt-1 text-xs text-slate-400">
              Estimated burn rate
            </div>
          </div>
        </div>
        
        {/* Waypoints summary */}
        {locations.length > 0 && (
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Recorded Path</h3>
              <div className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded-full">
                {locations.length} waypoints
              </div>
            </div>
            
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500" 
                style={{ width: `${Math.min(totalDistance / 10 * 100, 100)}%` }}
              />
            </div>
            
            <div className="flex justify-between text-xs mt-2 text-slate-400">
              <div className="flex items-center">
                <CheckCircle size={12} className="text-emerald-400 mr-1" />
                Start
              </div>
              <div>2.5 km</div>
              <div>5 km</div>
              <div>7.5 km</div>
              <div>10 km</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom action bar */}
      <div className="w-full bg-gradient-to-r from-blue-900 to-purple-900 p-4 z-10">
        <button 
          onClick={onToggleMapType}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors flex items-center justify-center"
        >
          <MapPin className="mr-2" size={18} />
          Switch to Online Map
        </button>
      </div>
    </div>
  );
};

export default MapLibreMap;