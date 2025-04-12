import React, { useState, useEffect, useRef, useMemo } from 'react';
import Map, { Marker, Source, Layer, NavigationControl, GeolocateControl } from 'react-map-gl';
import { LineLayer } from '@deck.gl/layers';
import { Button } from '@/components/ui/button';
import { useLocation } from '@/context/LocationContext';

// Modern dark style that works without an access token
const MAPBOX_STYLE = {
  version: 8,
  name: "MOVE Fitness - Dark",
  metadata: {},
  sources: {
    "mapbox": {
      type: "vector",
      url: "https://demotiles.maplibre.org/tiles/tiles.json"
    }
  },
  sprite: "https://demotiles.maplibre.org/sprites/sprites",
  glyphs: "https://demotiles.maplibre.org/fonts/{fontstack}/{range}.pbf",
  layers: [
    {
      id: "background",
      type: "background",
      paint: {
        "background-color": "#111111"
      }
    },
    {
      id: "water",
      type: "fill",
      source: "mapbox",
      "source-layer": "water",
      paint: {
        "fill-color": "#0C1D31"
      }
    },
    {
      id: "building",
      type: "fill",
      source: "mapbox",
      "source-layer": "building",
      paint: {
        "fill-color": "#181818",
        "fill-outline-color": "#272727"
      }
    },
    {
      id: "road",
      type: "line",
      source: "mapbox",
      "source-layer": "road",
      paint: {
        "line-color": "#333333",
        "line-width": 1.5
      }
    },
    {
      id: "road-highlight",
      type: "line",
      source: "mapbox",
      "source-layer": "road",
      filter: ["==", "class", "main"],
      paint: {
        "line-color": "#444444",
        "line-width": 2.5
      }
    },
    {
      id: "state-boundaries",
      type: "line",
      source: "mapbox",
      "source-layer": "admin",
      filter: ["==", "admin_level", 4],
      paint: {
        "line-color": "#444444",
        "line-width": 1
      }
    },
    {
      id: "country-boundaries",
      type: "line",
      source: "mapbox",
      "source-layer": "admin",
      filter: ["==", "admin_level", 2],
      paint: {
        "line-color": "#555555",
        "line-width": 1
      }
    }
  ]
};

// Modern adventure style
const ADVENTURE_STYLE = {
  version: 8,
  name: "MOVE Fitness - Adventure",
  metadata: {},
  sources: {
    "mapbox": {
      type: "vector",
      url: "https://demotiles.maplibre.org/tiles/tiles.json"
    }
  },
  sprite: "https://demotiles.maplibre.org/sprites/sprites",
  glyphs: "https://demotiles.maplibre.org/fonts/{fontstack}/{range}.pbf",
  layers: [
    {
      id: "background",
      type: "background",
      paint: {
        "background-color": "#e2d8c3"
      }
    },
    {
      id: "water",
      type: "fill",
      source: "mapbox",
      "source-layer": "water",
      paint: {
        "fill-color": "#a7d0e2",
        "fill-outline-color": "#93b8c9"
      }
    },
    {
      id: "landcover",
      type: "fill",
      source: "mapbox",
      "source-layer": "landcover",
      paint: {
        "fill-color": [
          "match",
          ["get", "class"],
          "wood", "#b5d29f",
          "scrub", "#c9e3a8",
          "grass", "#d4e6b9",
          "crop", "#e1e8bf",
          "#e2d8c3"
        ]
      }
    },
    {
      id: "building",
      type: "fill",
      source: "mapbox",
      "source-layer": "building",
      paint: {
        "fill-color": "#d1c4ab",
        "fill-outline-color": "#b9ae97"
      }
    },
    {
      id: "road-trail",
      type: "line",
      source: "mapbox",
      "source-layer": "road",
      filter: ["==", "class", "path"],
      paint: {
        "line-color": "#b5a990",
        "line-width": 1.2,
        "line-dasharray": [2, 1]
      }
    },
    {
      id: "road",
      type: "line",
      source: "mapbox",
      "source-layer": "road",
      filter: ["!=", "class", "path"],
      paint: {
        "line-color": "#c5b7a0",
        "line-width": 1.5
      }
    },
    {
      id: "road-highlight",
      type: "line",
      source: "mapbox",
      "source-layer": "road",
      filter: ["==", "class", "main"],
      paint: {
        "line-color": "#b5a285",
        "line-width": 2.5
      }
    },
    {
      id: "state-boundaries",
      type: "line",
      source: "mapbox",
      "source-layer": "admin",
      filter: ["==", "admin_level", 4],
      paint: {
        "line-color": "#a8997f",
        "line-width": 1,
        "line-dasharray": [3, 2]
      }
    },
    {
      id: "country-boundaries",
      type: "line",
      source: "mapbox",
      "source-layer": "admin",
      filter: ["==", "admin_level", 2],
      paint: {
        "line-color": "#a5987d",
        "line-width": 1.5
      }
    }
  ]
};

