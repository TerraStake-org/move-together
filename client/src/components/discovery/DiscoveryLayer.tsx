import React, { useState, useEffect } from 'react';
import { Activity, MapPin, Info, Music, Award } from 'lucide-react';
import { useLocation } from '@/context/LocationContext';
import { usePlaceDiscovery } from '@/context/PlaceDiscoveryContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DiscoveryLayer() {
  const { location } = useLocation();
  const { 
    nearbyPlaces, 
    activePlaces, 
    visitedPlaces, 
    currentPlayingAudio,
    playAudioGuide,
    stopAudioGuide,
    collectBadge, 
    hasVisited 
  } = usePlaceDiscovery();
  
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  
  // Auto-select the closest place if it's active and not yet visited
  useEffect(() => {
    if (activePlaces.length > 0 && !selectedPlace) {
      const closestActive = activePlaces[0];
      if (!hasVisited(closestActive.id)) {
        setSelectedPlace(closestActive.id);
      }
    }
  }, [activePlaces, hasVisited, selectedPlace]);
  
  // Clear selection if no more active places
  useEffect(() => {
    if (activePlaces.length === 0 && selectedPlace) {
      setSelectedPlace(null);
    }
  }, [activePlaces, selectedPlace]);
  
  if (!location) return null;
  
  // Get the current selected place details
  const activePlace = selectedPlace
    ? activePlaces.find(p => p.id === selectedPlace) || null
    : null;
  
  return (
    <>
      {/* Active Place Detail Panel */}
      {activePlace && (
        <Card className="absolute bottom-32 left-4 right-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-xl rounded-xl overflow-hidden z-50 border-0">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shrink-0">
                {currentPlayingAudio === activePlace.id ? (
                  <Music className="h-6 w-6 text-white animate-pulse" />
                ) : (
                  <MapPin className="h-6 w-6 text-white" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold truncate">
                    {activePlace.name}
                  </h3>
                  <Badge 
                    variant="secondary" 
                    className="ml-2 shrink-0 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                  >
                    {Math.round(activePlace.distance)}m away
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                  {activePlace.description}
                </p>
                
                <div className="flex gap-2 mt-3">
                  {/* Audio Guide Button */}
                  <Button
                    variant={currentPlayingAudio === activePlace.id ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      if (currentPlayingAudio === activePlace.id) {
                        stopAudioGuide();
                      } else {
                        playAudioGuide(activePlace.id);
                      }
                    }}
                  >
                    <Music className="h-4 w-4 mr-2" />
                    {currentPlayingAudio === activePlace.id ? "Stop Guide" : "Play Audio Guide"}
                  </Button>
                  
                  {/* Collect Badge Button */}
                  {!hasVisited(activePlace.id) && (
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                      onClick={() => collectBadge(activePlace.id)}
                    >
                      <Award className="h-4 w-4 mr-2" />
                      Collect Badge
                    </Button>
                  )}
                  
                  {/* Already Collected Badge */}
                  {hasVisited(activePlace.id) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled
                      className="flex-1"
                    >
                      <Award className="h-4 w-4 mr-2 text-emerald-500" />
                      Badge Collected
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Places Nearby Indicator */}
      {nearbyPlaces.length > 0 && !activePlace && (
        <div className="absolute bottom-32 right-4 z-50">
          <Button
            variant="default"
            size="sm"
            className="rounded-full shadow-lg bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-200 dark:border-gray-700"
          >
            <Activity className="h-4 w-4 mr-2 text-blue-500" />
            {nearbyPlaces.length} {nearbyPlaces.length === 1 ? 'place' : 'places'} nearby
          </Button>
        </div>
      )}
      
      {/* Active Places Markers (if any) */}
      {activePlaces.map(place => (
        <div key={place.id} className="absolute z-40 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: '50%',
            bottom: '50%',
            marginBottom: '50px', // Show above the location marker
          }}>
          <Button
            variant="default"
            size="sm"
            className={`rounded-full ${
              hasVisited(place.id) 
                ? 'bg-emerald-500 hover:bg-emerald-600' 
                : 'bg-blue-500 hover:bg-blue-600 animate-bounce'
            } shadow-xl p-3`}
            onClick={() => setSelectedPlace(place.id)}
          >
            {hasVisited(place.id) ? (
              <Award className="h-5 w-5 text-white" />
            ) : (
              <MapPin className="h-5 w-5 text-white" />
            )}
          </Button>
          
          <div className="absolute left-1/2 transform -translate-x-1/2 top-12 whitespace-nowrap">
            <span className="px-2 py-1 rounded bg-black/70 text-white text-xs">
              {place.name}
            </span>
          </div>
        </div>
      ))}
    </>
  );
}