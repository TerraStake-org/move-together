import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from '@/context/LocationContext';
import { useTheme } from '@/context/ThemeContext';
import { Plus, Minus, Layers, MapPin } from 'lucide-react';

interface Location {
  latitude: number;
  longitude: number;
  timestamp?: number;
}

interface SimpleMapProps {
  location: Location | null;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleMapType: () => void;
  onGoToCurrentLocation: () => void;
}

export default function SimpleMap({ 
  location, 
  onZoomIn, 
  onZoomOut, 
  onToggleMapType, 
  onGoToCurrentLocation 
}: SimpleMapProps) {
  const { isTracking, totalDistance } = useLocation();
  const { theme } = useTheme();
  const [locationHistory, setLocationHistory] = useState<Location[]>([]);
  const [mapZoom, setMapZoom] = useState(14);
  const [mapType, setMapType] = useState<'dark' | 'modern' | 'neon' | 'retro'>('modern');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
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
    }
  }, [isTracking, location]);
  
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
    
    // Set line style based on map type
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Create different styles based on the map type
    switch (mapType) {
      case 'neon':
        // Neon blue glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00f2ff';
        ctx.strokeStyle = '#00f2ff';
        break;
      case 'retro':
        // Retro warm gradient
        const gradientRetro = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradientRetro.addColorStop(0, '#e6b980');
        gradientRetro.addColorStop(1, '#eacda3');
        ctx.strokeStyle = gradientRetro;
        break;
      case 'modern':
        // Blue gradient for modern style
        const gradientModern = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradientModern.addColorStop(0, '#60a5fa');
        gradientModern.addColorStop(1, '#3b82f6');
        ctx.strokeStyle = gradientModern;
        break;
      default: // dark
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#3b82f6';
        ctx.strokeStyle = '#3b82f6';
    }
    
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
    const latMargin = (maxLat - minLat) * 0.2;
    const lngMargin = (maxLng - minLng) * 0.2;
    
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
    const start = latLngToCanvas(locationHistory[0].latitude, locationHistory[0].longitude);
    ctx.moveTo(start.x, start.y);
    
    for (let i = 1; i < locationHistory.length; i++) {
      const point = latLngToCanvas(locationHistory[i].latitude, locationHistory[i].longitude);
      ctx.lineTo(point.x, point.y);
    }
    
    ctx.stroke();
    
    // Add start point marker
    const startPoint = latLngToCanvas(locationHistory[0].latitude, locationHistory[0].longitude);
    ctx.beginPath();
    ctx.arc(startPoint.x, startPoint.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981'; // Green
    ctx.fill();
    
    // Add end point marker (current location)
    const endPoint = latLngToCanvas(
      locationHistory[locationHistory.length - 1].latitude, 
      locationHistory[locationHistory.length - 1].longitude
    );
    ctx.beginPath();
    ctx.arc(endPoint.x, endPoint.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = mapType === 'neon' ? '#00f2ff' : 
                   mapType === 'retro' ? '#e6b980' : '#3b82f6';
    ctx.fill();
    
    // Draw distance markers every 1km
    if (totalDistance > 1) {
      const kmMarkers = Math.floor(totalDistance);
      const segmentLength = 1 / totalDistance;
      
      for (let km = 1; km <= kmMarkers; km++) {
        const segmentPosition = km * segmentLength;
        const index = Math.floor(segmentPosition * (locationHistory.length - 1));
        
        if (index > 0 && index < locationHistory.length) {
          const markerPoint = latLngToCanvas(
            locationHistory[index].latitude,
            locationHistory[index].longitude
          );
          
          ctx.beginPath();
          ctx.arc(markerPoint.x, markerPoint.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#f59e0b'; // Amber
          ctx.fill();
          
          ctx.fillStyle = 'white';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(km.toString(), markerPoint.x, markerPoint.y);
        }
      }
    }
  }, [locationHistory, mapType, totalDistance]);
  
  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    const resizeObserver = new ResizeObserver(() => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      
      // Need to redraw after resize
      const event = new Event('locationhistoryupdate');
      window.dispatchEvent(event);
    });
    
    resizeObserver.observe(container);
    
    // Set initial size
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  
  // Handle triggered redraw after resize
  useEffect(() => {
    const handleLocationHistoryUpdate = () => {
      // This will trigger the draw effect
      setLocationHistory(prev => [...prev]);
    };
    
    window.addEventListener('locationhistoryupdate', handleLocationHistoryUpdate);
    
    return () => {
      window.removeEventListener('locationhistoryupdate', handleLocationHistoryUpdate);
    };
  }, []);
  
  // Zoom handlers
  const handleZoomIn = () => {
    setMapZoom(prev => Math.min(prev + 1, 20));
    onZoomIn();
  };
  
  const handleZoomOut = () => {
    setMapZoom(prev => Math.max(prev - 1, 1));
    onZoomOut();
  };
  
  // Map type toggle
  const handleToggleMapType = () => {
    setMapType(prev => {
      switch (prev) {
        case 'modern': return 'dark';
        case 'dark': return 'neon';
        case 'neon': return 'retro';
        case 'retro': return 'modern';
        default: return 'modern';
      }
    });
    onToggleMapType();
  };
  
  // Set map type based on movement intensity theme
  useEffect(() => {
    const mapStyleForTheme = theme === 'default' ? 'dark' : 
                            theme === 'low' ? 'dark' : 
                            theme === 'moderate' ? 'retro' : 'neon';
    setMapType(mapStyleForTheme);
  }, [theme]);
  
  // Generate map grid for visual effect
  const generateMapGrid = () => {
    const gridSize = 20;
    let gridLines = [];
    
    for (let i = 0; i <= gridSize; i++) {
      // Horizontal lines
      gridLines.push(`linear-gradient(0deg, 
        transparent calc(${i * (100/gridSize)}% - 1px), 
        rgba(255,255,255,0.1) calc(${i * (100/gridSize)}% - 1px), 
        rgba(255,255,255,0.1) calc(${i * (100/gridSize)}% + 1px),
        transparent calc(${i * (100/gridSize)}% + 1px)
      )`);
      
      // Vertical lines
      gridLines.push(`linear-gradient(90deg, 
        transparent calc(${i * (100/gridSize)}% - 1px), 
        rgba(255,255,255,0.1) calc(${i * (100/gridSize)}% - 1px), 
        rgba(255,255,255,0.1) calc(${i * (100/gridSize)}% + 1px),
        transparent calc(${i * (100/gridSize)}% + 1px)
      )`);
    }
    
    return gridLines.join(', ');
  };

  // Get background style based on map type
  const getBackgroundStyle = () => {
    switch(mapType) {
      case 'neon':
        return 'linear-gradient(135deg, #000428 0%, #004e92 100%)';
      case 'retro':
        return 'linear-gradient(135deg, #e6b980 0%, #eacda3 100%)';
      case 'modern':
        return 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)';
      default: // dark
        return 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)';
    }
  };

  // Generate map elements (streets, landmarks, etc.)
  const MapElements = () => (
    <>
      {/* Grid streets */}
      {Array.from({ length: 7 }).map((_, i) => {
        const offset = i - 3;
        if (offset === 0) return null; // Skip center
        return (
          <React.Fragment key={`road-${i}`}>
            {/* Horizontal roads */}
            <div className="absolute"
              style={{
                top: `calc(50% + ${offset * 15}%)`,
                left: '5%',
                width: '90%',
                height: '3px',
                background: mapType === 'neon' 
                  ? 'rgba(0, 242, 255, 0.3)' 
                  : mapType === 'retro'
                    ? 'rgba(230, 185, 128, 0.3)'
                    : 'rgba(59, 130, 246, 0.3)'
              }}
            />
            
            {/* Vertical roads */}
            <div className="absolute"
              style={{
                top: '5%',
                left: `calc(50% + ${offset * 15}%)`,
                width: '3px',
                height: '90%',
                background: mapType === 'neon' 
                  ? 'rgba(0, 242, 255, 0.3)' 
                  : mapType === 'retro'
                    ? 'rgba(230, 185, 128, 0.3)'
                    : 'rgba(59, 130, 246, 0.3)'
              }}
            />
          </React.Fragment>
        );
      })}
      
      {/* Park area */}
      <div className="absolute rounded-[40%]"
        style={{
          top: '30%',
          left: '65%',
          width: '25%',
          height: '20%',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}
      />
      
      {/* Water area */}
      <div className="absolute rounded-[50%]"
        style={{
          top: '15%',
          left: '25%',
          width: '20%',
          height: '15%',
          background: 'rgba(59, 130, 246, 0.15)',
          border: '1px solid rgba(59, 130, 246, 0.3)'
        }}
      />
      
      {/* Commercial district */}
      <div className="absolute rounded-md"
        style={{
          top: '60%',
          left: '20%',
          width: '30%',
          height: '25%',
          background: 'rgba(249, 115, 22, 0.1)',
          border: '1px solid rgba(249, 115, 22, 0.2)'
        }}
      />
    </>
  );

  // User location marker component
  const UserMarker = () => {
    if (!location) return null;
    
    return (
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-15 pointer-events-none">
        <div className="relative">
          {/* Accuracy circle */}
          <div className="absolute w-24 h-24 rounded-full bg-blue-500/10 animate-ping"
            style={{ top: '-48px', left: '-48px' }}>
          </div>
          
          {/* Inner accuracy circle */}
          <div className="absolute w-16 h-16 rounded-full bg-blue-500/20"
            style={{ top: '-32px', left: '-32px' }}>
          </div>
          
          {/* Direction indicator */}
          {isTracking && (
            <div className="absolute" style={{ top: '-5px', left: '-5px' }}>
              <div className="w-10 h-10 border-t-2 border-blue-500 rotate-45 rounded-full border-l-transparent border-r-transparent border-b-transparent"></div>
            </div>
          )}
          
          {/* User location dot */}
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white"></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-full">
      <div 
        ref={containerRef}
        className="w-full h-full rounded-lg overflow-hidden relative" 
        style={{
          background: getBackgroundStyle(),
          backgroundSize: 'cover'
        }}
      >
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 w-full h-full" 
          style={{ backgroundImage: generateMapGrid() }}
        />
        
        {/* Map elements layer */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <MapElements />
        </div>
        
        {/* Canvas for drawing the path */}
        <canvas 
          ref={canvasRef} 
          className="absolute top-0 left-0 w-full h-full z-10"
        />
        
        {/* User location marker */}
        <UserMarker />
        
        {/* Show loading when no location */}
        {!location && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-xl text-white mb-2">Waiting for GPS Signal...</div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
        
        {/* Status overlay */}
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white p-3 rounded-lg text-sm z-20">
          <div className="flex items-center mb-1">
            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${isTracking ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`}></span>
            {isTracking ? 'GPS Tracking Active' : 'Tracking Paused'}
          </div>
          <div className="text-xs text-slate-300 mb-1">Current coordinates:</div>
          <div className="font-mono text-xs text-slate-100">{formattedCoords}</div>
          
          {isTracking && (
            <div className="mt-2 text-xs text-slate-300">
              Distance: <span className="text-white font-semibold">{totalDistance.toFixed(2)} km</span>
            </div>
          )}
        </div>
        
        {/* Map type indicator */}
        <div className="absolute top-4 right-16 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded text-xs z-20">
          {mapType.toUpperCase()}
        </div>
        
        {/* Bottom gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent z-30"></div>
        
        {/* Map controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2 z-40">
          <Button
            variant="secondary"
            size="icon"
            className="bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white"
            onClick={handleZoomIn}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white"
            onClick={handleZoomOut}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white"
            onClick={handleToggleMapType}
          >
            <Layers className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Current location button */}
        <Button 
          variant="secondary"
          className="absolute bottom-24 right-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full z-40"
          onClick={onGoToCurrentLocation}
        >
          <MapPin className="h-4 w-4 mr-1" />
          Center
        </Button>
        
        {/* Zoom level indicator */}
        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white px-2 py-1 text-xs rounded z-40">
          Zoom: {mapZoom}
        </div>
      </div>
    </div>
  );
}