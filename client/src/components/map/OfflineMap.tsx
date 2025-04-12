import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from '@/context/LocationContext';

interface Location {
  latitude: number;
  longitude: number;
  timestamp?: number;
}

interface OfflineMapProps {
  location: Location | null;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleMapType: () => void;
  onGoToCurrentLocation: () => void;
}

// Enhanced version for real-time movement tracking
export default function OfflineMap({ 
  location, 
  onZoomIn, 
  onZoomOut, 
  onToggleMapType, 
  onGoToCurrentLocation 
}: OfflineMapProps) {
  const { isTracking, totalDistance } = useLocation();
  const [locationHistory, setLocationHistory] = useState<Location[]>([]);
  const [mapZoom, setMapZoom] = useState(14); // Mock zoom level 1-20
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'terrain'>('standard');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Format coordinates for display
  const formattedCoords = location 
    ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` 
    : 'No location data';
    
  // Add current location to history if tracking is active
  useEffect(() => {
    if (isTracking && location) {
      setLocationHistory(prev => {
        // Only add if the location actually changed (to avoid duplicates)
        if (prev.length === 0) return [location];
        
        const lastLoc = prev[prev.length - 1];
        if (lastLoc.latitude !== location.latitude || lastLoc.longitude !== location.longitude) {
          return [...prev, location];
        }
        return prev;
      });
    } else if (!isTracking) {
      // If not tracking, keep the path visible but don't add new points
    }
  }, [location, isTracking]);
  
  // Clear history when tracking starts
  useEffect(() => {
    if (isTracking) {
      setLocationHistory(location ? [location] : []);
    }
  }, [isTracking]);
  
  // Draw the path on the canvas when locationHistory updates
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || locationHistory.length < 2) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set line style
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#3b82f6'; // Primary color
    
    // Find min/max coords to determine bounds
    let minLat = Number.MAX_VALUE;
    let maxLat = Number.MIN_VALUE;
    let minLng = Number.MAX_VALUE;
    let maxLng = Number.MIN_VALUE;
    
    locationHistory.forEach(loc => {
      minLat = Math.min(minLat, loc.latitude);
      maxLat = Math.max(maxLat, loc.latitude);
      minLng = Math.min(minLng, loc.longitude);
      maxLng = Math.max(maxLng, loc.longitude);
    });
    
    // Add some margin
    const latMargin = (maxLat - minLat) * 0.1;
    const lngMargin = (maxLng - minLng) * 0.1;
    
    minLat -= latMargin;
    maxLat += latMargin;
    minLng -= lngMargin;
    maxLng += lngMargin;
    
    // Make sure we have valid bounds
    if (minLat === maxLat) {
      minLat -= 0.001;
      maxLat += 0.001;
    }
    if (minLng === maxLng) {
      minLng -= 0.001;
      maxLng += 0.001;
    }
    
    // Function to convert lat/lng to canvas coordinates
    const latLngToCanvas = (lat: number, lng: number) => {
      const x = ((lng - minLng) / (maxLng - minLng)) * canvas.width;
      const y = ((maxLat - lat) / (maxLat - minLat)) * canvas.height;
      return { x, y };
    };
    
    // Draw the path
    ctx.beginPath();
    
    // Start at first point
    const start = latLngToCanvas(locationHistory[0].latitude, locationHistory[0].longitude);
    ctx.moveTo(start.x, start.y);
    
    // Draw lines to each subsequent point
    for (let i = 1; i < locationHistory.length; i++) {
      const point = latLngToCanvas(locationHistory[i].latitude, locationHistory[i].longitude);
      ctx.lineTo(point.x, point.y);
    }
    
    ctx.stroke();
    
    // Draw points along the path
    locationHistory.forEach((loc, index) => {
      const { x, y } = latLngToCanvas(loc.latitude, loc.longitude);
      
      // Draw larger marker for start and current position
      if (index === 0 || index === locationHistory.length - 1) {
        ctx.fillStyle = index === 0 ? '#10b981' : '#3b82f6';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
      } else if (index % 5 === 0) { // Draw smaller markers every few points
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
  }, [locationHistory]);
  
  // Handle map control functions
  const handleZoomIn = () => {
    setMapZoom(prev => Math.min(prev + 1, 20));
    onZoomIn();
  };
  
  const handleZoomOut = () => {
    setMapZoom(prev => Math.max(prev - 1, 1));
    onZoomOut();
  };
  
  const handleToggleMapType = () => {
    setMapType(prev => {
      switch (prev) {
        case 'standard': return 'satellite';
        case 'satellite': return 'terrain';
        case 'terrain': return 'standard';
      }
    });
    onToggleMapType();
  };
  
  // Map style based on selected type
  const getMapBackground = () => {
    switch (mapType) {
      case 'satellite': return '#263238';
      case 'terrain': return '#2d3742';
      default: return '#242f3e';
    }
  };
  
  // Map style
  const mapStyle = {
    height: '400px',
    backgroundColor: getMapBackground(),
    position: 'relative' as const,
    overflow: 'hidden' as const,
    color: 'white'
  };
  
  return (
    <div className="relative">
      <div style={mapStyle} className="rounded-lg">
        {/* Canvas for drawing the path */}
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={300} 
          className="absolute top-0 left-0 w-full h-full"
        />
        
        {/* Map UI */}
        <div className="w-full h-full flex flex-col items-center justify-center bg-dark-gray">
          {/* Status Info Box */}
          <div className="absolute top-4 left-4 bg-dark/80 rounded-lg p-3 z-10 text-left max-w-[200px]">
            <div className="text-sm font-medium mb-1">
              <span className={`inline-block w-2 h-2 rounded-full ${isTracking ? 'bg-secondary animate-pulse' : 'bg-gray-500'} mr-2`}></span>
              {isTracking ? 'GPS Tracking Active' : 'Tracking Paused'}
            </div>
            <div className="text-xs text-gray-300 mb-1">
              Current coordinates:
            </div>
            <p className="font-mono text-xs text-primary truncate">{formattedCoords}</p>
            
            {isTracking && (
              <div className="mt-2 text-xs text-gray-300">
                Distance: <span className="text-secondary">{totalDistance.toFixed(2)} km</span>
              </div>
            )}
          </div>
          
          {/* Map Type Indicator */}
          <div className="absolute top-4 right-16 bg-dark/80 rounded-lg px-2 py-1 text-xs font-mono">
            {mapType.charAt(0).toUpperCase() + mapType.slice(1)}
          </div>
          
          {/* Location Animation */}
          {location && (
            <div className="absolute" style={{ 
              left: '50%', 
              top: '50%', 
              transform: 'translate(-50%, -50%)' 
            }}>
              <div className="relative">
                {/* Accuracy circle */}
                <div className="absolute w-20 h-20 rounded-full bg-primary bg-opacity-10 animate-pulse" 
                  style={{ top: '-40px', left: '-40px' }}></div>
                
                {/* Direction indicator (animated when moving) */}
                {isTracking && (
                  <div className="absolute w-0 h-0" style={{ top: '-4px', left: '-6px' }}>
                    <div className="w-12 h-12 border-t-4 border-primary rotate-45 rounded-full border-l-transparent border-r-transparent border-b-transparent"></div>
                  </div>
                )}
                
                {/* User location dot */}
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                </div>
              </div>
            </div>
          )}
          
          {!location && (
            <div className="flex flex-col items-center justify-center">
              <div className="text-xl mb-2">Waiting for GPS Signal...</div>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
        
        {/* Map Overlay (Gradients) */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark to-transparent pointer-events-none"></div>
        
        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <Button
            variant="secondary"
            size="icon"
            className="bg-dark-gray/80 hover:bg-dark-gray p-2 rounded-full shadow-lg"
            onClick={handleZoomIn}
          >
            <span className="material-icons">add</span>
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="bg-dark-gray/80 hover:bg-dark-gray p-2 rounded-full shadow-lg"
            onClick={handleZoomOut}
          >
            <span className="material-icons">remove</span>
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="bg-dark-gray/80 hover:bg-dark-gray p-2 rounded-full shadow-lg"
            onClick={handleToggleMapType}
          >
            <span className="material-icons">layers</span>
          </Button>
        </div>
        
        {/* Current Location Button */}
        <Button 
          variant="default"
          className="absolute bottom-24 right-4 bg-primary hover:bg-primary/90 p-2 rounded-full shadow-lg"
          onClick={onGoToCurrentLocation}
        >
          <span className="material-icons">my_location</span>
        </Button>
        
        {/* Zoom Level */}
        <div className="absolute bottom-4 left-4 text-xs font-mono bg-dark/80 px-2 py-1 rounded-md">
          Zoom: {mapZoom}
        </div>
      </div>
    </div>
  );
}
