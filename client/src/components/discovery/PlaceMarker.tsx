import React from 'react';
import { Place } from '@/services/PlaceDiscoveryService';
import { usePlaceDiscovery } from '@/context/PlaceDiscoveryContext';
import { cn } from '@/lib/utils';

interface PlaceMarkerProps {
  place: Place;
  onClick: () => void;
}

export default function PlaceMarker({ place, onClick }: PlaceMarkerProps) {
  const { hasVisited, currentPlayingAudio } = usePlaceDiscovery();
  
  const isPlaying = currentPlayingAudio === place.id;
  const isVisited = hasVisited(place.id);
  
  return (
    <div 
      className={cn(
        "absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer",
        "transition-all duration-300 hover:scale-110 z-10"
      )}
      onClick={onClick}
    >
      <div 
        className={cn(
          "h-8 w-8 rounded-full flex items-center justify-center",
          isPlaying 
            ? "bg-primary text-primary-foreground animate-pulse shadow-lg scale-110" 
            : isVisited 
              ? "bg-secondary text-secondary-foreground shadow" 
              : "bg-primary text-primary-foreground shadow"
        )}
      >
        {/* Icon based on type of place */}
        {place.audioGuide && (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isPlaying ? "animate-spin-slow" : ""}>
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="4"></circle>
          </svg>
        )}
        
        {place.badgeNFT && !place.audioGuide && (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="6"></circle>
            <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
          </svg>
        )}
        
        {place.arContent && !place.audioGuide && !place.badgeNFT && (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.29 7 12 12 20.71 7"></polyline>
            <line x1="12" y1="22" x2="12" y2="12"></line>
          </svg>
        )}
      </div>
      
      {/* Tooltip with place name */}
      <div 
        className={cn(
          "absolute top-full left-1/2 transform -translate-x-1/2 mt-1",
          "bg-background border border-border shadow-md rounded px-2 py-1",
          "text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100",
          "transition-opacity duration-200"
        )}
      >
        {place.name}
      </div>
      
      {/* Ripple effect for active places */}
      {isPlaying && (
        <>
          <div className="absolute inset-0 rounded-full bg-primary opacity-30 animate-ping"></div>
          <div className="absolute inset-0 rounded-full bg-primary opacity-20 animate-pulse"></div>
        </>
      )}
    </div>
  );
}