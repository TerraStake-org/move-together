import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { stakeTokens, unstakeTokens } from '@/web3/TokenMinter';
import { useWeb3 } from '@/context/Web3Context';
import { useToast } from '@/hooks/use-toast';

interface StakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance?: string;
  currentlyStaked?: string;
  onSuccess?: () => void;
  mode?: 'stake' | 'unstake';
  stakingInfo?: {
    stakedAmount: string;
    totalStaked: string;
    rewardRate: string;
    pendingRewards: string;
    lastStakedAt: number;
  } | null;
  onStakingComplete?: () => Promise<void>;
}

export default function StakeModal({ 
  isOpen, 
  onClose, 
  availableBalance, 
  currentlyStaked,
  onSuccess,
  mode = 'stake',
  stakingInfo,
  onStakingComplete
}: StakeModalProps) {
  const [amount, setAmount] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const { signer } = useWeb3();
  const { toast } = useToast();
  
  // Use stakingInfo if available, otherwise fall back to props
  const stakedAmount = stakingInfo?.stakedAmount || currentlyStaked || '0';
  const availableTokenBalance = availableBalance || '0';
  
  const maxAmount = mode === 'stake' 
    ? parseFloat(availableTokenBalance) 
    : parseFloat(stakedAmount);
  
  const handleSliderChange = (value: number[]) => {
    // Value is a percentage of maxAmount
    const percentage = value[0];
    const calculatedAmount = (maxAmount * percentage / 100).toFixed(2);
    setAmount(calculatedAmount);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Allow only numbers and decimals
    if (!/^[0-9]*\.?[0-9]*$/.test(value) && value !== '') {
      return;
    }
    
    // Cap at max amount
    const numValue = parseFloat(value || '0');
    if (numValue > maxAmount) {
      value = maxAmount.toString();
    }
    
    setAmount(value);
  };
  
  const handleMaxClick = () => {
    setAmount(maxAmount.toString());
  };
  
  const handleSubmit = async () => {
    if (!signer || !amount || parseFloat(amount) <= 0) return;
    
    setLoading(true);
    
    try {
      let result;
      
      if (mode === 'stake') {
        result = await stakeTokens(parseFloat(amount), signer);
      } else {
        result = await unstakeTokens(parseFloat(amount), signer);
      }
      
      if (result.success) {
        toast({
          title: `${mode === 'stake' ? 'Staked' : 'Unstaked'} Successfully`,
          description: `You have successfully ${mode === 'stake' ? 'staked' : 'unstaked'} ${amount} MOVE tokens.`,
        });
        
        // Call either onSuccess or onStakingComplete callback
        if (onSuccess) {
          onSuccess();
        } else if (onStakingComplete) {
          await onStakingComplete();
        }
        
        onClose();
      } else {
        toast({
          title: "Transaction Failed",
          description: `Failed to ${mode} tokens. Please try again.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Error ${mode === 'stake' ? 'staking' : 'unstaking'} tokens:`, error);
      toast({
        title: "Transaction Error",
        description: `An error occurred while ${mode === 'stake' ? 'staking' : 'unstaking'} tokens.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate what percentage of max the current amount is (for the slider)
  const sliderValue = maxAmount > 0 
    ? [(parseFloat(amount) / maxAmount) * 100] 
    : [0];
    
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-dark-gray text-white border-gray-700 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {mode === 'stake' ? 'Stake' : 'Unstake'} MOVE Tokens
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {mode === 'stake' 
              ? 'Stake your MOVE tokens to earn rewards over time.' 
              : 'Withdraw your staked MOVE tokens.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">
              {mode === 'stake' ? 'Available Balance' : 'Currently Staked'}:
            </span>
            <span className="font-medium">
              {mode === 'stake' ? availableTokenBalance : stakedAmount} MOVE
            </span>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input 
                type="text" 
                value={amount}
                onChange={handleInputChange}
                className="bg-dark border-gray-700 text-right"
              />
              <span className="text-gray-400 min-w-[60px]">MOVE</span>
              <Button 
                variant="outline"
                size="sm"
                className="border-gray-700 text-xs"
                onClick={handleMaxClick}
              >
                MAX
              </Button>
            </div>
            
            <div className="px-1">
              <Slider 
                value={sliderValue} 
                min={0}
                max={100}
                step={1}
                onValueChange={handleSliderChange}
                className="mt-6"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
          
          {mode === 'stake' && (
            <div className="bg-dark p-3 rounded-md mt-4 border border-gray-800">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-400">Estimated APR:</span>
                <span className="text-sm font-medium">12.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Rewards (daily):</span>
                <span className="text-sm font-medium">
                  {((parseFloat(amount) * 0.125) / 365).toFixed(4)} MOVE
                </span>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex gap-3 sm:gap-0">
          <Button 
            variant="outline"
            className="border-gray-700 flex-1"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            className={`flex-1 ${mode === 'stake' ? 'bg-green-700 hover:bg-green-600' : 'bg-blue-700 hover:bg-blue-600'}`}
            onClick={handleSubmit}
            disabled={loading || parseFloat(amount) <= 0 || parseFloat(amount) > maxAmount}
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <span>{mode === 'stake' ? 'Stake Tokens' : 'Unstake Tokens'}</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}