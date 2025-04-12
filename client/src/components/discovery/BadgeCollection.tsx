import React from 'react';
import { Award, MapPin, Info } from 'lucide-react';
import { usePlaceDiscovery } from '@/context/PlaceDiscoveryContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface BadgeCollectionProps {
  onViewOnMap?: (placeId: string) => void;
}

export default function BadgeCollection({ onViewOnMap }: BadgeCollectionProps) {
  const { visitedPlaces, playAudioGuide } = usePlaceDiscovery();
  
  const handlePlayAudio = (placeId: string) => {
    playAudioGuide(placeId);
  };
  
  const handleViewOnMap = (placeId: string) => {
    if (onViewOnMap) {
      onViewOnMap(placeId);
    }
  };
  
  // Filter places that have badges
  const placesWithBadges = visitedPlaces.filter(place => place.badgeNFT);
  
  if (placesWithBadges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Award className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Badges Collected Yet</h3>
        <p className="text-muted-foreground max-w-md">
          Explore the world around you to discover and collect location-based badges. 
          Each badge represents a unique place you've visited.
        </p>
      </div>
    );
  }
  
  return (
    <div className="badge-collection w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center">
          <Award className="h-6 w-6 mr-2 text-primary" />
          Your Badge Collection
        </h2>
        <Badge variant="outline" className="text-xs">
          {placesWithBadges.length} Badge{placesWithBadges.length !== 1 ? 's' : ''}
        </Badge>
      </div>
      
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
          {placesWithBadges.map(place => (
            <Card key={place.id} className="overflow-hidden border-2 border-primary/20 hover:border-primary/50 transition-colors">
              {place.badgeNFT && (
                <div className="aspect-square relative bg-gradient-to-br from-primary/10 to-primary/30">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full bg-primary/20 p-8">
                      <Award className="h-16 w-16 text-primary" />
                    </div>
                  </div>
                </div>
              )}
              
              <CardHeader className="pb-2">
                <CardTitle>{place.badgeNFT?.name || place.name}</CardTitle>
                <CardDescription className="flex items-center text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  {place.name}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="text-sm text-muted-foreground">
                <p>{place.badgeNFT?.description || place.description}</p>
              </CardContent>
              
              <CardFooter className="flex justify-between pt-2">
                {place.audioGuide && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handlePlayAudio(place.id)}
                    className="text-xs"
                  >
                    Play Audio
                  </Button>
                )}
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleViewOnMap(place.id)}
                  className="text-xs"
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  View on Map
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}