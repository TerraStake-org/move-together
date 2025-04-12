import React, { useState, useEffect } from 'react';
import { usePlaceDiscovery } from '@/context/PlaceDiscoveryContext';
import PlaceMarker from './PlaceMarker';
import PlaceNotification from './PlaceNotification';
import AudioGuidePlayer from './AudioGuidePlayer';
import { Place } from '@/services/PlaceDiscoveryService';
import {
  Dialog,
  DialogContent
} from '@/components/ui/dialog';

interface DiscoveryLayerProps {
  mapComponent: React.ReactNode;
}

export default function DiscoveryLayer({ mapComponent }: DiscoveryLayerProps) {
  const { nearbyPlaces, activePlaces } = usePlaceDiscovery();
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPlaces, setNewPlaces] = useState<Place[]>([]);
  
  // Handle new places found
  useEffect(() => {
    if (nearbyPlaces.length > 0) {
      setNewPlaces(prev => [...prev, ...nearbyPlaces]);
      
      // Show notification for the first place
      if (nearbyPlaces[0] && !selectedPlace) {
        setSelectedPlace(nearbyPlaces[0]);
        setIsDialogOpen(true);
      }
    }
  }, [nearbyPlaces]);
  
  // Close dialog and clear selected place
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedPlace(null);
  };
  
  // Handle marker click
  const handlePlaceMarkerClick = (place: Place) => {
    setSelectedPlace(place);
    setIsDialogOpen(true);
  };
  
  return (
    <div className="discovery-layer w-full h-full relative">
      {/* Main map component */}
      {mapComponent}
      
      {/* Place markers */}
      <div className="place-markers absolute inset-0 pointer-events-none">
        <div className="relative w-full h-full">
          {activePlaces.map(place => (
            <div 
              key={place.id} 
              className="pointer-events-auto"
              style={{ 
                position: 'absolute', 
                left: `${Math.random() * 80 + 10}%`, // Random positioning for demo
                top: `${Math.random() * 80 + 10}%`   // Would use real coordinates in production
              }}
            >
              <PlaceMarker 
                place={place} 
                onClick={() => handlePlaceMarkerClick(place)} 
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Place notification dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md p-0 gap-0 border-none">
          {selectedPlace && (
            <PlaceNotification 
              place={selectedPlace} 
              onClose={handleCloseDialog} 
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Audio player control */}
      <AudioGuidePlayer />
    </div>
  );
}