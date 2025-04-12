import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { useWeb3 } from '@/context/Web3Context';
import { getTokenBalance } from '@/web3/TokenMinter';
import { stakeTokens, unstakeTokens } from '@/web3/MoveStaking';
import { formatTokenAmount } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface StakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  stakingInfo: any;
  onStakingComplete: () => void;
}

export default function StakeModal({ 
  isOpen, 
  onClose, 
  stakingInfo,
  onStakingComplete 
}: StakeModalProps) {
  const { address, signer, provider, isConnected, connect } = useWeb3();
  const { toast } = useToast();
  
  const [balance, setBalance] = useState<string>('0');
  const [stakeAmount, setStakeAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [maxStakeAmount, setMaxStakeAmount] = useState<number>(0);

  // Fetch token balance when modal opens
  useEffect(() => {
    const fetchBalance = async () => {
      if (isOpen && isConnected && address && provider) {
        try {
          const tokenBalance = await getTokenBalance(address, provider);
          setBalance(tokenBalance);
          setMaxStakeAmount(parseFloat(tokenBalance));
          
          // Set initial stake amount to 50% of balance or 0 if no balance
          const initialAmount = parseFloat(tokenBalance) > 0 
            ? parseFloat(tokenBalance) / 2 
            : 0;
          setStakeAmount(initialAmount);
        } catch (error) {
          toast({
            title: "Failed to load balance",
            description: "Could not retrieve your token balance.",
            variant: "destructive",
          });
        }
      }
    };

    fetchBalance();
  }, [isOpen, isConnected, address, provider, toast]);

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

  // Handle stake amount change
  const handleStakeAmountChange = (value: number[]) => {
    setStakeAmount(value[0]);
  };

  // Handle staking tokens
  const handleStakeTokens = async () => {
    if (!isConnected || !signer) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to stake tokens.",
        variant: "destructive",
      });
      return;
    }
    
    if (stakeAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter an amount greater than 0.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const result = await stakeTokens(stakeAmount, signer);
      
      if (result.success) {
        toast({
          title: "Tokens Staked",
          description: `Successfully staked ${stakeAmount.toFixed(2)} MOVE tokens.`,
        });
        onClose();
        onStakingComplete();
      } else {
        toast({
          title: "Staking Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Staking Error",
        description: "There was an error staking your tokens.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle unstaking tokens
  const handleUnstakeTokens = async () => {
    if (!isConnected || !signer || !stakingInfo) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to unstake tokens.",
        variant: "destructive",
      });
      return;
    }
    
    if (stakeAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter an amount greater than 0.",
        variant: "destructive",
      });
      return;
    }
    
    const stakedAmount = parseFloat(stakingInfo.stakedAmount);
    if (stakeAmount > stakedAmount) {
      toast({
        title: "Invalid Amount",
        description: `You only have ${stakedAmount.toFixed(2)} MOVE tokens staked.`,
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const result = await unstakeTokens(stakeAmount, signer);
      
      if (result.success) {
        toast({
          title: "Tokens Unstaked",
          description: `Successfully unstaked ${stakeAmount.toFixed(2)} MOVE tokens.`,
        });
        onClose();
        onStakingComplete();
      } else {
        toast({
          title: "Unstaking Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Unstaking Error",
        description: "There was an error unstaking your tokens.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-dark-gray border-gray-700 text-light-gray sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Stake MOVE Tokens</DialogTitle>
          <DialogDescription className="text-gray-400">
            Stake your tokens to earn rewards based on 12% APR.
          </DialogDescription>
        </DialogHeader>
        
        {!isConnected ? (
          <div className="text-center py-6">
            <p className="text-sm text-gray-400 mb-4">Connect your wallet to stake or unstake tokens</p>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={handleConnectWallet}
            >
              Connect Wallet
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-dark rounded-lg p-3 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm">Available Balance</span>
                <span className="font-mono">{formatTokenAmount(balance)} MOVE</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Currently Staked</span>
                <span className="font-mono">
                  {stakingInfo ? formatTokenAmount(stakingInfo.stakedAmount) : '0.00'} MOVE
                </span>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="text-sm mb-2 block">Amount to Stake</label>
              <div className="space-y-4">
                <Slider
                  value={[stakeAmount]}
                  min={0}
                  max={maxStakeAmount}
                  step={0.01}
                  onValueChange={handleStakeAmountChange}
                  disabled={isLoading}
                  className="stake-slider"
                />
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStakeAmount(maxStakeAmount / 4)}
                    disabled={isLoading}
                    className="border-gray-700"
                  >
                    25%
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStakeAmount(maxStakeAmount / 2)}
                    disabled={isLoading}
                    className="border-gray-700"
                  >
                    50%
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStakeAmount(maxStakeAmount * 0.75)}
                    disabled={isLoading}
                    className="border-gray-700"
                  >
                    75%
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStakeAmount(maxStakeAmount)}
                    disabled={isLoading}
                    className="border-gray-700"
                  >
                    Max
                  </Button>
                  <div className="w-24 h-10 bg-dark rounded-lg flex items-center justify-center">
                    <span className="font-mono">{stakeAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-3">
              <Button 
                className="bg-secondary text-dark font-medium py-3 rounded-lg"
                onClick={handleStakeTokens}
                disabled={isLoading || stakeAmount <= 0 || stakeAmount > maxStakeAmount}
              >
                {isLoading ? 
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div> : 
                  'Stake Tokens'
                }
              </Button>
              <Button 
                className="border border-primary text-primary py-3 rounded-lg"
                onClick={handleUnstakeTokens}
                disabled={isLoading || stakeAmount <= 0 || !stakingInfo || stakeAmount > parseFloat(stakingInfo.stakedAmount)}
              >
                {isLoading ? 
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    Processing...
                  </div> : 
                  'Unstake Tokens'
                }
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
