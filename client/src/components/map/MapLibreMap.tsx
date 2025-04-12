import React, { useRef, useState, useEffect } from 'react';
import { useLocation } from '@/context/LocationContext';

// A simple offline-first map component that doesn't rely on MapLibre GL
// This component displays a grid background with user position and path visualization

interface MapLibreMapProps {
  location: { latitude: number; longitude: number } | null;
  onToggleMapType: () => void;
}

const MapLibreMap: React.FC<MapLibreMapProps> = ({ location, onToggleMapType }) => {
  const { locations, isTracking } = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewCenter, setViewCenter] = useState<{x: number, y: number}>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(16); // Default zoom level
  
  // Simple mercator projection for lat/lng to pixel coordinates
  const project = (lat: number, lng: number, centerLat: number, centerLng: number, zoom: number) => {
    // Simplified projection - not accurate for large distances but works for visualization
    const scale = Math.pow(2, zoom) * 10;
    const x = (lng - centerLng) * scale;
    const y = (lat - centerLat) * scale * -1; // Invert Y since latitude increases northward
    return { x, y };
  };
  
  // Draw the map
  useEffect(() => {
    if (!canvasRef.current || !location) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to match container
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Center coordinates (user's current location)
    const centerLat = location.latitude;
    const centerLng = location.longitude;
    
    // Clear canvas
    ctx.fillStyle = '#141414';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = -20; i <= 20; i++) {
      const gridLat = centerLat + (i * 0.001); // grid spacing
      const { x, y } = project(gridLat, centerLng, centerLat, centerLng, zoom);
      ctx.beginPath();
      ctx.moveTo(0, canvas.height/2 + y);
      ctx.lineTo(canvas.width, canvas.height/2 + y);
      ctx.stroke();
    }
    
    // Vertical grid lines
    for (let i = -20; i <= 20; i++) {
      const gridLng = centerLng + (i * 0.001); // grid spacing
      const { x, y } = project(centerLat, gridLng, centerLat, centerLng, zoom);
      ctx.beginPath();
      ctx.moveTo(canvas.width/2 + x, 0);
      ctx.lineTo(canvas.width/2 + x, canvas.height);
      ctx.stroke();
    }
    
    // Draw path
    if (locations.length >= 2) {
      ctx.strokeStyle = '#3b82f6'; // blue
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      
      locations.forEach((loc, idx) => {
        const { x, y } = project(loc.latitude, loc.longitude, centerLat, centerLng, zoom);
        if (idx === 0) {
          ctx.moveTo(canvas.width/2 + x, canvas.height/2 + y);
        } else {
          ctx.lineTo(canvas.width/2 + x, canvas.height/2 + y);
        }
      });
      
      ctx.stroke();
    }
    
    // Draw user location marker
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height/2, 10, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height/2, 10, 0, Math.PI * 2);
    ctx.stroke();
    
    // Add pulse effect
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height/2, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    
  }, [location, locations, zoom]);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = canvasRef.current.offsetWidth;
        canvasRef.current.height = canvasRef.current.offsetHeight;
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative w-full h-full bg-slate-900">
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button 
          onClick={() => setZoom(prev => Math.min(prev + 1, 22))}
          className="w-10 h-10 bg-slate-800 text-white rounded-md flex items-center justify-center shadow-lg"
        >
          +
        </button>
        <button 
          onClick={() => setZoom(prev => Math.max(prev - 1, 10))}
          className="w-10 h-10 bg-slate-800 text-white rounded-md flex items-center justify-center shadow-lg"
        >
          -
        </button>
      </div>
      
      {/* Info overlay */}
      <div className="absolute bottom-4 left-4 bg-slate-800/70 text-white p-3 rounded-lg shadow-lg">
        <div className="text-sm font-mono">
          <div>Offline Mode</div>
          {location && (
            <>
              <div>Lat: {location.latitude.toFixed(5)}</div>
              <div>Lng: {location.longitude.toFixed(5)}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapLibreMap;