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
import { VoiceCommandButton } from '@/components/voice/VoiceCommandButton';
import { calculateReward, calculateStreakBonus, calculateTimeBonus } from '@/lib/utils';
import { rewardUserForDistance } from '@/web3/TokenMinter';
import { getStakingInfo } from '@/web3/MoveStaking';
import { MintedNFT } from '@/web3/LocationNFT';
import { useQuery } from '@tanstack/react-query';
import { Camera, Map as MapIcon, Award, Headphones } from 'lucide-react';

interface MoveStats {
  distance: number;
  duration: number;
  pace: number;
}

export default function MapView() {
  const { location, isTracking, totalDistance, startTracking, stopTracking, error: locationError } = useLocation();
  const { address, signer, isConnected, connect, provider } = useWeb3();
  const { toast } = useToast();

  const [mapType, setMapType] = useState<'modern' | 'real-time'>('modern');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);
  const [isRewardDetailsModalOpen, setIsRewardDetailsModalOpen] = useState(false);
  const [isNFTMinterOpen, setIsNFTMinterOpen] = useState(false);
  const [isNFTCollectionOpen, setIsNFTCollectionOpen] = useState(false);
  const [mintedNFTs, setMintedNFTs] = useState<MintedNFT[]>([]);
  const [moveStats, setMoveStats] = useState<MoveStats>({
    distance: 0,
    duration: 0,
    pace: 0
  });
  const [startTime, setStartTime] = useState<number | null>(null);
  const [rewardBreakdown, setRewardBreakdown] = useState({
    baseReward: 0,
    timeBonus: 0,
    streakBonus: 0,
    finalReward: 0,
    userStreak: 1,
    isTimeBonusActive: false
  });

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
        
        // Check if current time qualifies for time bonus
        const now = new Date();
        const hour = now.getHours();
        const isTimeBonusActive = (hour >= 5 && hour <= 7) || (hour >= 18 && hour <= 20);
        
        // Apply time-of-day bonus
        const timeBonus = calculateTimeBonus(baseReward, now);
        
        // Get user's streak (in a real app, this would come from the database)
        // For demo, we'll assume a streak of 1 day (no streak bonus yet)
        const userStreak = 1;
        const finalReward = calculateStreakBonus(timeBonus, userStreak);
        
        // Update reward breakdown for modal
        setRewardBreakdown({
          baseReward,
          timeBonus,
          streakBonus: finalReward,
          finalReward,
          userStreak,
          isTimeBonusActive
        });
        
        try {
          // Call blockchain to mint tokens
          const result = await rewardUserForDistance(address, finalReward, signer);
          
          if (result.success) {
            toast({
              title: "Tokens Earned!",
              description: (
                <div className="flex flex-col">
                  <span>You earned {finalReward.toFixed(2)} MOVE tokens!</span>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-xs pl-0 mt-1"
                    onClick={() => setIsRewardDetailsModalOpen(true)}
                  >
                    View reward details
                  </Button>
                </div>
              ),
            });
            
            // Show the reward details modal
            setIsRewardDetailsModalOpen(true);
            
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
  
  // Handle NFT minting
  const handleMintNFT = () => {
    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to mint NFTs.",
        variant: "destructive",
      });
      return;
    }
    
    if (!location) {
      toast({
        title: "Location Required",
        description: "Enable location tracking to mint your current location.",
        variant: "destructive",
      });
      return;
    }
    
    setIsNFTMinterOpen(true);
  };
  
  // Handle NFT collection view
  const handleViewCollection = () => {
    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to view your NFT collection.",
        variant: "destructive",
      });
      return;
    }
    
    setIsNFTCollectionOpen(true);
  };
  
  // Handle successful NFT mint
  const handleNFTMinted = (nft: MintedNFT) => {
    setMintedNFTs(prev => [...prev, nft]);
    toast({
      title: "Location NFT Minted!",
      description: `"${nft.metadata.name}" has been added to your collection.`,
    });
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
        {/* Tab buttons for map types */}
        <div className="absolute top-4 left-0 right-0 z-10 flex justify-center">
          <div className="bg-dark-gray/80 backdrop-blur-sm rounded-full p-1 flex">
            <Button
              variant="ghost"
              size="sm" 
              className={`rounded-full text-xs ${mapType === 'modern' ? 'bg-primary text-white' : 'bg-transparent'}`}
              onClick={() => setMapType('modern')}
            >
              Modern
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-full text-xs ${mapType === 'real-time' ? 'bg-primary text-white' : 'bg-transparent'}`}
              onClick={() => setMapType('real-time')}
            >
              Real-Time
            </Button>
          </div>
        </div>
        
        {/* Conditional rendering of map components with discovery layer */}
        <DiscoveryLayer
          mapComponent={
            mapType === 'modern' ? (
              <ModernMap 
                location={location}
                onZoomIn={() => {}}
                onZoomOut={() => {}}
                onToggleMapType={() => {}}
                onGoToCurrentLocation={() => {}}
              />
            ) : (
              <div className="h-[400px] w-full">
                <RealTimeLocationMap />
              </div>
            )
          }
        />
        
        {/* Voice Command Button */}
        <div className="absolute bottom-24 left-4">
          <VoiceCommandButton position="relative" variant="secondary" />
        </div>
        
        {/* Map Controls - in modern style */}
        <div className="absolute top-20 right-4 flex flex-col gap-4">
          {/* NFT Mint Button */}
          <Button
            variant="secondary"
            className="p-3 rounded-full shadow-xl bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-none"
            onClick={handleMintNFT}
            title="Mint Location NFT"
          >
            <Camera className="h-5 w-5 text-primary" />
          </Button>
          
          {/* Badge Collection Button */}
          <Button
            variant="secondary"
            className="p-3 rounded-full shadow-xl bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-none"
            onClick={handleViewCollection}
            title="View Badge Collection"
          >
            <Award className="h-5 w-5 text-amber-500" />
          </Button>
          
          {/* Audio Guide Button */}
          <Button
            variant="secondary"
            className="p-3 rounded-full shadow-xl bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-none"
            onClick={() => setIsNFTCollectionOpen(true)}
            title="Audio Guides"
          >
            <Headphones className="h-5 w-5 text-emerald-500" />
          </Button>
        </div>
        
        {/* Tracking Button */}
        <Button
          variant="default"
          className={`absolute bottom-28 right-4 ${isTracking ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} p-4 rounded-full shadow-xl`}
          onClick={handleTrackingToggle}
        >
          <span className="material-icons text-white">{isTracking ? 'stop' : 'play_arrow'}</span>
        </Button>
      </div>
      
      {/* STATS DASHBOARD */}
      <div className="flex-grow bg-dark px-4 py-6 -mt-2 rounded-t-3xl shadow-lg">
        
        {/* Movement Intensity Indicator - NEW */}
        <MovementIntensityIndicator />
        
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
      
      <RewardDetailsModal
        isOpen={isRewardDetailsModalOpen}
        onClose={() => setIsRewardDetailsModalOpen(false)}
        rewardBreakdown={rewardBreakdown}
      />
      
      {/* NFT Minter Modal */}
      <LocationNFTMinter 
        isOpen={isNFTMinterOpen}
        onClose={() => setIsNFTMinterOpen(false)}
        onSuccess={handleNFTMinted}
      />
      
      {/* NFT Collection Modal */}
      <LocationNFTCollection
        isOpen={isNFTCollectionOpen}
        onClose={() => setIsNFTCollectionOpen(false)}
      />
    </div>
  );
}
