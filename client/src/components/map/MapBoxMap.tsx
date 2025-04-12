import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from '@/context/LocationContext';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Free public token for development, will expire and should be replaced with a proper token
// In production, you'd want to use environment variables
mapboxgl.accessToken = 'pk.eyJ1IjoibW92ZS10by1lYXJuIiwiYSI6ImNsczBlaW9tdTA2YmYyam1wYXkzdDhxNWcifQ.CyS2m-RnjkfU-UONDt9YgA';

interface Location {
  latitude: number;
  longitude: number;
  timestamp?: number;
}

interface MapBoxMapProps {
  location: Location | null;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleMapType: () => void;
  onGoToCurrentLocation: () => void;
}

export default function MapBoxMap({ 
  location, 
  onZoomIn, 
  onZoomOut, 
  onToggleMapType, 
  onGoToCurrentLocation 
}: MapBoxMapProps) {
  const { isTracking, totalDistance } = useLocation();
  const [locationHistory, setLocationHistory] = useState<Location[]>([]);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'terrain'>('terrain');
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const locationMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const pathSourceRef = useRef<string | null>(null);
  const [zoom, setZoom] = useState(14);

  // Format coordinates for display
  const formattedCoords = location 
    ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` 
    : 'No location data';

  // Map styles based on selected type
  const getMapStyle = () => {
    switch (mapType) {
      case 'satellite':
        return 'mapbox://styles/mapbox/satellite-streets-v12';
      case 'terrain':
        return 'mapbox://styles/mapbox/outdoors-v12'; // Outdoor/terrain style
      default:
        return 'mapbox://styles/mapbox/dark-v11';
    }
  };

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Default center if no location is available yet
    const defaultCenter: [number, number] = [-77.0, 38.8];
    const initialCenter = location 
      ? [location.longitude, location.latitude] as [number, number]
      : defaultCenter;

    // Create map instance
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: getMapStyle(),
      center: initialCenter,
      zoom: zoom,
      attributionControl: false
    });

    // Add custom attribution with app info
    map.addControl(
      new mapboxgl.AttributionControl({
        customAttribution: 'MOVE - Fitness Tracker'
      }),
      'bottom-left'
    );

    // Add zoom event handler
    map.on('zoom', () => {
      setZoom(Math.round(map.getZoom()));
    });

    // Add path layer on load
    map.on('load', () => {
      // Add a source for our path
      map.addSource('path-source', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        }
      });
      pathSourceRef.current = 'path-source';

      // Add a layer for our path with custom styling
      map.addLayer({
        id: 'path-layer',
        type: 'line',
        source: 'path-source',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': mapType === 'terrain' ? '#f8c967' : '#3b82f6',
          'line-width': 4,
          'line-opacity': 0.8
        }
      });
    });

    mapRef.current = map;

    // Create a marker for current location
    if (location) {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '22px';
      el.style.height = '22px';
      el.style.borderRadius = '50%';
      el.style.background = mapType === 'terrain' ? '#f59e0b' : '#3b82f6';
      el.style.boxShadow = '0 0 0 4px rgba(255,255,255,0.4)';
      el.style.border = '2px solid #ffffff';
  
      const marker = new mapboxgl.Marker({
        element: el,
        color: "#ff5252", 
        scale: 0.8
      })
        .setLngLat([location.longitude, location.latitude])
        .addTo(map);
      
      locationMarkerRef.current = marker;
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update map style when map type changes
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setStyle(getMapStyle());
    
    // Need to wait for style to load before updating path
    mapRef.current.once('style.load', () => {
      if (mapRef.current && pathSourceRef.current && locationHistory.length > 1) {
        // Re-add the source and layer after style change
        if (!mapRef.current.getSource(pathSourceRef.current)) {
          mapRef.current.addSource(pathSourceRef.current, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: { mapType },
              geometry: {
                type: 'LineString',
                coordinates: locationHistory.map(loc => [loc.longitude, loc.latitude])
              }
            }
          });
          
          mapRef.current.addLayer({
            id: 'path-layer',
            type: 'line',
            source: pathSourceRef.current,
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': mapType === 'terrain' ? '#f8c967' : '#3b82f6',
              'line-width': 4,
              'line-opacity': 0.8
            }
          });
        } else {
          // Just update the data
          updatePathData();
        }
      }
    });

    // Update marker color based on map type
    if (locationMarkerRef.current && location) {
      const el = locationMarkerRef.current.getElement();
      const dotEl = el.querySelector('.custom-marker') || el;
      dotEl.style.background = mapType === 'terrain' ? '#f59e0b' : '#3b82f6';
    }
  }, [mapType]);

  // Update location marker and center when location changes
  useEffect(() => {
    if (!mapRef.current || !location) return;
    
    const coordinates: [number, number] = [location.longitude, location.latitude];
    
    // Update marker position
    if (locationMarkerRef.current) {
      locationMarkerRef.current.setLngLat(coordinates);
    } else {
      // Create marker if it doesn't exist
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '22px';
      el.style.height = '22px';
      el.style.borderRadius = '50%';
      el.style.background = mapType === 'terrain' ? '#f59e0b' : '#3b82f6';
      el.style.boxShadow = '0 0 0 4px rgba(255,255,255,0.4)';
      el.style.border = '2px solid #ffffff';
  
      const marker = new mapboxgl.Marker({
        element: el,
        scale: 0.8
      })
        .setLngLat(coordinates)
        .addTo(mapRef.current);
      
      locationMarkerRef.current = marker;
    }
    
    // Center map on location if tracking
    if (isTracking) {
      mapRef.current.easeTo({
        center: coordinates,
        zoom: mapRef.current.getZoom(), // maintain current zoom
        duration: 500
      });
    }
  }, [location, isTracking]);

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

  // Update path on the map when location history changes
  useEffect(() => {
    if (!mapRef.current || !pathSourceRef.current || locationHistory.length < 2) return;
    updatePathData();
  }, [locationHistory]);

  // Function to update the path data
  const updatePathData = () => {
    if (!mapRef.current || !pathSourceRef.current || locationHistory.length < 1) return;
    
    const coordinates = locationHistory.map(loc => [loc.longitude, loc.latitude]);
    
    const geojson = {
      type: 'Feature',
      properties: { mapType },
      geometry: {
        type: 'LineString',
        coordinates
      }
    };
    
    // Get the source and update its data
    try {
      const source = mapRef.current.getSource(pathSourceRef.current) as mapboxgl.GeoJSONSource;
      if (source && source.setData) {
        source.setData(geojson as any);
      }
    } catch (error) {
      console.error("Error updating path data:", error);
    }
  };

  // Handle map type toggle
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
  
  // Handle zoom in
  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
    onZoomIn();
  };
  
  // Handle zoom out
  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
    onZoomOut();
  };
  
  // Center map on current location
  const handleGoToCurrentLocation = () => {
    if (mapRef.current && location) {
      mapRef.current.flyTo({
        center: [location.longitude, location.latitude],
        zoom: 15,
        duration: 1000
      });
    }
    onGoToCurrentLocation();
  };

  return (
    <div className="relative w-full">
      {/* Main Map Container */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-[400px] rounded-lg overflow-hidden shadow-md"
      ></div>
      
      {/* Status Info Box */}
      <div className={`absolute top-4 left-4 
        ${mapType === 'terrain' ? 'bg-amber-800/80' : 'bg-dark/80'} 
        ${mapType === 'terrain' ? 'text-amber-50 border border-amber-600/50' : ''}
        rounded-lg p-3 z-10 text-left max-w-[200px] shadow-lg`}>
        <div className="text-sm font-medium mb-1">
          <span className={`inline-block w-2 h-2 rounded-full 
            ${isTracking 
              ? (mapType === 'terrain' ? 'bg-amber-400 animate-pulse' : 'bg-secondary animate-pulse') 
              : 'bg-gray-500'} mr-2`}></span>
          {isTracking ? 'GPS Tracking Active' : 'Tracking Paused'}
        </div>
        <div className={`text-xs ${mapType === 'terrain' ? 'text-amber-200' : 'text-gray-300'} mb-1`}>
          Current coordinates:
        </div>
        <p className={`font-mono text-xs ${mapType === 'terrain' ? 'text-amber-300' : 'text-primary'} truncate`}>
          {formattedCoords}
        </p>
        
        {isTracking && (
          <div className={`mt-2 text-xs ${mapType === 'terrain' ? 'text-amber-200' : 'text-gray-300'}`}>
            Distance: 
            <span className={mapType === 'terrain' ? 'text-amber-300 font-semibold ml-1' : 'text-secondary ml-1'}>
              {totalDistance.toFixed(2)} km
            </span>
          </div>
        )}
      </div>
      
      {/* Map Type Indicator */}
      <div className={`absolute top-4 right-24 
        ${mapType === 'terrain' ? 'bg-amber-800/80 text-amber-50 border border-amber-600/50' : 'bg-dark/80'} 
        rounded-lg px-2 py-1 text-xs font-mono z-10 shadow-md`}>
        {mapType.charAt(0).toUpperCase() + mapType.slice(1)}
      </div>
      
      {/* Custom Map Controls */}
      <div className="absolute bottom-28 right-4 flex flex-col space-y-2 z-10">
        {/* Zoom Controls */}
        <Button
          variant="secondary"
          size="icon"
          className={`${mapType === 'terrain' 
            ? 'bg-amber-50/90 hover:bg-amber-50 text-amber-900' 
            : 'bg-dark-gray/90 hover:bg-dark-gray'} 
            p-2 rounded-full shadow-lg`}
          onClick={handleZoomIn}
        >
          <span className="material-icons">add</span>
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className={`${mapType === 'terrain' 
            ? 'bg-amber-50/90 hover:bg-amber-50 text-amber-900' 
            : 'bg-dark-gray/90 hover:bg-dark-gray'} 
            p-2 rounded-full shadow-lg`}
          onClick={handleZoomOut}
        >
          <span className="material-icons">remove</span>
        </Button>
      </div>
      
      <div className="absolute bottom-4 right-4 flex space-x-2 z-10">
        {/* Toggle Map Type Button */}
        <Button
          variant="secondary"
          size="icon"
          className={`${mapType === 'terrain' 
            ? 'bg-amber-50/90 hover:bg-amber-50 text-amber-900' 
            : 'bg-dark-gray/90 hover:bg-dark-gray'} 
            p-2 rounded-full shadow-lg`}
          onClick={handleToggleMapType}
        >
          <span className="material-icons">layers</span>
        </Button>
        
        {/* Go to Current Location Button */}
        <Button 
          variant="default"
          className={`${mapType === 'terrain' 
            ? 'bg-amber-600 hover:bg-amber-700 text-amber-50' 
            : 'bg-primary hover:bg-primary/90'} 
            p-2 rounded-full shadow-lg`}
          onClick={handleGoToCurrentLocation}
          disabled={!location}
        >
          <span className="material-icons">my_location</span>
        </Button>
      </div>
      
      {/* Zoom Level Indicator */}
      <div className={`absolute bottom-4 left-4 text-xs font-mono ${
        mapType === 'terrain' 
          ? 'bg-amber-800/70 text-amber-50' 
          : 'bg-dark/80'
      } px-2 py-1 rounded-md z-10 shadow-md`}>
        Zoom: {zoom}
      </div>
    </div>
  );
}