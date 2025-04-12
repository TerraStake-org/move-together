import { useState, useEffect } from 'react';
import { useLocation } from '@/context/LocationContext';
import { useWeb3 } from '@/context/Web3Context';
import OfflineMap from '@/components/map/OfflineMap';
import ActivityStats from '@/components/ActivityStats';
import TokenOverview from '@/components/TokenOverview';
import Achievements from '@/components/Achievements';
import NextMilestone from '@/components/NextMilestone';
import VoiceCommandModal from '@/components/modals/VoiceCommandModal';
import StakeModal from '@/components/modals/StakeModal';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { calculateReward } from '@/lib/utils';
import { rewardUserForDistance } from '@/web3/TokenMinter';
import { getStakingInfo } from '@/web3/MoveStaking';
import { useQuery } from '@tanstack/react-query';

interface MoveStats {
  distance: number;
  duration: number;
  pace: number;
}

export default function MapView() {
  const { location, isTracking, totalDistance, startTracking, stopTracking, error: locationError } = useLocation();
  const { address, signer, isConnected, connect } = useWeb3();
  const { toast } = useToast();

  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);
  const [moveStats, setMoveStats] = useState<MoveStats>({
    distance: 0,
    duration: 0,
    pace: 0
  });
  const [startTime, setStartTime] = useState<number | null>(null);

  // Query for staking info
  const { data: stakingInfo, refetch: refetchStakingInfo } = useQuery({
    queryKey: ['stakingInfo', address],
    queryFn: async () => {
      if (!address || !signer?.provider) return null;
      return getStakingInfo(address, signer.provider);
    },
    enabled: !!address && !!signer?.provider,
  });

  // Status bar info
  const isOfflineModeReady = true; // This would come from the OfflineMap component in a real implementation

  // Update stats while tracking is active
  useEffect(() => {
    if (!isTracking) return;

    if (!startTime) {
      setStartTime(Date.now());
    }

    const interval = setInterval(() => {
      if (startTime) {
        const duration = (Date.now() - startTime) / 1000; // in seconds
        const pace = totalDistance > 0 ? duration / 60 / totalDistance : 0; // min/km

        setMoveStats({
          distance: totalDistance,
          duration,
          pace
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isTracking, startTime, totalDistance]);

  // Handle tracking toggle
  const handleTrackingToggle = async () => {
    if (isTracking) {
      stopTracking();
      setStartTime(null);
      
      // Reward the user for their distance if connected to wallet
      if (isConnected && address && signer && totalDistance > 0) {
        // Calculate base reward from distance
        const baseReward = calculateReward(totalDistance);
        
        // Apply time-of-day bonus
        const timeBonus = calculateTimeBonus(baseReward);
        
        // Get user's streak (in a real app, this would come from the database)
        // For demo, we'll assume a streak of 1 day (no streak bonus yet)
        const userStreak = 1;
        const finalReward = calculateStreakBonus(timeBonus, userStreak);
        
        try {
          // Call blockchain to mint tokens
          const result = await rewardUserForDistance(address, finalReward, signer);
          
          if (result.success) {
            // Show detailed reward breakdown
            let rewardDescription = `Base reward: ${baseReward.toFixed(2)} MOVE tokens\n`;
            
            // Add bonus descriptions if applicable
            if (timeBonus > baseReward) {
              rewardDescription += `Time bonus: +${(timeBonus - baseReward).toFixed(2)} MOVE tokens\n`;
            }
            
            if (userStreak > 1) {
              rewardDescription += `Streak bonus: +${(finalReward - timeBonus).toFixed(2)} MOVE tokens\n`;
            }
            
            rewardDescription += `\nTotal: ${finalReward.toFixed(2)} MOVE tokens`;
            
            toast({
              title: "Tokens Earned!",
              description: `You earned ${finalReward.toFixed(2)} MOVE tokens for your activity.`,
            });
            
            // Show detailed breakdown in console for now
            console.log('Reward breakdown:', rewardDescription);
            
            // Refetch staking info after minting
            refetchStakingInfo();
          } else {
            toast({
              title: "Failed to Mint Tokens",
              description: result.error || "Unknown error occurred",
              variant: "destructive",
            });
          }
        } catch (error) {
          toast({
            title: "Reward Error",
            description: "There was an error processing your rewards.",
            variant: "destructive",
          });
        }
      }
    } else {
      startTracking();
    }
  };

  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      await connect();
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to your wallet.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-dark text-light-gray">
      {/* STATUS BAR */}
      <div className="bg-dark-gray p-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className={`h-3 w-3 rounded-full mr-2 ${location ? 'bg-secondary animate-pulse' : 'bg-error'}`}></div>
          <span className="text-sm">{location ? 'GPS Active' : 'GPS Inactive'}</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <span className="material-icons text-sm mr-1">wifi_off</span>
            <span className="text-sm">{isOfflineModeReady ? 'Offline Maps Ready' : 'Maps not cached'}</span>
          </div>
          {isConnected ? (
            <div className="bg-primary px-3 py-1 rounded-full text-xs flex items-center">
              <span className="material-icons text-sm mr-1">account_balance_wallet</span>
              <span>Connected</span>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full flex items-center text-xs" 
              onClick={handleConnectWallet}
            >
              <span className="material-icons text-sm mr-1">account_balance_wallet</span>
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
      
      {/* MAP VIEW */}
      <div className="relative">
        <OfflineMap 
          location={location}
          onZoomIn={() => {}}
          onZoomOut={() => {}}
          onToggleMapType={() => {}}
          onGoToCurrentLocation={() => {}}
        />
        
        {/* Voice Command Button */}
        <Button
          variant="secondary"
          className="absolute bottom-24 left-4 bg-accent hover:bg-accent/90 p-3 rounded-full shadow-lg"
          onClick={() => setIsVoiceModalOpen(true)}
        >
          <span className="material-icons">mic</span>
        </Button>
        
        {/* Tracking Button */}
        <Button
          variant="default"
          className={`absolute bottom-24 right-4 ${isTracking ? 'bg-error hover:bg-error/90' : 'bg-primary hover:bg-primary/90'} p-3 rounded-full shadow-lg`}
          onClick={handleTrackingToggle}
        >
          <span className="material-icons">{isTracking ? 'stop' : 'play_arrow'}</span>
        </Button>
      </div>
      
      {/* STATS DASHBOARD */}
      <div className="flex-grow bg-dark px-4 py-6 -mt-2 rounded-t-3xl shadow-lg">
        
        {/* Activity Stats */}
        <ActivityStats 
          distance={moveStats.distance}
          duration={moveStats.duration}
          pace={moveStats.pace}
        />
        
        {/* MOVE Token Overview */}
        <TokenOverview 
          balance={stakingInfo?.stakedAmount}
          staked={stakingInfo?.stakedAmount}
          rewards={stakingInfo?.pendingRewards}
          onStake={() => setIsStakeModalOpen(true)}
          onClaim={() => {}}
        />
        
        {/* Achievements Section */}
        <Achievements />
        
        {/* Next Milestone */}
        <NextMilestone />
      </div>
      
      {/* MODALS */}
      <VoiceCommandModal 
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
      />
      
      <StakeModal 
        isOpen={isStakeModalOpen}
        onClose={() => setIsStakeModalOpen(false)}
        stakingInfo={stakingInfo}
        onStakingComplete={() => refetchStakingInfo()}
      />
    </div>
  );
}
