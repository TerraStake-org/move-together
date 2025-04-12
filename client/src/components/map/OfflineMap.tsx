import React from 'react';
import { Button } from '@/components/ui/button';

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

// For now, we're using a simplified mock map component to avoid the Google Maps integration issues
export default function OfflineMap({ 
  location, 
  onZoomIn, 
  onZoomOut, 
  onToggleMapType, 
  onGoToCurrentLocation 
}: OfflineMapProps) {
  // Format coordinates for display
  const formattedCoords = location 
    ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` 
    : 'No location data';
    
  // Map style
  const mapStyle = {
    height: '400px',
    backgroundColor: '#242f3e',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    color: 'white'
  };
  
  return (
    <div className="relative">
      <div style={mapStyle} className="rounded-lg">
        {/* Mock Map */}
        <div className="w-full h-full flex flex-col items-center justify-center bg-dark-gray">
          <div className="text-center mb-4">
            <div className="text-2xl mb-2">Offline Map</div>
            <p className="text-light-gray text-sm">Current coordinates:</p>
            <p className="font-mono text-primary">{formattedCoords}</p>
          </div>
          
          {/* Location Dot */}
          {location && (
            <div className="my-4">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center mx-auto">
                <div className="w-4 h-4 rounded-full bg-white"></div>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary bg-opacity-30 relative -mt-6 mx-auto"></div>
            </div>
          )}
          
          <p className="text-xs text-gray-400 mt-4">
            Note: Full map integration available with Google Maps API key
          </p>
        </div>
        
        {/* Map Overlay (Gradients and Controls) */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark to-transparent pointer-events-none"></div>
        
        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <Button
            variant="secondary"
            size="icon"
            className="bg-dark-gray hover:bg-dark-gray/90 p-2 rounded-full shadow-lg"
            onClick={onZoomIn}
          >
            <span className="material-icons">add</span>
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="bg-dark-gray hover:bg-dark-gray/90 p-2 rounded-full shadow-lg"
            onClick={onZoomOut}
          >
            <span className="material-icons">remove</span>
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="bg-dark-gray hover:bg-dark-gray/90 p-2 rounded-full shadow-lg"
            onClick={onToggleMapType}
          >
            <span className="material-icons">layers</span>
          </Button>
        </div>
        
        {/* Current Location Button */}
        <Button 
          variant="default"
          className="absolute bottom-24 right-4 bg-primary hover:bg-primary/90 p-3 rounded-full shadow-lg"
          onClick={onGoToCurrentLocation}
        >
          <span className="material-icons">my_location</span>
        </Button>
      </div>
    </div>
  );
}
