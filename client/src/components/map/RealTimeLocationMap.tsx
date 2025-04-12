import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import useRealTimeLocation from '@/hooks/useRealTimeLocation';
import { useWeb3 } from '@/context/Web3Context';
import { rewardUserForDistance } from '@/web3/TokenMinter';
import { mapStyle } from '@/styles/mapStyle';

// Define types for Google Maps objects
declare global {
  interface Window {
    google: {
      maps: {
        Map: new (element: HTMLElement, options: any) => any;
        Marker: new (options: any) => any;
        SymbolPath: {
          CIRCLE: number;
        };
        MapTypeId: {
          ROADMAP: string;
          SATELLITE: string;
          HYBRID: string;
          TERRAIN: string;
        };
        LatLng: new (lat: number, lng: number) => any;
        Polyline: new (options: any) => any;
      };
    };
  }
}

// Simplified types for our component
interface GoogleMap {
  setCenter: (latLng: any) => void;
  panTo: (latLng: any) => void;
}

interface Polyline {
  setPath: (path: any[]) => void;
}

interface Marker {
  setPosition: (latLng: any) => void;
}

export default function RealTimeLocationMap() {
  const { toast } = useToast();
  const { address, signer } = useWeb3();
  const { 
    location, 
    error, 
    isTracking, 
    totalDistance, 
    locations, 
    startTracking, 
    stopTracking 
  } = useRealTimeLocation();
  
  // Use refs instead of state for Google Maps objects to avoid re-renders
  const mapRef = useRef<GoogleMap | null>(null);
  const polylineRef = useRef<Polyline | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  
  const [mapLoaded, setMapLoaded] = useState(false);
  const [rewardStatus, setRewardStatus] = useState<string>('');
  const [isRewarding, setIsRewarding] = useState(false);

  // Initialize Google Maps
  useEffect(() => {
    // Skip if already loaded or no window (SSR)
    if (mapLoaded || typeof window === 'undefined') return;

    // Check if Google Maps API is loaded
    if (!window.google?.maps) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBuiGOTQfXWgCKBfwXWeSiSJYQPkVEBUYo&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    } else {
      initializeMap();
    }

    function initializeMap() {
      try {
        const mapElement = document.getElementById('map');
        if (mapElement) {
          const defaultLocation = { lat: 37.7749, lng: -122.4194 }; // San Francisco
          const map = new google.maps.Map(mapElement, {
            center: defaultLocation,
            zoom: 15,
            styles: mapStyle,
            disableDefaultUI: true,
            zoomControl: true,
            mapTypeControl: false,
            scaleControl: true,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: true
          });

          // Create initial polyline
          const line = new google.maps.Polyline({
            path: [],
            geodesic: true,
            strokeColor: '#FF6347', // Tomato color
            strokeOpacity: 1.0,
            strokeWeight: 4,
            map: map
          });

          // Create marker for current position
          const posMarker = new google.maps.Marker({
            position: defaultLocation,
            map: map,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#FF6347',
              fillOpacity: 1,
              strokeColor: '#FFF',
              strokeWeight: 2,
              scale: 8
            }
          });

          // Store map objects in refs
          mapRef.current = map;
          polylineRef.current = line;
          markerRef.current = posMarker;
          setMapLoaded(true);
        }
      } catch (err) {
        console.error('Error initializing map:', err);
        toast({
          title: 'Map Error',
          description: 'Could not initialize the map. Please try again later.',
          variant: 'destructive'
        });
      }
    }

    return () => {
      // Clean up map resources if needed
    };
  }, [mapLoaded, toast]);

  // Update map when location changes
  useEffect(() => {
    if (!mapRef.current || !polylineRef.current || !markerRef.current || !location) return;

    const currentPos = { lat: location.latitude, lng: location.longitude };
    
    // Update marker position
    markerRef.current.setPosition(currentPos);
    
    // Center map on current position
    mapRef.current.panTo(currentPos);
    
    // Update polyline path with all locations
    if (locations.length > 0 && isTracking) {
      const path = locations.map(loc => ({ lat: loc.latitude, lng: loc.longitude }));
      polylineRef.current.setPath(path);
    }
  }, [location, locations, isTracking]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: 'Location Error',
        description: error.toString(),
        variant: 'destructive'
      });
    }
  }, [error, toast]);

  // Handle reward claim
  const handleClaimReward = async () => {
    if (!address || !signer) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to claim rewards',
        variant: 'destructive'
      });
      return;
    }

    if (totalDistance < 0.1) {
      toast({
        title: 'Insufficient Distance',
        description: 'You need to move at least 100 meters to earn rewards',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsRewarding(true);
      setRewardStatus('Sending transaction to blockchain...');
      
      const result = await rewardUserForDistance(address, totalDistance, signer);
      
      if (result.success) {
        setRewardStatus('Success! Tokens added to your wallet.');
        toast({
          title: 'Reward Claimed',
          description: `You earned ${totalDistance.toFixed(2)} MOVE tokens!`,
        });
      } else {
        setRewardStatus('Transaction failed. Please try again.');
        toast({
          title: 'Reward Failed',
          description: result.error || 'Unknown error occurred',
          variant: 'destructive'
        });
      }
    } catch (err) {
      console.error('Error claiming reward:', err);
      setRewardStatus('Error processing reward');
      toast({
        title: 'Reward Error',
        description: 'There was an error processing your reward',
        variant: 'destructive'
      });
    } finally {
      setIsRewarding(false);
    }
  };

  // Format time from seconds
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Map Container */}
      <div 
        id="map" 
        className="w-full h-[400px] rounded-lg overflow-hidden relative"
        style={{ background: '#242f3e' }}
      >
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark-gray bg-opacity-80">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>
      
      {/* Controls */}
      <Card className="bg-dark-gray border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <div className="w-6 h-6 rounded-full bg-primary mr-2 flex items-center justify-center">
              <span className="material-icons text-sm">directions_run</span>
            </div>
            Activity Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-xs text-gray-400">Distance</p>
              <p className="text-xl font-mono font-semibold">{totalDistance.toFixed(2)} km</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Duration</p>
              <p className="text-xl font-mono font-semibold">
                {isTracking 
                  ? formatTime(Math.floor((Date.now() - (locations[0]?.timestamp || Date.now())) / 1000)) 
                  : '00:00:00'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Rewards</p>
              <p className="text-xl font-mono font-semibold text-primary">{totalDistance.toFixed(2)} MOVE</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Badge variant={isTracking ? "default" : "outline"} className="capitalize">
                {isTracking ? 'Tracking' : 'Ready'}
              </Badge>
              {location && (
                <span className="text-xs text-gray-400">
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </span>
              )}
            </div>
            
            <div className="flex space-x-2">
              {!isTracking ? (
                <Button 
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={startTracking}
                >
                  <span className="material-icons text-sm mr-1">play_arrow</span>
                  Start Tracking
                </Button>
              ) : (
                <Button 
                  className="flex-1 bg-destructive hover:bg-destructive/90"
                  onClick={stopTracking}
                >
                  <span className="material-icons text-sm mr-1">stop</span>
                  Stop Tracking
                </Button>
              )}
              
              <Button 
                className="flex-1 border border-primary hover:bg-primary hover:bg-opacity-10"
                onClick={handleClaimReward}
                disabled={isRewarding || totalDistance < 0.1 || isTracking || !address}
              >
                <span className="material-icons text-sm mr-1">redeem</span>
                Claim Rewards
              </Button>
            </div>
            
            {rewardStatus && (
              <div className="text-xs text-gray-400 text-center">
                {rewardStatus}
              </div>
            )}
            
            {error && (
              <div className="text-xs text-destructive text-center">
                {error}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Activity Stats */}
      {isTracking && locations.length > 1 && (
        <Card className="bg-dark-gray border-0">
          <CardContent className="pt-4">
            <h3 className="text-sm font-medium mb-2">Activity Progress</h3>
            <Progress value={Math.min(totalDistance * 10, 100)} className="h-1.5 mb-2" />
            <div className="flex justify-between text-xs text-gray-400">
              <span>0 km</span>
              <span>5 km</span>
              <span>10 km</span>
            </div>
            
            <div className="mt-4 text-xs text-gray-400">
              <p>As you move, you earn MOVE tokens at a rate of 1 token per kilometer.</p>
              <p className="mt-1">Walk or run to earn more rewards!</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}