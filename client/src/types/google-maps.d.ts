declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element, opts?: MapOptions);
      setCenter(latLng: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
      setOptions(options: MapOptions): void;
      panTo(latLng: LatLng | LatLngLiteral): void;
      panBy(x: number, y: number): void;
      getCenter(): LatLng;
      getZoom(): number;
      getBounds(): LatLngBounds;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setPosition(latLng: LatLng | LatLngLiteral): void;
      setMap(map: Map | null): void;
      setIcon(icon: string | Icon | Symbol): void;
    }

    class Circle {
      constructor(opts?: CircleOptions);
      setCenter(latLng: LatLng | LatLngLiteral): void;
      setRadius(radius: number): void;
      setMap(map: Map | null): void;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    class LatLngBounds {
      constructor(sw?: LatLng | LatLngLiteral, ne?: LatLng | LatLngLiteral);
      contains(latLng: LatLng | LatLngLiteral): boolean;
      extend(latLng: LatLng | LatLngLiteral): LatLngBounds;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapTypeId?: string;
      disableDefaultUI?: boolean;
      styles?: any[];
    }

    interface MarkerOptions {
      position: LatLng | LatLngLiteral;
      map?: Map;
      icon?: string | Icon | Symbol;
    }

    interface CircleOptions {
      center?: LatLng | LatLngLiteral;
      radius?: number;
      map?: Map;
      fillColor?: string;
      fillOpacity?: number;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
    }

    interface Icon {
      url?: string;
      path?: string | Symbol;
      scale?: number;
      fillColor?: string;
      fillOpacity?: number;
      strokeColor?: string;
      strokeWeight?: number;
    }

    enum MapTypeId {
      ROADMAP = 'roadmap',
      SATELLITE = 'satellite',
      HYBRID = 'hybrid',
      TERRAIN = 'terrain'
    }

    enum SymbolPath {
      CIRCLE = 0,
      FORWARD_CLOSED_ARROW = 1,
      FORWARD_OPEN_ARROW = 2,
      BACKWARD_CLOSED_ARROW = 3,
      BACKWARD_OPEN_ARROW = 4
    }

    interface Symbol {
      path: string | SymbolPath;
      fillColor?: string;
      fillOpacity?: number;
      scale?: number;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
    }
  }

  namespace places {
    // Placeholder for Places API
  }
}

interface Window {
  google: typeof google;
}