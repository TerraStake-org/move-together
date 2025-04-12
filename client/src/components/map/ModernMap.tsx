import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from '@/context/LocationContext';
import { useTheme } from '@/context/ThemeContext';
import { modernMapStyles } from '@/styles/mapStyle';
import { Plus, Minus, Layers, MapPin } from 'lucide-react';

interface Location {
  latitude: number;
  longitude: number;
  timestamp?: number;
}

interface ModernMapProps {
  location: Location | null;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleMapType: () => void;
  onGoToCurrentLocation: () => void;
}

export default function ModernMap({ 
  location, 
  onZoomIn, 
  onZoomOut, 
  onToggleMapType, 
  onGoToCurrentLocation 
}: ModernMapProps) {
  const { isTracking, totalDistance } = useLocation();
  const { theme, colors } = useTheme();
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
    
    // Set line style based on map type
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Determine style based on map type
    switch(mapType) {
      case 'neon':
        ctx.shadowColor = '#00f2ff';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = '#00f2ff';
        break;
      case 'modern':
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#3b82f6';
        ctx.strokeStyle = '#3b82f6';
        break;
      case 'retro':
        ctx.shadowBlur = 0;
        // Create gradient for path
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#f8c967'); // Golden color for highways
        gradient.addColorStop(0.5, '#a7bd74'); // Green for nature areas
        gradient.addColorStop(1, '#f8c967');
        ctx.strokeStyle = gradient;
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
        // Determine colors based on map type and point type
        let fillColor;
        let strokeColor;
        
        switch(mapType) {
          case 'neon':
            fillColor = index === 0 ? '#00ff9d' : '#00f2ff';
            strokeColor = index === 0 ? '#00cc7d' : '#00c4cc';
            break;
          case 'retro':
            fillColor = index === 0 ? '#a7bd74' : '#f8c967';
            strokeColor = index === 0 ? '#83945c' : '#e5b75f';
            break;
          default: // dark
            fillColor = index === 0 ? '#10b981' : '#3b82f6';
            strokeColor = index === 0 ? '#059669' : '#2563eb';
        }
        
        // Draw point
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Add ring around important points
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.stroke();
        
        // Restore line settings for path
        switch(mapType) {
          case 'neon':
            ctx.strokeStyle = '#00f2ff';
            break;
          case 'retro':
            ctx.strokeStyle = '#f59e0b';
            break;
          default:
            ctx.strokeStyle = '#3b82f6';
        }
        ctx.lineWidth = 5;
      } 
      // Draw smaller markers every few points
      else if (index % 5 === 0) {
        let dotColor;
        
        switch(mapType) {
          case 'neon':
            dotColor = '#00f2ff80';
            break;
          case 'retro':
            dotColor = index % 15 === 0 ? '#c6bb9f' : '#abd9c6';
            break;
          default:
            dotColor = '#3b82f680';
        }
        
        ctx.fillStyle = dotColor;
        ctx.beginPath();
        ctx.arc(x, y, mapType === 'retro' ? 5 : 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
  }, [locationHistory, mapType]);
  
  // Adjust canvas size on resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      
      if (canvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        
        // Redraw after resize
        if (locationHistory.length >= 2) {
          const event = new Event('resize');
          window.dispatchEvent(event);
        }
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
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
  
  // Use theme from ThemeContext to determine map type
  const handleToggleMapType = () => {
    // Map from theme type to our map style
    const themeToMapStyleMap = {
      'default': 'dark',
      'low': 'dark',
      'moderate': 'retro',
      'high': 'neon',
      'extreme': 'neon'
    };
    
    // Allow manual toggle for user control, but initialize from theme
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
  
  // Map background patterns for different styles
  const getMapPattern = () => {
    const currentStyle = modernMapStyles[mapType];
    return {
      background: currentStyle.background,
      backgroundImage: currentStyle.pattern
    };
  };

  return (
    <div className="relative">
      <div 
        ref={containerRef}
        className="w-full h-[400px] rounded-lg overflow-hidden relative"
        style={{
          ...getMapPattern(),
          background: mapType === 'neon' 
            ? 'linear-gradient(135deg, #000428 0%, #004e92 100%)' 
            : mapType === 'retro' 
              ? 'linear-gradient(135deg, #e6b980 0%, #eacda3 100%)'
              : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
        }}
      >
        {/* Canvas for drawing the path */}
        <canvas 
          ref={canvasRef} 
          className="absolute top-0 left-0 w-full h-full z-10"
        />
        
        {/* Map Overlay */}
        <div className="w-full h-full absolute top-0 left-0 z-20 pointer-events-none">
          {/* Status Info Box */}
          <div className={`absolute top-4 left-4 pointer-events-auto ${
            mapType === 'neon'
              ? 'bg-blue-900/80 text-blue-100 border border-[#00f2ff]/50'
              : mapType === 'retro'
                ? 'bg-amber-800/80 text-amber-50 border border-amber-600/50'
                : 'bg-dark/80'
          } rounded-lg p-3 text-left max-w-[200px]`}>
            <div className="text-sm font-medium mb-1">
              <span className={`inline-block w-2 h-2 rounded-full ${
                isTracking 
                  ? (mapType === 'neon'
                      ? 'bg-[#00f2ff] animate-pulse'
                      : mapType === 'retro'
                        ? 'bg-amber-400 animate-pulse'
                        : 'bg-primary animate-pulse') 
                  : 'bg-gray-500'
              } mr-2`}></span>
              {isTracking ? 'GPS Tracking Active' : 'Tracking Paused'}
            </div>
            <div className={`text-xs ${
              mapType === 'neon'
                ? 'text-blue-200'
                : mapType === 'retro'
                  ? 'text-amber-200'
                  : 'text-gray-300'
            } mb-1`}>
              Current coordinates:
            </div>
            <p className={`font-mono text-xs ${
              mapType === 'neon'
                ? 'text-[#00f2ff]'
                : mapType === 'retro'
                  ? 'text-amber-300'
                  : 'text-primary'
            } truncate`}>{formattedCoords}</p>
            
            {isTracking && (
              <div className={`mt-2 text-xs ${
                mapType === 'neon'
                  ? 'text-blue-200'
                  : mapType === 'retro'
                    ? 'text-amber-200'
                    : 'text-gray-300'
              }`}>
                Distance: <span className={
                  mapType === 'neon'
                    ? 'text-[#00f2ff] font-semibold'
                    : mapType === 'retro'
                      ? 'text-amber-300 font-semibold'
                      : 'text-primary'
                }>
                  {totalDistance.toFixed(2)} km
                </span>
              </div>
            )}
          </div>
          
          {/* Map Type Indicator */}
          <div className={`absolute top-4 right-16 pointer-events-auto ${
            mapType === 'neon'
              ? 'bg-blue-900/80 text-blue-100 border border-[#00f2ff]/50'
              : mapType === 'retro'
                ? 'bg-amber-800/80 text-amber-50 border border-amber-600/50'
                : 'bg-dark/80'
          } rounded-lg px-2 py-1 text-xs font-mono`}>
            {mapType.charAt(0).toUpperCase() + mapType.slice(1)}
          </div>
          
          {/* Location Animation */}
          {location && (
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="relative">
                {/* Accuracy circle - pulsing effect */}
                <div className={`absolute w-24 h-24 rounded-full ${
                  mapType === 'neon'
                    ? 'bg-[#00f2ff] bg-opacity-10'
                    : mapType === 'retro'
                      ? 'bg-amber-500 bg-opacity-10'
                      : 'bg-primary bg-opacity-10'
                } animate-ping`} 
                  style={{ top: '-48px', left: '-48px' }}></div>
                
                {/* Smaller accuracy circle */}
                <div className={`absolute w-16 h-16 rounded-full ${
                  mapType === 'neon'
                    ? 'bg-[#00f2ff] bg-opacity-20'
                    : mapType === 'retro'
                      ? 'bg-amber-500 bg-opacity-20'
                      : 'bg-primary bg-opacity-20'
                }`} 
                  style={{ top: '-32px', left: '-32px' }}></div>
                
                {/* Direction indicator (animated when moving) */}
                {isTracking && (
                  <div className="absolute" style={{ top: '-5px', left: '-5px' }}>
                    <div className={`w-10 h-10 ${
                      mapType === 'neon'
                        ? 'border-t-[3px] border-[#00f2ff]'
                        : mapType === 'retro'
                          ? 'border-t-[3px] border-amber-600'
                          : 'border-t-[3px] border-primary'
                    } rotate-45 rounded-full border-l-transparent border-r-transparent border-b-transparent`}></div>
                  </div>
                )}
                
                {/* User location dot - main dot */}
                <div className={`w-6 h-6 rounded-full ${
                  mapType === 'neon'
                    ? 'bg-[#00f2ff]'
                    : mapType === 'retro'
                      ? 'bg-amber-600'
                      : 'bg-primary'
                } flex items-center justify-center ${
                  mapType === 'neon'
                    ? 'ring-2 ring-[#00f2ff]/70 ring-opacity-70 shadow-lg shadow-[#00f2ff]/50'
                    : mapType === 'retro'
                      ? 'ring-2 ring-amber-800 ring-opacity-50'
                      : 'ring-2 ring-primary/50 ring-opacity-50'
                }`}>
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                </div>
              </div>
            </div>
          )}
          
          {!location && (
            <div className="flex flex-col items-center justify-center h-full">
              <div className={`text-xl mb-2 ${
                mapType === 'neon'
                  ? 'text-[#00f2ff]'
                  : mapType === 'retro'
                    ? 'text-amber-800'
                    : 'text-primary'
              }`}>Waiting for GPS Signal...</div>
              <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                mapType === 'neon'
                  ? 'border-[#00f2ff]'
                  : mapType === 'retro'
                    ? 'border-amber-600'
                    : 'border-primary'
              }`}></div>
            </div>
          )}
        </div>
        
        {/* Map Overlay (Gradients) */}
        <div className={`absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-30 ${
          mapType === 'neon'
            ? 'bg-gradient-to-t from-blue-900/70 to-transparent'
            : mapType === 'retro'
              ? 'bg-gradient-to-t from-amber-900/40 to-transparent'
              : 'bg-gradient-to-t from-dark to-transparent'
        }`}></div>
        
        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2 z-40 pointer-events-auto">
          <Button
            variant="secondary"
            size="icon"
            className={`${
              mapType === 'neon'
                ? 'bg-blue-900/80 hover:bg-blue-900 text-[#00f2ff] border border-[#00f2ff]/50'
                : mapType === 'retro'
                  ? 'bg-amber-50/80 hover:bg-amber-50 text-amber-900'
                  : 'bg-dark-gray/80 hover:bg-dark-gray'
            } p-2 rounded-full shadow-lg`}
            onClick={handleZoomIn}
          >
            <Plus className="h-5 w-5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className={`${
              mapType === 'neon'
                ? 'bg-blue-900/80 hover:bg-blue-900 text-[#00f2ff] border border-[#00f2ff]/50'
                : mapType === 'retro'
                  ? 'bg-amber-50/80 hover:bg-amber-50 text-amber-900'
                  : 'bg-dark-gray/80 hover:bg-dark-gray'
            } p-2 rounded-full shadow-lg`}
            onClick={handleZoomOut}
          >
            <Minus className="h-5 w-5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className={`${
              mapType === 'neon'
                ? 'bg-blue-900/80 hover:bg-blue-900 text-[#00f2ff] border border-[#00f2ff]/50'
                : mapType === 'retro'
                  ? 'bg-amber-50/80 hover:bg-amber-50 text-amber-900'
                  : 'bg-dark-gray/80 hover:bg-dark-gray'
            } p-2 rounded-full shadow-lg`}
            onClick={handleToggleMapType}
          >
            <Layers className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Current Location Button */}
        <Button 
          variant="default"
          className={`absolute bottom-24 right-4 z-40 pointer-events-auto ${
            mapType === 'neon'
              ? 'bg-[#00f2ff] hover:bg-[#00d7df] text-blue-900'
              : mapType === 'retro'
                ? 'bg-amber-600 hover:bg-amber-700 text-amber-50'
                : 'bg-primary hover:bg-primary/90'
          } p-2 rounded-full shadow-lg`}
          onClick={onGoToCurrentLocation}
        >
          <MapPin className="h-5 w-5" />
        </Button>
        
        {/* Zoom Level */}
        <div className={`absolute bottom-4 left-4 text-xs font-mono z-40 pointer-events-auto ${
          mapType === 'neon'
            ? 'bg-blue-900/80 text-[#00f2ff] border border-[#00f2ff]/50'
            : mapType === 'retro'
              ? 'bg-amber-800/70 text-amber-50'
              : 'bg-dark/80'
        } px-2 py-1 rounded-md`}>
          Zoom: {mapZoom}
        </div>
      </div>
    </div>
  );
}