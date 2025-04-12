import { useState, useEffect } from 'react';
import { useLocation } from '@/context/LocationContext';
import { useWeb3 } from '@/context/Web3Context';
import { useTheme } from '@/context/ThemeContext';
import { usePlaceDiscovery } from '@/context/PlaceDiscoveryContext';
import ModernMap from '@/components/map/ModernMap';
import RealTimeLocationMap from '@/components/map/RealTimeLocationMap';
import ActivityStats from '@/components/ActivityStats';
import TokenOverview from '@/components/TokenOverview';
import Achievements from '@/components/Achievements';
import NextMilestone from '@/components/NextMilestone';
import MovementIntensityIndicator from '@/components/MovementIntensityIndicator';
import VoiceCommandModal from '@/components/modals/VoiceCommandModal';
import StakeModal from '@/components/modals/StakeModal';
import RewardDetailsModal from '@/components/modals/RewardDetailsModal';
import LocationNFTMinter from '@/components/nft/LocationNFTMinter';
import LocationNFTCollection from '@/components/nft/LocationNFTCollection';
import DiscoveryLayer from '@/components/discovery/DiscoveryLayer';
import BadgeCollection from '@/components/discovery/BadgeCollection';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VoiceCommandButton } from '@/components/voice/VoiceCommandButton';
import { calculateReward, calculateStreakBonus, calculateTimeBonus } from '@/lib/utils';
import { rewardUserForDistance } from '@/web3/TokenMinter';
import { getStakingInfo } from '@/web3/MoveStaking';
import { MintedNFT } from '@/web3/LocationNFT';
import { useQuery } from '@tanstack/react-query';
import { Camera, Map as MapIcon, Award as AwardIcon, Headphones, Plus, Gift, Square, Play, Coins as Coin } from 'lucide-react';

interface MoveStats {
  distance: number;
  duration: number;
  pace: number;
}

