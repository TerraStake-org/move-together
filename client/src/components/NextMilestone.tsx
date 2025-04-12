import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { Milestone } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { calculateProgressPercentage } from '@/lib/utils';

export default function NextMilestone() {
  const [milestone, setMilestone] = useState<Milestone | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchNextMilestone = async () => {
      try {
        // In a real app, we'd fetch from the current user's ID
        // For demo, we'll use user ID 1
        const userId = 1;
        const res = await apiRequest('GET', `/api/users/${userId}/milestones`, undefined);
        const data = await res.json();
        
        // Find the first incomplete milestone
        const nextMilestone = data.find((m: Milestone) => !m.completed);
        setMilestone(nextMilestone || null);
      } catch (error) {
        toast({
          title: "Failed to load milestones",
          description: "Could not retrieve your next milestone.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchNextMilestone();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="bg-dark-gray rounded-xl p-4 mb-3">
        <h3 className="text-sm font-medium mb-2">Next Milestone</h3>
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!milestone) {
    // If no milestones or all are completed
    return (
      <div className="bg-dark-gray rounded-xl p-4 mb-3">
        <h3 className="text-sm font-medium mb-2">Next Milestone</h3>
        <div className="text-center py-4">
          <span className="material-icons text-2xl text-gray-500 mb-2">done_all</span>
          <p className="text-sm text-gray-400">All milestones completed!</p>
        </div>
      </div>
    );
  }

  // Calculate progress percentage
  const progressPercent = calculateProgressPercentage(
    milestone.currentProgress, 
    milestone.requiredProgress
  );

  return (
    <div className="bg-dark-gray rounded-xl p-4 mb-3">
      <h3 className="text-sm font-medium mb-2">Next Milestone</h3>
      <div className="flex items-center mb-2">
        <div className={`w-10 h-10 bg-accent bg-opacity-20 rounded-full flex items-center justify-center mr-3`}>
          <span className={`material-icons text-accent text-sm`}>{milestone.icon}</span>
        </div>
        <div>
          <h4 className="font-medium">{milestone.title}</h4>
          <p className="text-xs text-gray-400">{milestone.description}</p>
        </div>
      </div>
      <div className="progress-track">
        <div 
          className="progress-fill" 
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>
      <div className="flex justify-between mt-1">
        <p className="text-xs text-gray-400">
          {milestone.currentProgress} of {milestone.requiredProgress} {milestone.title.toLowerCase().includes('day') ? 'days' : ''}
        </p>
        <p className="text-xs">
          Reward: <span className="text-secondary font-mono">{milestone.reward} MOVE</span>
        </p>
      </div>
    </div>
  );
}
