declare module 'react-map-gl' {
  import * as React from 'react';
  
  export type MapRef = any;
  
  export type ViewState = {
    longitude: number;
    latitude: number;
    zoom: number;
    pitch?: number;
    bearing?: number;
    transitionDuration?: number;
  };
  
  export type MapEvent = {
    viewState: ViewState;
    target: any;
    originalEvent: any;
    features?: any[];
    point: [number, number];
    lngLat: [number, number];
  };
  
  export interface MapProps {
    initialViewState?: ViewState;
    longitude?: number;
    latitude?: number;
    zoom?: number;
    bearing?: number;
    pitch?: number;
    style?: React.CSSProperties;
    mapStyle?: any;
    width?: number | string;
    height?: number | string;
    onMove?: (evt: MapEvent) => void;
    onClick?: (evt: MapEvent) => void;
    onLoad?: (evt: any) => void;
    children?: React.ReactNode;
    attributionControl?: boolean;
    reuseMaps?: boolean;
    styleDiffing?: boolean;
    mapboxAccessToken?: string;
    [key: string]: any;
  }
  
  export const Map: React.FC<MapProps>;
  
  export interface MarkerProps {
    longitude: number;
    latitude: number;
    anchor?: string;
    offset?: [number, number];
    draggable?: boolean;
    rotation?: number;
    rotationAlignment?: string;
    pitchAlignment?: string;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
    onClick?: (evt: any) => void;
    onDragStart?: (evt: any) => void;
    onDrag?: (evt: any) => void;
    onDragEnd?: (evt: any) => void;
  }
  
  export const Marker: React.FC<MarkerProps>;
  
  export interface SourceProps {
    id: string;
    type: 'geojson' | 'vector' | 'raster' | 'image' | 'video';
    data?: any;
    url?: string;
    tiles?: string[];
    children?: React.ReactNode;
  }
  
  export const Source: React.FC<SourceProps>;
  
  export interface LayerProps {
    id: string;
    type: string;
    source?: string;
    'source-layer'?: string;
    beforeId?: string;
    layout?: any;
    paint?: any;
    filter?: any[];
    minzoom?: number;
    maxzoom?: number;
  }
  
  export const Layer: React.FC<LayerProps>;
  
  export interface NavigationControlProps {
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    style?: React.CSSProperties;
    showCompass?: boolean;
    showZoom?: boolean;
    visualizePitch?: boolean;
  }
  
  export const NavigationControl: React.FC<NavigationControlProps>;
  
  export interface GeolocateControlProps {
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    style?: React.CSSProperties;
    positionOptions?: any;
    fitBoundsOptions?: any;
    trackUserLocation?: boolean;
    showUserLocation?: boolean;
    showAccuracyCircle?: boolean;
    onGeolocate?: (evt: any) => void;
    auto?: boolean;
  }
  
  export const GeolocateControl: React.FC<GeolocateControlProps>;
}

declare module '@deck.gl/layers' {
  export interface LineLayerProps {
    id: string;
    data: any;
    pickable?: boolean;
    widthUnits?: string;
    widthScale?: number;
    widthMinPixels?: number;
    widthMaxPixels?: number;
    getSourcePosition?: (d: any) => [number, number, number];
    getTargetPosition?: (d: any) => [number, number, number];
    getColor?: ((d: any) => [number, number, number, number]) | [number, number, number, number];
    getWidth?: ((d: any) => number) | number;
  }
  
  export class LineLayer {
    constructor(props: LineLayerProps);
  }
}