export default function MapView() {
  const { location, locations, isTracking, totalDistance, startTracking, stopTracking, error: locationError } = useLocation();
  const { provider, address, signer, isConnected } = useWeb3();
  const { toast } = useToast();
  
  // UI states
  const [mapType, setMapType] = useState<'modern' | 'real-time'>('modern');
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);
  const [isRewardDetailsModalOpen, setIsRewardDetailsModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isNFTMinterOpen, setIsNFTMinterOpen] = useState(false);
  const [isNFTCollectionOpen, setIsNFTCollectionOpen] = useState(false);
  const [rewardBreakdown, setRewardBreakdown] = useState<any>({
    baseReward: 0,
    timeBonus: 0,
    streakBonus: 0,
    finalReward: 0,
    userStreak: 1,
    isTimeBonusActive: false
  });
  
  // Staking info
  const [stakingInfo, setStakingInfo] = useState<any>(null);
  
  // Movement stats
  const [moveStats, setMoveStats] = useState<MoveStats>({
    distance: 0,
    duration: 0,
    pace: 0
  });
  
  // Session timers
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  
  // Fetch staking info
  const { data: stakingData, refetch: refetchStakingInfo } = useQuery({
    queryKey: ['staking-info', address],
    queryFn: async () => {
      if (!address || !provider) return null;
      
      try {
        const info = await getStakingInfo(address, provider);
        if (info.success) {
          return {
            stakedAmount: info.staked || '0',
            totalStaked: '125000', // Example global staking
            rewardRate: '12.5',
            pendingRewards: info.pendingRewards || '0',
            lastStakedAt: info.lastStakedAt ? info.lastStakedAt.getTime() : 0
          };
        }
        return null;
      } catch (error) {
        console.error('Error fetching staking info:', error);
        return null;
      }
    },
    enabled: !!address && !!provider
  });
  
  // Update stakingInfo state when data changes
  useEffect(() => {
    if (stakingData) {
      setStakingInfo(stakingData);
    }
  }, [stakingData]);
  
  // Update the timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isTracking && sessionStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000);
        setElapsedTime(elapsed);
        
        // Update stats
        if (locations.length > 0) {
          const pace = elapsed > 0 ? (totalDistance / (elapsed / 60)) : 0;
          setMoveStats({
            distance: totalDistance,
            duration: elapsed,
            pace: pace
          });
        }
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isTracking, sessionStartTime, locations, totalDistance]);
  
  // Handle tracking start/stop
  const handleStartTracking = async () => {
    try {
      setSessionStartTime(new Date());
      setElapsedTime(0);
      await startTracking();
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not start location tracking",
        variant: "destructive"
      });
    }
  };
  
  const handleStopTracking = async () => {
    try {
      stopTracking();
      
      // Only reward if we actually moved
      if (totalDistance > 0.01 && isConnected && address && signer) {
        // Calculate reward
        const baseReward = calculateReward(totalDistance);
        const streakBonus = calculateStreakBonus(5); // Placeholder streak days
        // Get the current hour to determine if time bonus is active
        const currentHour = new Date().getHours();
        const isTimeBonusActive = (currentHour >= 5 && currentHour <= 7) || (currentHour >= 18 && currentHour <= 20);
        
        // Calculate intermediate reward values
        const timeReward = baseReward * (1 + (isTimeBonusActive ? 0.15 : 0));
        const finalReward = timeReward * (1 + streakBonus);
        
        // Calculate streak bonus amount
        const streakBonusAmount = finalReward - timeReward;
        
        // Set reward breakdown for modal
        setRewardBreakdown({
          baseReward,
          timeBonus: timeReward,
          streakBonus: streakBonusAmount,
          finalReward: finalReward,
          userStreak: 5, // Placeholder streak days
          isTimeBonusActive
        });
        
        // Show reward modal
        setIsRewardDetailsModalOpen(true);
        
        // Send reward to blockchain
        const result = await rewardUserForDistance(address, totalDistance, signer);
        
        if (result.success) {
          toast({
            title: "Reward Received!",
            description: `${finalReward.toFixed(2)} MOVE tokens earned`,
            variant: "default"
          });
        } else {
          toast({
            title: "Error",
            description: `Could not send reward: ${result.error}`,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not process movement rewards",
        variant: "destructive"
      });
    }
  };
  
  // Format session duration for display
  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hrs > 0 ? `${hrs}:` : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Format pace for display
  const formatPace = (pace: number): string => {
    if (pace === 0) return "--:--";
    
    // Convert pace from km/min to min/km
    const minPerKm = pace > 0 ? 1 / pace : 0;
    const mins = Math.floor(minPerKm);
    const secs = Math.floor((minPerKm - mins) * 60);
    
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleNFTMinted = (nft: MintedNFT) => {
    toast({
      title: "NFT Minted",
      description: `Your location NFT was minted successfully`,
      variant: "default"
    });
  };
  
  return (
    <div className="flex flex-col h-screen bg-slate-900">
      {/* Fullscreen map container positioned at the bottom layer */}
      <div className="absolute inset-0 w-full h-full z-0">
        {/* Always use ModernMap since it doesn't have API dependency issues */}
        <ModernMap 
          location={location}
          onZoomIn={() => {}}
          onZoomOut={() => {}}
          onToggleMapType={() => setMapType(mapType === 'modern' ? 'real-time' : 'modern')}
          onGoToCurrentLocation={() => {}}
        />
      </div>
      
      {/* Discovery layer over the map */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <DiscoveryLayer />
      </div>
      
      {/* Top navigation bar */}
      <div className="relative z-20 w-full">
        <div className="flex justify-center py-2">
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-full p-1">
            <div className="flex">
              <Button 
                variant={mapType === 'modern' ? "default" : "outline"} 
                size="sm" 
                className={`rounded-full ${mapType === 'modern' ? 'bg-emerald-500 hover:bg-emerald-600' : 'text-slate-400'}`}
                onClick={() => setMapType('modern')}
              >
                Modern
              </Button>
              <Button 
                variant={mapType === 'real-time' ? "default" : "outline"} 
                size="sm" 
                className={`rounded-full ${mapType === 'real-time' ? 'bg-blue-800 hover:bg-blue-700' : 'text-slate-400'}`}
                onClick={() => setMapType('real-time')}
              >
                Real-Time
              </Button>
            </div>
          </div>
        </div>
        
        {/* Movement intensity indicator */}
        <div className="px-4 py-2">
          <MovementIntensityIndicator />
        </div>
      </div>
      
      {/* Left floating stats panel */}
      <div className="absolute left-4 top-28 z-20 flex flex-col gap-2 max-w-[180px]">
        <div className="bg-black/70 backdrop-blur-sm p-3 rounded-lg">
          <h4 className="text-xs text-slate-400">Distance</h4>
          <p className="text-xl font-bold text-white">{moveStats.distance.toFixed(2)} <span className="text-sm text-slate-400">km</span></p>
        </div>
        
        <div className="bg-black/70 backdrop-blur-sm p-3 rounded-lg">
          <h4 className="text-xs text-slate-400">Duration</h4>
          <p className="text-xl font-bold text-white">{formatDuration(moveStats.duration)}</p>
        </div>
        
        <div className="bg-black/70 backdrop-blur-sm p-3 rounded-lg">
          <h4 className="text-xs text-slate-400">Pace</h4>
          <p className="text-xl font-bold text-white">{formatPace(moveStats.pace)}</p>
        </div>
        
        <div className="bg-black/70 backdrop-blur-sm p-3 rounded-lg text-sm">
          <Badge variant="outline" className="mb-1">
            {isTracking ? (
              <span className="flex items-center gap-1 text-emerald-500"><span className="animate-pulse rounded-full h-2 w-2 bg-emerald-500"></span> Tracking Active</span>
            ) : (
              <span className="flex items-center gap-1 text-slate-400"><Square size={10} /> Tracking Paused</span>
            )}
          </Badge>
          <p className="text-xs text-slate-400 mt-2">Current coordinates:</p>
          <p className="text-xs text-slate-300">{location ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : 'No location data'}</p>
        </div>
      </div>
      
      {/* Right floating action buttons */}
      <div className="absolute right-4 top-28 z-20 flex flex-col gap-3">
        <Button size="icon" variant="secondary" className="rounded-full bg-black/70 hover:bg-black/90 h-12 w-12" onClick={() => setIsNFTMinterOpen(true)}>
          <Camera size={20} />
        </Button>
        
        <Button size="icon" variant="secondary" className="rounded-full bg-black/70 hover:bg-black/90 h-12 w-12" onClick={() => setIsNFTCollectionOpen(true)}>
          <AwardIcon size={20} />
        </Button>
        
        <Button size="icon" variant="secondary" className="rounded-full bg-black/70 hover:bg-black/90 h-12 w-12" onClick={() => setIsVoiceModalOpen(true)}>
          <Headphones size={20} />
        </Button>
      </div>
      
      {/* Voice command floating button */}
      <div className="absolute left-4 bottom-44 z-20">
        <VoiceCommandButton position="relative" variant="secondary" />
      </div>
      
      {/* Stake button */}
      <div className="absolute right-4 bottom-32 z-20">
        <Button 
          size="sm" 
          variant="outline"
          className="rounded-full bg-black/70 hover:bg-black/90 text-white border-slate-700"
          onClick={() => setIsStakeModalOpen(true)}
        >
          <Coin size={16} className="mr-2" />
          Stake MOVE
        </Button>
      </div>
      
      {/* Tracking controls at bottom */}
      <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-20">
        {isTracking ? (
          <Button 
            size="lg" 
            variant="destructive"
            className="rounded-full h-16 w-16 shadow-lg"
            onClick={handleStopTracking}
          >
            <Square size={24} />
          </Button>
        ) : (
          <Button 
            size="lg" 
            variant="default"
            className="rounded-full h-16 w-16 bg-emerald-500 hover:bg-emerald-600 shadow-lg"
            onClick={handleStartTracking}
          >
            <Play size={24} />
          </Button>
        )}
      </div>
      
      {/* Bottom navigation bar */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-slate-900/90 backdrop-blur-sm z-20 border-t border-slate-800">
        <div className="flex items-center justify-around h-full">
          <Button variant="ghost" className="flex flex-col items-center h-full rounded-none px-6">
            <MapIcon size={20} className="text-red-500" />
            <span className="text-xs mt-1">Map</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center h-full rounded-none px-6">
            <Coin size={20} className="text-slate-400" />
            <span className="text-xs mt-1">Wallet</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center h-full rounded-none px-6">
            <Gift size={20} className="text-slate-400" />
            <span className="text-xs mt-1">Rewards</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center h-full rounded-none px-6">
            <AwardIcon size={20} className="text-slate-400" />
            <span className="text-xs mt-1">Settings</span>
          </Button>
        </div>
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
      
      <RewardDetailsModal
        isOpen={isRewardDetailsModalOpen}
        onClose={() => setIsRewardDetailsModalOpen(false)}
        rewardBreakdown={rewardBreakdown}
      />
      
      <LocationNFTMinter 
        isOpen={isNFTMinterOpen}
        onClose={() => setIsNFTMinterOpen(false)}
        onSuccess={handleNFTMinted}
      />
      
      <LocationNFTCollection
        isOpen={isNFTCollectionOpen}
        onClose={() => setIsNFTCollectionOpen(false)}
      />
    </div>
  );
}