import { useState, useEffect } from 'react';
import { useLocation } from '@/context/LocationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Activity } from '@shared/schema';
import { formatDistance, formatDuration, formatPace } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'this-week' | 'this-month'>('all');
  const { toast } = useToast();
  const { isTracking } = useLocation();

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // In a real app, we'd fetch from the user's ID, but for demo we'll use 1
        const userId = 1;
        const res = await apiRequest('GET', `/api/users/${userId}/activities`, undefined);
        const data = await res.json();
        setActivities(data);
      } catch (error) {
        toast({
          title: "Failed to load activities",
          description: "Could not retrieve your activity history.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [toast]);

  // Filter activities based on the active tab
  const filteredActivities = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    switch (activeTab) {
      case 'this-week':
        return activities.filter(activity => new Date(activity.startedAt) >= oneWeekAgo);
      case 'this-month':
        return activities.filter(activity => new Date(activity.startedAt) >= oneMonthAgo);
      default:
        return activities;
    }
  };

  // Calculate total stats
  const calculateTotals = () => {
    const filtered = filteredActivities();
    return {
      totalDistance: filtered.reduce((sum, activity) => sum + activity.distanceKm, 0),
      totalDuration: filtered.reduce((sum, activity) => sum + activity.durationSeconds, 0),
      totalTokens: filtered.reduce((sum, activity) => sum + activity.tokensEarned, 0),
      activityCount: filtered.length
    };
  };

  const totals = calculateTotals();

  return (
    <div className="flex flex-col min-h-screen bg-dark text-light-gray pt-4 px-4 pb-20">
      <h1 className="text-2xl font-bold mb-4">Activity History</h1>
      
      {isTracking && (
        <div className="bg-primary/10 border border-primary rounded-lg p-3 mb-4 flex items-center">
          <span className="material-icons text-primary mr-2">directions_run</span>
          <p className="text-sm">Activity in progress...</p>
        </div>
      )}
      
      <Tabs defaultValue="all" onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="all">All Time</TabsTrigger>
          <TabsTrigger value="this-week">This Week</TabsTrigger>
          <TabsTrigger value="this-month">This Month</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <ActivitySummary totals={totals} />
          <ActivityList activities={filteredActivities()} isLoading={isLoading} />
        </TabsContent>
        
        <TabsContent value="this-week" className="space-y-4">
          <ActivitySummary totals={totals} />
          <ActivityList activities={filteredActivities()} isLoading={isLoading} />
        </TabsContent>
        
        <TabsContent value="this-month" className="space-y-4">
          <ActivitySummary totals={totals} />
          <ActivityList activities={filteredActivities()} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ActivitySummaryProps {
  totals: {
    totalDistance: number;
    totalDuration: number;
    totalTokens: number;
    activityCount: number;
  };
}

function ActivitySummary({ totals }: ActivitySummaryProps) {
  return (
    <Card className="bg-dark-gray border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-md">Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-dark rounded-lg p-3">
            <p className="text-xs text-gray-400">Total Distance</p>
            <p className="text-xl font-bold">{formatDistance(totals.totalDistance)} <span className="text-sm">km</span></p>
          </div>
          <div className="bg-dark rounded-lg p-3">
            <p className="text-xs text-gray-400">Activities</p>
            <p className="text-xl font-bold">{totals.activityCount}</p>
          </div>
          <div className="bg-dark rounded-lg p-3">
            <p className="text-xs text-gray-400">Total Time</p>
            <p className="text-xl font-bold">{formatDuration(totals.totalDuration)}</p>
          </div>
          <div className="bg-dark rounded-lg p-3">
            <p className="text-xs text-gray-400">MOVE Earned</p>
            <p className="text-xl font-bold text-secondary">{totals.totalTokens.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ActivityListProps {
  activities: Activity[];
  isLoading: boolean;
}

function ActivityList({ activities, isLoading }: ActivityListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-dark-gray rounded-lg p-8 text-center">
        <span className="material-icons text-4xl text-gray-500 mb-2">directions_walk</span>
        <p className="text-gray-400">No activities found for this period</p>
        <Button className="mt-4 bg-primary hover:bg-primary/90">Start Moving</Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Activities</h2>
      
      {activities.map((activity) => (
        <Card key={activity.id} className="bg-dark-gray border-0">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                <span className="material-icons text-primary">directions_walk</span>
              </div>
              <div className="flex-grow">
                <div className="flex justify-between">
                  <h3 className="font-medium">
                    {new Date(activity.startedAt).toLocaleDateString(undefined, { 
                      month: 'short', 
                      day: 'numeric'
                    })}
                  </h3>
                  <p className="text-secondary font-mono">+{activity.tokensEarned.toFixed(2)} MOVE</p>
                </div>
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-400">
                    {formatDistance(activity.distanceKm)} km • {formatDuration(activity.durationSeconds)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatPace(activity.durationSeconds, activity.distanceKm)}/km
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
