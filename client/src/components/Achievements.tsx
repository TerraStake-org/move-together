import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { Achievement } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export default function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        // In a real app, we'd fetch from the current user's ID
        // For demo, we'll use user ID 1
        const userId = 1;
        const res = await apiRequest('GET', `/api/users/${userId}/achievements`, undefined);
        const data = await res.json();
        setAchievements(data);
      } catch (error) {
        toast({
          title: "Failed to load achievements",
          description: "Could not retrieve your achievements.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAchievements();
  }, [toast]);

  if (isLoading) {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-3">Achievements</h2>
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (achievements.length === 0) {
    // If no achievements yet, show placeholder with empty state
    return (
      <div>
        <h2 className="text-lg font-semibold mb-3">Achievements</h2>
        <div className="bg-dark-gray rounded-xl p-6 mb-3 text-center">
          <span className="material-icons text-3xl text-gray-500 mb-2">emoji_events</span>
          <p className="text-sm text-gray-400">No achievements yet</p>
          <p className="text-xs text-gray-500 mt-1">Start moving to earn achievements</p>
        </div>
      </div>
    );
  }

  // If we have achievements, show them
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Achievements</h2>
      
      {achievements.map((achievement) => (
        <div 
          key={achievement.id} 
          className="bg-dark-gray rounded-xl p-4 mb-3 flex items-center"
        >
          <div className="w-12 h-12 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mr-4">
            <span className="material-icons text-primary">{achievement.icon}</span>
          </div>
          <div className="flex-grow">
            <h3 className="font-medium">{achievement.title}</h3>
            <p className="text-xs text-gray-400">{achievement.description}</p>
          </div>
          <div className="token-glow bg-dark px-3 py-1 rounded-full flex items-center">
            <span className="font-mono text-sm">+{achievement.reward}</span>
            <span className="text-secondary text-xs ml-1">MOVE</span>
          </div>
        </div>
      ))}
    </div>
  );
}