// Custom marker styles
const MARKER_SIZE = 24;

interface Location {
  latitude: number;
  longitude: number;
  timestamp?: number;
}

interface HypeMapProps {
  location: Location | null;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleMapType: () => void;
  onGoToCurrentLocation: () => void;
}

export default function HypeMap({ 
  location, 
  onZoomIn, 
  onZoomOut, 
  onToggleMapType, 
  onGoToCurrentLocation 
}: HypeMapProps) {
  const { isTracking, totalDistance } = useLocation();
  const [locationHistory, setLocationHistory] = useState<Location[]>([]);
  const [mapStyle, setMapStyle] = useState<'dark' | 'adventure'>('dark');
  const [viewState, setViewState] = useState({
    longitude: location?.longitude || -77.0,
    latitude: location?.latitude || 38.8,
    zoom: 14,
    bearing: 0,
    pitch: 40
  });
  
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

  // Update view state when location changes and tracking is active
  useEffect(() => {
    if (location && isTracking) {
      setViewState(prev => ({
        ...prev,
        longitude: location.longitude,
        latitude: location.latitude,
      }));
    }
  }, [location, isTracking]);

  // Path data for the GeoJSON source
  const pathData = useMemo(() => {
    if (locationHistory.length < 2) return null;
    
    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: locationHistory.map(loc => [loc.longitude, loc.latitude])
      }
    };
  }, [locationHistory]);

  // Path layer style
  const pathLayerStyle = {
    id: 'path',
    type: 'line',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': mapStyle === 'dark' ? '#3b82f6' : '#f59e0b',
      'line-width': 4,
      'line-opacity': 0.8
    }
  };

  // Handle map type toggle
  const handleToggleMapType = () => {
    setMapStyle(prev => prev === 'dark' ? 'adventure' : 'dark');
    onToggleMapType();
  };
  
  // Center map on current location
  const handleGoToCurrentLocation = () => {
    if (location) {
      setViewState({
        ...viewState,
        longitude: location.longitude,
        latitude: location.latitude,
        zoom: 15,
        transitionDuration: 1000
      });
    }
    onGoToCurrentLocation();
  };

  return (
    <div className="relative w-full h-[400px]">
      {/* Main Map Container */}
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle={mapStyle === 'dark' ? MAPBOX_STYLE : ADVENTURE_STYLE}
        attributionControl={false}
        reuseMaps
        styleDiffing
        mapboxAccessToken=""
        style={{ width: '100%', height: '100%', borderRadius: '0.5rem', overflow: 'hidden' }}
      >
        {/* Path Layer */}
        {pathData && (
          <Source id="path-source" type="geojson" data={pathData}>
            <Layer {...pathLayerStyle} />
          </Source>
        )}
        
        {/* Current location marker */}
        {location && (
          <Marker
            longitude={location.longitude}
            latitude={location.latitude}
            anchor="center"
          >
            <div className="relative">
              {/* Accuracy circle */}
              <div className={`absolute w-16 h-16 rounded-full ${
                mapStyle === 'adventure' 
                  ? 'bg-amber-500 bg-opacity-20' 
                  : 'bg-primary bg-opacity-20'
              } animate-pulse`} 
                style={{ top: '-32px', left: '-32px' }}></div>
              
              {/* Direction indicator */}
              {isTracking && (
                <div className="absolute" style={{ top: '-8px', left: '-12px' }}>
                  <div className={`w-10 h-10 border-t-4 ${
                    mapStyle === 'adventure' 
                      ? 'border-amber-500' 
                      : 'border-primary'
                  } rotate-45 rounded-full border-l-transparent border-r-transparent border-b-transparent`}></div>
                </div>
              )}
              
              {/* User location dot */}
              <div className={`w-6 h-6 rounded-full ${
                mapStyle === 'adventure' 
                  ? 'bg-amber-500' 
                  : 'bg-primary'
              } flex items-center justify-center shadow-lg ${
                mapStyle === 'adventure' 
                  ? 'ring-2 ring-amber-600 ring-opacity-50' 
                  : ''
              }`}>
                <div className="w-3 h-3 rounded-full bg-white"></div>
              </div>
            </div>
          </Marker>
        )}
        
        {/* Starting point marker (if tracking and have history) */}
        {isTracking && locationHistory.length > 1 && (
          <Marker
            longitude={locationHistory[0].longitude}
            latitude={locationHistory[0].latitude}
            anchor="center"
          >
            <div className={`w-4 h-4 rounded-full ${
              mapStyle === 'adventure' 
                ? 'bg-green-600 ring-2 ring-green-700 ring-opacity-50' 
                : 'bg-green-500'
            }`}></div>
          </Marker>
        )}
        
        {/* Map Controls */}
        <NavigationControl position="bottom-right" showCompass={false} />
        <GeolocateControl 
          position="bottom-right"
          positionOptions={{ enableHighAccuracy: true }}
          trackUserLocation={true}
          showUserLocation={false}
        />
      </Map>
      
      {/* Status Info Box */}
      <div className={`absolute top-4 left-4 
        ${mapStyle === 'adventure' ? 'bg-amber-800/80' : 'bg-dark/80'} 
        ${mapStyle === 'adventure' ? 'text-amber-50 border border-amber-600/50' : ''}
        rounded-lg p-3 z-10 text-left max-w-[200px] shadow-lg`}>
        <div className="text-sm font-medium mb-1">
          <span className={`inline-block w-2 h-2 rounded-full 
            ${isTracking 
              ? (mapStyle === 'adventure' ? 'bg-amber-400 animate-pulse' : 'bg-primary animate-pulse') 
              : 'bg-gray-500'} mr-2`}></span>
          {isTracking ? 'GPS Tracking Active' : 'Tracking Paused'}
        </div>
        <div className={`text-xs ${mapStyle === 'adventure' ? 'text-amber-200' : 'text-gray-300'} mb-1`}>
          Current coordinates:
        </div>
        <p className={`font-mono text-xs ${mapStyle === 'adventure' ? 'text-amber-300' : 'text-primary'} truncate`}>
          {formattedCoords}
        </p>
        
        {isTracking && (
          <div className={`mt-2 text-xs ${mapStyle === 'adventure' ? 'text-amber-200' : 'text-gray-300'}`}>
            Distance: 
            <span className={mapStyle === 'adventure' ? 'text-amber-300 font-semibold ml-1' : 'text-primary ml-1'}>
              {totalDistance.toFixed(2)} km
            </span>
          </div>
        )}
      </div>
      
      {/* Map Type Indicator */}
      <div className={`absolute top-4 right-10 
        ${mapStyle === 'adventure' ? 'bg-amber-800/80 text-amber-50 border border-amber-600/50' : 'bg-dark/80'} 
        rounded-lg px-2 py-1 text-xs font-mono z-10 shadow-md`}>
        {mapStyle === 'dark' ? 'Night Mode' : 'Adventure'}
      </div>
      
      {/* Custom Map Type Toggle Button */}
      <Button
        variant="secondary"
        size="icon"
        className={`absolute top-4 right-4 z-10
          ${mapStyle === 'adventure' 
            ? 'bg-amber-50/90 hover:bg-amber-50 text-amber-900' 
            : 'bg-dark-gray/90 hover:bg-dark-gray'} 
          p-2 rounded-full shadow-lg`}
        onClick={handleToggleMapType}
      >
        <span className="material-icons">layers</span>
      </Button>
    </div>
  );
}