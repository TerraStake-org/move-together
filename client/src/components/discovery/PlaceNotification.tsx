import React from 'react';
import { MapPin, Volume2, Award, Box } from 'lucide-react';
import { Place } from '@/services/PlaceDiscoveryService';
import { usePlaceDiscovery } from '@/context/PlaceDiscoveryContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface PlaceNotificationProps {
  place: Place;
  onClose: () => void;
}

export default function PlaceNotification({ place, onClose }: PlaceNotificationProps) {
  const { 
    playAudioGuide, 
    currentPlayingAudio, 
    stopAudioGuide, 
    collectBadge, 
    hasVisited,
    showARContent
  } = usePlaceDiscovery();
  
  const isPlaying = currentPlayingAudio === place.id;
  const hasAlreadyVisited = hasVisited(place.id);
  
  const handlePlayAudio = () => {
    if (isPlaying) {
      stopAudioGuide();
    } else {
      playAudioGuide(place.id);
    }
  };
  
  const handleCollectBadge = async () => {
    const success = await collectBadge(place.id);
    if (success) {
      // Maybe we don't close immediately to show some animation or feedback
      setTimeout(onClose, 2000);
    }
  };
  
  const handleShowAR = () => {
    showARContent(place.id);
  };
  
  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-2 border-primary">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold flex items-center">
              <MapPin className="h-5 w-5 mr-1 text-primary" />
              {place.name}
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              {hasAlreadyVisited ? (
                <Badge variant="outline" className="bg-muted">
                  Previously Visited
                </Badge>
              ) : (
                <Badge className="bg-primary text-primary-foreground">
                  New Discovery!
                </Badge>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground">{place.description}</p>
      </CardContent>
      
      <CardFooter className="flex flex-wrap gap-2 pt-2">
        {place.audioGuide && (
          <Button
            variant={isPlaying ? "destructive" : "outline"}
            size="sm"
            onClick={handlePlayAudio}
            className="flex items-center"
          >
            <Volume2 className="h-4 w-4 mr-1" />
            {isPlaying ? "Stop Audio" : "Play Audio Guide"}
          </Button>
        )}
        
        {place.badgeNFT && (
          <Button
            variant="default"
            size="sm"
            onClick={handleCollectBadge}
            className="flex items-center"
            disabled={hasAlreadyVisited}
          >
            <Award className="h-4 w-4 mr-1" />
            {hasAlreadyVisited ? "Badge Collected" : "Collect Badge NFT"}
          </Button>
        )}
        
        {place.arContent && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleShowAR}
            className="flex items-center"
          >
            <Box className="h-4 w-4 mr-1" />
            View in AR
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}