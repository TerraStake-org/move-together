import React from 'react';
import { Award, MapPin, Headphones } from 'lucide-react';
import { usePlaceDiscovery } from '@/context/PlaceDiscoveryContext';
import { Button } from '@/components/ui/button';

interface BadgeCollectionProps {
  onViewOnMap?: (placeId: string) => void;
}

export default function BadgeCollection({ onViewOnMap }: BadgeCollectionProps) {
  const { visitedPlaces } = usePlaceDiscovery();

  if (visitedPlaces.length === 0) {
    return (
      <div className="text-center py-6 bg-blue-50/10 rounded-xl">
        <Award className="h-10 w-10 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-400">No badges collected yet</p>
        <p className="text-sm text-gray-500 mt-1">
          Explore places to earn location badges
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {visitedPlaces.map(place => (
        <div 
          key={place.id}
          className="flex flex-col items-center p-3 rounded-lg bg-blue-50/10 border border-blue-100/10 transition-all hover:bg-blue-900/10"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 mb-2">
            <Award className="h-6 w-6 text-white" />
          </div>
          <p className="text-xs font-medium text-center line-clamp-1">
            {place.name}
          </p>
          
          <div className="flex gap-1 mt-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full"
              onClick={() => onViewOnMap && onViewOnMap(place.id)}
            >
              <MapPin className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full"
            >
              <Headphones className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}