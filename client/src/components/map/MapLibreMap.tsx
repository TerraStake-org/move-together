import React, { useRef, useState, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import { useLocation } from '@/context/LocationContext';
import 'maplibre-gl/dist/maplibre-gl.css';

// Define our map style
const mapStyle = {
  version: 8,
  sources: {
    vectorTiles: {
      type: 'vector',
      tiles: [window.location.origin + "/map/tiles/{z}/{x}/{y}.pbf"],
      minzoom: 0,
      maxzoom: 14
    }
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#121212' }
    },
    {
      id: 'landcover',
      type: 'fill',
      source: 'vectorTiles',
      'source-layer': 'landcover',
      paint: { 'fill-color': '#1a4d2e' }
    },
    {
      id: 'water',
      type: 'fill',
      source: 'vectorTiles',
      'source-layer': 'water',
      paint: { 'fill-color': '#183446' }
    },
    {
      id: 'roads-major',
      type: 'line',
      source: 'vectorTiles',
      'source-layer': 'transportation',
      filter: ['all', ['in', 'class', 'primary', 'secondary', 'trunk', 'motorway']],
      paint: { 
        'line-color': '#414f5c', 
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          10, 1.5,
          16, 8
        ]
      }
    },
    {
      id: 'roads-minor',
      type: 'line',
      source: 'vectorTiles',
      'source-layer': 'transportation',
      filter: ['all', ['in', 'class', 'tertiary', 'residential', 'service']],
      paint: { 
        'line-color': '#2d3741', 
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          13, 0.5,
          16, 4
        ] 
      }
    },
    {
      id: 'buildings',
      type: 'fill',
      source: 'vectorTiles',
      'source-layer': 'building',
      paint: { 'fill-color': '#1c2733', 'fill-opacity': 0.85 }
    }
  ]
};

interface MapLibreMapProps {
  location: { latitude: number; longitude: number } | null;
  onToggleMapType: () => void;
}

const MapLibreMap: React.FC<MapLibreMapProps> = ({ location, onToggleMapType }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);
  const userPath = useRef<maplibregl.LineString | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [pathSource, setPathSource] = useState<string | null>(null);
  const { isTracking, locations } = useLocation();

  // Initialize map
  useEffect(() => {
    if (mapContainer.current && !map.current) {
      const initialLocation = location || { latitude: 40.7128, longitude: -74.0060 }; // Default NYC
      
      try {
        const newMap = new maplibregl.Map({
          container: mapContainer.current,
          style: mapStyle,
          center: [initialLocation.longitude, initialLocation.latitude],
          zoom: 14,
          attributionControl: false,
        });
        
        // Add basic map controls
        newMap.addControl(new maplibregl.NavigationControl(), 'top-right');
        newMap.addControl(new maplibregl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true
        }), 'top-right');
        
        newMap.on('load', () => {
          // Add empty path source and layer
          newMap.addSource('userPath', {
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
          
          newMap.addLayer({
            id: 'path-layer',
            type: 'line',
            source: 'userPath',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#3b82f6',
              'line-width': 5,
              'line-opacity': 0.8
            }
          });
          
          // Add markers layer
          newMap.addSource('markers', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: []
            }
          });
          
          setMapReady(true);
          setPathSource('userPath');
        });
        
        map.current = newMap;
      } catch (error) {
        console.error('Error initializing MapLibre map:', error);
      }
    }
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);
  
  // Update user location marker
  useEffect(() => {
    if (!map.current || !mapReady || !location) return;
    
    const lngLat = [location.longitude, location.latitude];
    
    // Create or update marker
    if (!marker.current) {
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'user-location-marker';
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = '#3b82f6';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.5)';
      
      marker.current = new maplibregl.Marker({
        element: el,
        anchor: 'center'
      })
        .setLngLat(lngLat)
        .addTo(map.current);
    } else {
      marker.current.setLngLat(lngLat);
    }
    
    // Center map on user location
    if (isTracking) {
      map.current.easeTo({
        center: lngLat,
        duration: 500
      });
    }
  }, [location, mapReady, isTracking]);
  
  // Update path when locations change
  useEffect(() => {
    if (!map.current || !mapReady || !pathSource || locations.length < 2) return;
    
    const coordinates = locations.map(loc => [loc.longitude, loc.latitude]);
    
    // Update path data
    if (map.current) {
      const source = map.current.getSource(pathSource);
      if (source && 'setData' in source) {
        source.setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates
          }
        });
      }
    }
  }, [locations, mapReady, pathSource]);

  return (
    <div className="relative w-full h-full bg-slate-900">
      <div className="absolute inset-0" ref={mapContainer}></div>
      
      {/* Optional overlay for status info */}
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
          <p className="text-lg animate-pulse">Loading map...</p>
        </div>
      )}
    </div>
  );
};

export default MapLibreMap;