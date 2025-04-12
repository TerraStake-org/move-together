import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useWeb3 } from '@/context/Web3Context';
import { getTokenBalance } from '@/web3/TokenMinter';
import { getStakingInfo, stakeTokens, unstakeTokens, claimRewards, calculateAPR } from '@/web3/MoveStaking';
import StakeModal from '@/components/modals/StakeModal';
import { formatTokenAmount } from '@/lib/utils';
import { Achievement } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

export default function RewardsPage() {
  const { toast } = useToast();
  const { address, signer, isConnected, connect, provider } = useWeb3();
  
  const [balance, setBalance] = useState<string>('0');
  const [stakingInfo, setStakingInfo] = useState<any>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);
  const [apr, setApr] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      if (isConnected && address && provider) {
        try {
          setIsLoading(true);
          
          // Get token balance
          const tokenBalance = await getTokenBalance(address, provider);
          setBalance(tokenBalance);
          
          // Get staking info
          const staking = await getStakingInfo(address, provider);
          setStakingInfo(staking);
          
          // Calculate APR with error handling
          try {
            const aprRate = await calculateAPR(provider);
            if (typeof aprRate === 'number' && !isNaN(aprRate)) {
              setApr(aprRate);
            } else {
              console.warn("Invalid APR value:", aprRate);
              setApr(0);
            }
          } catch (error) {
            console.error("Error calculating APR:", error);
            setApr(0);
          }
          
          // In a real app, we'd fetch from the user's ID, but for demo we'll use 1
          const userId = 1;
          const res = await apiRequest('GET', `/api/users/${userId}/achievements`, undefined);
          const achievementsData = await res.json();
          setAchievements(achievementsData);
        } catch (error) {
          toast({
            title: "Failed to load rewards data",
            description: "Could not retrieve your tokens and achievements.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isConnected, address, provider, toast]);

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

  const handleClaimRewards = async () => {
    if (!isConnected || !signer) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to claim rewards.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const result = await claimRewards(signer);
      
      if (result.success) {
        toast({
          title: "Rewards Claimed",
          description: "Your rewards have been claimed successfully.",
        });
        
        // Refresh staking info
        const newStakingInfo = await getStakingInfo(address!, provider!);
        setStakingInfo(newStakingInfo);
        
        // Refresh balance
        const newBalance = await getTokenBalance(address!, provider!);
        setBalance(newBalance);
      } else {
        toast({
          title: "Claim Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Claim Error",
        description: "There was an error claiming your rewards.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-dark text-light-gray pt-4 px-4 pb-20">
      <h1 className="text-2xl font-bold mb-4">Rewards</h1>
      
      {!isConnected ? (
        <Card className="bg-dark-gray border-0 mb-4">
          <CardContent className="pt-6 pb-6 text-center">
            <span className="material-icons text-4xl text-gray-400 mb-2">account_balance_wallet</span>
            <h2 className="text-lg font-semibold mb-2">Connect Wallet</h2>
            <p className="text-gray-400 mb-4">Connect your wallet to see your token balance and rewards</p>
            <Button onClick={handleConnectWallet} className="bg-primary hover:bg-primary/90">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="bg-dark-gray border-0 mb-4">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center">
                  <div className="w-6 h-6 rounded-full bg-primary mr-2 flex items-center justify-center">
                    <span className="material-icons text-sm">savings</span>
                  </div>
                  MOVE Token
                </CardTitle>
                <span className="text-xs bg-dark px-2 py-1 rounded-full">ERC-20</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs text-gray-400">Available Balance</p>
                    <h3 className="text-xl font-mono font-semibold">
                      {isLoading ? "Loading..." : `${formatTokenAmount(balance)} MOVE`}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Rate</p>
                    <h3 className="text-base font-mono">1 km = 1 <span className="text-secondary">MOVE</span></h3>
                  </div>
                </div>
              </div>
              
              <div className="bg-dark rounded-lg p-3 mb-3">
                <div className="flex justify-between mb-2">
                  <p className="text-sm">Staked Tokens</p>
                  <p className="text-sm font-mono font-semibold">
                    {isLoading || !stakingInfo 
                      ? "Loading..." 
                      : `${formatTokenAmount(stakingInfo.stakedAmount)} MOVE`}
                  </p>
                </div>
                <div className="h-1.5 bg-gray-700 rounded-full mb-3">
                  <div 
                    className="h-1.5 bg-secondary rounded-full" 
                    style={{ width: stakingInfo ? `${Math.min(100, (Number(stakingInfo.stakedAmount) / Number(balance)) * 100)}%` : '0%' }}
                  ></div>
                </div>
                <div className="flex justify-between">
                  <p className="text-xs text-gray-400">APR: <span className="text-secondary">{typeof apr === 'number' && !isNaN(apr) ? apr.toFixed(1) : '0.0'}%</span></p>
                  <p className="text-xs text-gray-400">
                    Pending: <span className="text-secondary font-mono">
                      {isLoading || !stakingInfo 
                        ? "Loading..." 
                        : `${formatTokenAmount(stakingInfo.pendingRewards)} MOVE`}
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  className="flex-1 bg-primary hover:bg-primary/90 text-white flex items-center justify-center"
                  onClick={() => setIsStakeModalOpen(true)}
                >
                  <span className="material-icons text-sm mr-1">add_circle</span>
                  Stake
                </Button>
                <Button 
                  className="flex-1 border border-primary hover:bg-primary hover:bg-opacity-10 text-white"
                  onClick={handleClaimRewards}
                  disabled={!stakingInfo || Number(stakingInfo.pendingRewards) <= 0}
                >
                  <span className="material-icons text-sm mr-1">redeem</span>
                  Claim
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
      
      <Tabs defaultValue="achievements">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
        </TabsList>
        
        <TabsContent value="achievements" className="space-y-3">
          <h2 className="text-lg font-semibold">Your Achievements</h2>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
            </div>
          ) : achievements.length === 0 ? (
            <Card className="bg-dark-gray border-0 p-6 text-center">
              <span className="material-icons text-4xl text-gray-500 mb-2">emoji_events</span>
              <p className="text-gray-400">No achievements yet</p>
              <p className="text-sm text-gray-500 mt-2">Start moving to earn achievements</p>
            </Card>
          ) : (
            achievements.map((achievement) => (
              <Card key={achievement.id} className="bg-dark-gray border-0">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                      <span className="material-icons text-primary">{achievement.icon}</span>
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium">{achievement.title}</h3>
                      <p className="text-xs text-gray-400">{achievement.description}</p>
                    </div>
                    <div className="bg-dark px-3 py-1 rounded-full flex items-center animate-pulse">
                      <span className="font-mono text-sm">+{achievement.reward}</span>
                      <span className="text-secondary text-xs ml-1">MOVE</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="milestones" className="space-y-3">
          <h2 className="text-lg font-semibold">Active Milestones</h2>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
            </div>
          ) : (
            <Card className="bg-dark-gray border-0">
              <CardContent className="p-4">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-accent bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                    <span className="material-icons text-accent text-sm">emoji_events</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Weekly Warrior</h4>
                    <p className="text-xs text-gray-400">Complete 7 consecutive days of activity</p>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-700 rounded-full">
                  <div className="h-1.5 bg-secondary rounded-full" style={{ width: '57%' }}></div>
                </div>
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-400">4 of 7 days</p>
                  <p className="text-xs">Reward: <span className="text-secondary font-mono">50 MOVE</span></p>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card className="bg-dark-gray border-0">
            <CardContent className="p-4">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 bg-secondary bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                  <span className="material-icons text-secondary text-sm">explore</span>
                </div>
                <div>
                  <h4 className="font-medium">Explorer</h4>
                  <p className="text-xs text-gray-400">Visit 10 different locations</p>
                </div>
              </div>
              <div className="h-1.5 bg-gray-700 rounded-full">
                <div className="h-1.5 bg-secondary rounded-full" style={{ width: '30%' }}></div>
              </div>
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-400">3 of 10 locations</p>
                <p className="text-xs">Reward: <span className="text-secondary font-mono">30 MOVE</span></p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <StakeModal 
        isOpen={isStakeModalOpen}
        onClose={() => setIsStakeModalOpen(false)}
        stakingInfo={stakingInfo}
        onStakingComplete={async () => {
          // Refresh staking info
          const newStakingInfo = await getStakingInfo(address!, provider!);
          setStakingInfo(newStakingInfo);
          
          // Refresh balance
          const newBalance = await getTokenBalance(address!, provider!);
          setBalance(newBalance);
        }}
      />
    </div>
  );
}
