import React from 'react';
import { formatDistance, formatDuration, formatPace } from '@/lib/utils';

interface ActivityStatsProps {
  distance: number;
  duration: number;
  pace: number;
  unit?: 'km' | 'mi';
}

export default function ActivityStats({ 
  distance, 
  duration, 
  pace,
  unit = 'km'
}: ActivityStatsProps) {
  return (
    <div className="flex justify-between mb-6">
      <div className="text-center">
        <p className="text-xs text-gray-400">Distance</p>
        <h3 className="text-xl font-bold">
          {formatDistance(distance, unit)}
          <span className="text-sm ml-1">{unit}</span>
        </h3>
      </div>
      <div className="text-center">
        <p className="text-xs text-gray-400">Duration</p>
        <h3 className="text-xl font-bold">{formatDuration(duration)}</h3>
      </div>
      <div className="text-center">
        <p className="text-xs text-gray-400">Pace</p>
        <h3 className="text-xl font-bold">
          {formatPace(duration, distance, unit)}
          <span className="text-xs ml-1">/{unit}</span>
        </h3>
      </div>
    </div>
  );
}
