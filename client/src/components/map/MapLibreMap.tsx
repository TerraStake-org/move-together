import React from 'react';
import { useLocation } from '@/context/LocationContext';

// A completely static offline map component with no external dependencies or canvas
// This displays location data and activity information without using any maps

interface MapLibreMapProps {
  location: { latitude: number; longitude: number } | null;
  onToggleMapType: () => void;
}

const MapLibreMap: React.FC<MapLibreMapProps> = ({ location, onToggleMapType }) => {
  const { locations, isTracking, totalDistance } = useLocation();
  
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
    return val.toFixed(6);
  };
  
  return (
    <div className="relative w-full h-full flex flex-col items-center bg-slate-900 text-white">
      {/* Heading */}
      <div className="w-full bg-slate-800 p-4 text-center">
        <h2 className="text-lg font-semibold">Offline Mode</h2>
        <p className="text-slate-400 text-sm">Using device GPS coordinates without map tiles</p>
      </div>
      
      {/* Grid background with dot pattern */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full opacity-10" 
          style={{
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`, 
            backgroundSize: '20px 20px'
          }}
        />
      </div>
      
      {/* Location indicators */}
      <div className="relative z-10 flex-1 w-full flex flex-col items-center justify-center p-4 space-y-8">
        {location ? (
          <>
            {/* Pulsing location indicator */}
            <div className="relative">
              <div className="absolute -inset-8 bg-blue-500/20 rounded-full animate-pulse"></div>
              <div className="relative w-16 h-16 bg-slate-800 rounded-full border-4 border-blue-500 flex items-center justify-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              </div>
            </div>
            
            {/* Location details */}
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 w-full max-w-sm">
              <h3 className="text-center mb-4 font-semibold text-lg">Current Location</h3>
              
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-slate-400">Latitude:</div>
                <div className="font-mono">{formatCoords(location.latitude)}</div>
                <div className="text-slate-400">Longitude:</div>
                <div className="font-mono">{formatCoords(location.longitude)}</div>
                <div className="text-slate-400">Speed:</div>
                <div>{location.speed ? `${(location.speed * 3.6).toFixed(1)} km/h` : 'Not available'}</div>
                <div className="text-slate-400">Distance traveled:</div>
                <div>{totalDistance.toFixed(2)} km</div>
                <div className="text-slate-400">Current pace:</div>
                <div>{calculatePace()}</div>
              </div>
            </div>
            
            {/* Path visualization */}
            {locations.length > 1 && (
              <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 w-full max-w-sm">
                <h3 className="text-center mb-2 font-semibold">Path Data</h3>
                <div className="text-sm text-center text-slate-400 mb-4">
                  {locations.length} waypoints recorded
                </div>
                
                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500" 
                    style={{ width: `${Math.min(totalDistance / 10 * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-1 text-slate-400">
                  <span>0 km</span>
                  <span>5 km</span>
                  <span>10 km</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center">
            <div className="text-xl mb-2">No Location Data</div>
            <p className="text-slate-400">
              Please enable location services to see your position
            </p>
          </div>
        )}
      </div>
      
      {/* Bottom panel */}
      <div className="w-full bg-slate-800 p-4">
        <button 
          onClick={onToggleMapType}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
        >
          Switch to Online Map
        </button>
      </div>
    </div>
  );
};

export default MapLibreMap;