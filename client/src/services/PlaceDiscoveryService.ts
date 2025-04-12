import { type LocationData } from '@/context/LocationContext';

// Define the Place interface
export interface Place {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  audioGuide?: string; // URL to audio file
  badgeNFT?: {
    name: string;
    description: string;
    image: string;
  };
  arContent?: {
    type: 'model' | 'image';
    url: string;
  };
}

// Calculate distance between two coordinates in meters using the Haversine formula
function getDistanceFromLatLonInMeters(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371e3; // Radius of the earth in meters
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

// Mock data of interesting places
// In a real app, this would come from a database or API
const PLACES: Place[] = [
  {
    id: 'oldtown',
    name: 'Old Town',
    description: 'The historic center of the city, featuring cobblestone streets and centuries-old architecture.',
    latitude: 37.775,
    longitude: -122.419,
    radius: 500,
    audioGuide: '/audio/oldtown.mp3',
    badgeNFT: {
      name: 'Old Town Badge',
      description: 'Awarded for exploring the historic Old Town district.',
      image: '/images/badges/oldtown.png'
    },
    arContent: {
      type: 'image',
      url: '/ar/oldtown-overlay.png'
    }
  },
  {
    id: 'techdistrict',
    name: 'Tech District',
    description: 'The bustling heart of innovation, home to numerous tech startups and modern architecture.',
    latitude: 37.780,
    longitude: -122.410,
    radius: 400,
    audioGuide: '/audio/techdistrict.mp3',
    badgeNFT: {
      name: 'Tech Pioneer Badge',
      description: 'Earned by visiting the innovative Tech District.',
      image: '/images/badges/techdistrict.png'
    }
  },
  {
    id: 'waterfront',
    name: 'Waterfront',
    description: 'A scenic area by the bay with breathtaking views and recreational activities.',
    latitude: 37.768,
    longitude: -122.430,
    radius: 600,
    audioGuide: '/audio/waterfront.mp3',
    badgeNFT: {
      name: 'Waterfront Explorer Badge',
      description: 'Awarded to those who discover the beautiful waterfront area.',
      image: '/images/badges/waterfront.png'
    },
    arContent: {
      type: 'model',
      url: '/ar/waterfront-history.glb'
    }
  },
  {
    id: 'centralpark',
    name: 'Central Park',
    description: 'The largest green space in the city, perfect for outdoor activities and relaxation.',
    latitude: 37.785,
    longitude: -122.425,
    radius: 800,
    audioGuide: '/audio/centralpark.mp3',
    badgeNFT: {
      name: 'Nature Enthusiast Badge',
      description: 'For those who appreciate the natural beauty of Central Park.',
      image: '/images/badges/centralpark.png'
    }
  },
  {
    id: 'artquarter',
    name: 'Arts Quarter',
    description: 'The cultural hub with museums, galleries, and vibrant street art.',
    latitude: 37.763,
    longitude: -122.415,
    radius: 350,
    audioGuide: '/audio/artquarter.mp3',
    badgeNFT: {
      name: 'Art Connoisseur Badge',
      description: 'Recognizing your visit to the artistic heart of the city.',
      image: '/images/badges/artquarter.png'
    },
    arContent: {
      type: 'image',
      url: '/ar/artquarter-overlay.png'
    }
  }
];

// Class to handle place discovery and audio guide functionality
export class PlaceDiscoveryService {
  private visitedPlaces: Set<string> = new Set();
  private activePlaces: Map<string, Place> = new Map();
  private lastNotificationTimes: Map<string, number> = new Map();
  private notificationCooldown = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  constructor() {
    // Load visitedPlaces from localStorage in a real implementation
    try {
      const saved = localStorage.getItem('visitedPlaces');
      if (saved) {
        this.visitedPlaces = new Set(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading visited places from localStorage:', e);
    }
  }
  
  // Check if a given location is within the radius of any interesting places
  public checkNearbyPlaces(location: LocationData): Place[] {
    if (!location) return [];
    
    const currentTime = Date.now();
    const nearbyPlaces: Place[] = [];
    
    PLACES.forEach(place => {
      const distance = getDistanceFromLatLonInMeters(
        location.latitude,
        location.longitude,
        place.latitude,
        place.longitude
      );
      
      // If within radius and not on cooldown
      if (distance <= place.radius) {
        const lastNotificationTime = this.lastNotificationTimes.get(place.id) || 0;
        if (currentTime - lastNotificationTime > this.notificationCooldown) {
          nearbyPlaces.push(place);
          this.activePlaces.set(place.id, place);
          this.lastNotificationTimes.set(place.id, currentTime);
        }
      } else {
        // If user has left the place, remove it from active places
        if (this.activePlaces.has(place.id)) {
          this.activePlaces.delete(place.id);
        }
      }
    });
    
    return nearbyPlaces;
  }
  
  // Mark a place as visited, update local storage
  public markPlaceVisited(placeId: string): void {
    this.visitedPlaces.add(placeId);
    try {
      localStorage.setItem('visitedPlaces', JSON.stringify([...this.visitedPlaces]));
    } catch (e) {
      console.error('Error saving visited places to localStorage:', e);
    }
  }
  
  // Check if a place has been visited before
  public hasVisited(placeId: string): boolean {
    return this.visitedPlaces.has(placeId);
  }
  
  // Get all places for admin or debug purposes
  public getAllPlaces(): Place[] {
    return [...PLACES];
  }
  
  // Get all currently active places (user is within their radius)
  public getActivePlaces(): Place[] {
    return Array.from(this.activePlaces.values());
  }
  
  // Get all visited places
  public getVisitedPlaces(): Place[] {
    return PLACES.filter(place => this.visitedPlaces.has(place.id));
  }
  
  // Find place by ID
  public getPlaceById(placeId: string): Place | undefined {
    return PLACES.find(place => place.id === placeId);
  }
}

// Singleton instance
export const placeDiscovery = new PlaceDiscoveryService();