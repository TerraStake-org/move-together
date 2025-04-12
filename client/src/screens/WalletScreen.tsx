import React, { useEffect, useState } from 'react';
import { useWeb3 } from '@/context/Web3Context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getTokenBalance, getStakingInfo } from '@/web3/TokenMinter';
import StakeModal from '@/components/modals/StakeModal';

export default function WalletScreen() {
  const { address, connect, isConnected, provider } = useWeb3();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [staked, setStaked] = useState<string | null>(null);
  const [pendingRewards, setPendingRewards] = useState<string | null>(null);
  const [stakeModalOpen, setStakeModalOpen] = useState(false);
  const [unstakeModalOpen, setUnstakeModalOpen] = useState(false);

  // Function to fetch wallet data
  const fetchWalletData = async () => {
    if (isConnected && address && provider) {
      setLoading(true);
      try {
        // Get token balance
        const balanceResult = await getTokenBalance(address, provider);
        if (balanceResult.success && balanceResult.balance) {
          setBalance(balanceResult.balance);
        } else {
          console.error('Error fetching balance:', balanceResult.error);
        }

        // Get staking info
        const stakingResult = await getStakingInfo(address, provider);
        if (stakingResult.success && stakingResult.staked && stakingResult.pendingRewards) {
          setStaked(stakingResult.staked);
          setPendingRewards(stakingResult.pendingRewards);
        } else {
          console.error('Error fetching staking info:', stakingResult.error);
        }
      } catch (error) {
        console.error('Failed to fetch wallet data:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Fetch token data when connected
  useEffect(() => {
    fetchWalletData();
  }, [isConnected, address, provider]);

  const handleConnect = async () => {
    try {
      setLoading(true);
      await connect();
      toast({
        title: "Connected",
        description: "Wallet connected successfully!",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to your wallet. Make sure you have MetaMask installed.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate the total value (balance + staked)
  const totalValue = 
    parseFloat(balance || '0') + 
    parseFloat(staked || '0');

  // Function to format a number with commas
  const formatNumber = (num: number | string) => {
    return Number(num).toLocaleString(undefined, { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-dark text-white pb-20">
      {/* Header */}
      <div className="bg-dark-gray p-4 flex justify-between items-center border-b border-gray-800">
        <h1 className="text-xl font-semibold">Wallet</h1>
        {isConnected ? (
          <div className="bg-green-900 px-3 py-1 rounded-full text-xs flex items-center">
            <span className="material-icons text-sm mr-1">account_balance_wallet</span>
            <span>Connected</span>
          </div>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-full flex items-center text-xs border-green-600 text-green-500" 
            onClick={handleConnect}
            disabled={loading}
          >
            <span className="material-icons text-sm mr-1">account_balance_wallet</span>
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        )}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-6">
        {isConnected ? (
          <div className="space-y-8">
            {/* Wallet Info */}
            <div className="bg-dark-gray rounded-xl p-6 border border-gray-800">
              <h2 className="text-lg font-medium mb-4">Your Wallet</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Address:</span>
                  <span className="font-mono text-sm">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">MOVE Balance:</span>
                  <span>{loading ? '...' : balance ? formatNumber(balance) : '0.00'} MOVE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Staked:</span>
                  <span>{loading ? '...' : staked ? formatNumber(staked) : '0.00'} MOVE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Pending Rewards:</span>
                  <span className="text-green-400">{loading ? '...' : pendingRewards ? formatNumber(pendingRewards) : '0.00'} MOVE</span>
                </div>
                <div className="border-t border-gray-700 mt-2 pt-2">
                  <div className="flex justify-between font-medium">
                    <span>Total Value:</span>
                    <span>{loading ? '...' : formatNumber(totalValue)} MOVE</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="bg-dark-gray border-gray-700 hover:bg-dark-gray/80 h-16 flex flex-col items-center justify-center"
              >
                <span className="material-icons mb-1">arrow_circle_up</span>
                <span>Send</span>
              </Button>
              <Button 
                variant="outline" 
                className="bg-dark-gray border-gray-700 hover:bg-dark-gray/80 h-16 flex flex-col items-center justify-center"
              >
                <span className="material-icons mb-1">arrow_circle_down</span>
                <span>Receive</span>
              </Button>
              <Button 
                variant="outline" 
                className="bg-dark-gray border-gray-700 hover:bg-dark-gray/80 h-16 flex flex-col items-center justify-center"
                onClick={() => setStakeModalOpen(true)}
                disabled={loading || !balance || parseFloat(balance) <= 0}
              >
                <span className="material-icons mb-1">account_balance</span>
                <span>Stake</span>
              </Button>
              <Button 
                variant="outline" 
                className="bg-dark-gray border-gray-700 hover:bg-dark-gray/80 h-16 flex flex-col items-center justify-center"
                onClick={() => setUnstakeModalOpen(true)}
                disabled={loading || !staked || parseFloat(staked) <= 0}
              >
                <span className="material-icons mb-1">logout</span>
                <span>Unstake</span>
              </Button>
            </div>
            
            {/* Transaction Activity */}
            <div className="bg-dark-gray rounded-xl p-6 border border-gray-800">
              <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
              {loading ? (
                <p className="text-center py-8 text-gray-400">Loading activity...</p>
              ) : (
                <>
                  {/* Sample transactions - in a real app these would come from the blockchain or an indexer API */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-gray-800">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-900/30 text-green-400">
                          <span className="material-icons">add_circle</span>
                        </div>
                        <div className="ml-3">
                          <div className="font-medium">Earned from Walking</div>
                          <div className="text-xs text-gray-400">Today, 2:34 PM</div>
                        </div>
                      </div>
                      <div className="text-green-400">+5.00 MOVE</div>
                    </div>
                    
                    <div className="flex items-center justify-between py-2 border-b border-gray-800">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-900/30 text-blue-400">
                          <span className="material-icons">account_balance</span>
                        </div>
                        <div className="ml-3">
                          <div className="font-medium">Staked MOVE Tokens</div>
                          <div className="text-xs text-gray-400">Yesterday</div>
                        </div>
                      </div>
                      <div className="text-blue-400">-50.00 MOVE</div>
                    </div>
                    
                    <div className="flex items-center justify-between py-2 border-b border-gray-800">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-900/30 text-purple-400">
                          <span className="material-icons">redeem</span>
                        </div>
                        <div className="ml-3">
                          <div className="font-medium">Claimed Staking Rewards</div>
                          <div className="text-xs text-gray-400">3 days ago</div>
                        </div>
                      </div>
                      <div className="text-purple-400">+2.50 MOVE</div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="link" 
                    className="w-full mt-4 text-gray-400"
                  >
                    View All Transactions
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-dark-gray rounded-xl p-8 text-center max-w-md border border-gray-800">
              <span className="material-icons text-6xl text-gray-500 mb-4">account_balance_wallet</span>
              <h2 className="text-xl font-medium mb-2">Connect Your Wallet</h2>
              <p className="text-gray-400 mb-6">Connect your wallet to view your MOVE token balance and transaction history</p>
              <Button onClick={handleConnect} className="w-full bg-green-700 hover:bg-green-600" disabled={loading}>
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Stake Modal */}
      <StakeModal
        isOpen={stakeModalOpen}
        onClose={() => setStakeModalOpen(false)}
        availableBalance={balance || '0'}
        currentlyStaked={staked || '0'}
        onSuccess={fetchWalletData}
        mode="stake"
      />
      
      {/* Unstake Modal */}
      <StakeModal
        isOpen={unstakeModalOpen}
        onClose={() => setUnstakeModalOpen(false)}
        availableBalance={balance || '0'}
        currentlyStaked={staked || '0'}
        onSuccess={fetchWalletData}
        mode="unstake"
      />
    </div>
  );
}