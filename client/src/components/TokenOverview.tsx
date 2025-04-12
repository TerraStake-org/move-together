import React from 'react';
import { Button } from '@/components/ui/button';
import { formatTokenAmount, calculateProgressPercentage } from '@/lib/utils';

interface TokenOverviewProps {
  balance?: string | number;
  staked?: string | number;
  rewards?: string | number;
  apr?: number;
  onStake: () => void;
  onClaim: () => void;
}

export default function TokenOverview({ 
  balance = '0.00',
  staked = '0.00',
  rewards = '0.00',
  apr = 12, // Default APR
  onStake,
  onClaim
}: TokenOverviewProps) {
  // Convert to numbers for calculations
  const numBalance = typeof balance === 'string' ? parseFloat(balance) : balance;
  const numStaked = typeof staked === 'string' ? parseFloat(staked) : staked;
  
  // Calculate progress percentage for staking bar
  const progressPercent = calculateProgressPercentage(numStaked, numBalance + numStaked);
  
  return (
    <div className="bg-dark-gray rounded-xl p-4 mb-5">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold flex items-center">
          <div className="w-6 h-6 rounded-full bg-primary mr-2 flex items-center justify-center">
            <span className="material-icons text-sm">savings</span>
          </div>
          MOVE Token
        </h2>
        <span className="text-xs bg-dark px-2 py-1 rounded-full">ERC-20</span>
      </div>
      
      <div className="flex justify-between mb-4">
        <div>
          <p className="text-xs text-gray-400">Available Balance</p>
          <h3 className="text-xl font-mono font-semibold">
            {formatTokenAmount(balance)} <span className="text-secondary text-sm">MOVE</span>
          </h3>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Rate</p>
          <h3 className="text-base font-mono">1 km = 1 <span className="text-secondary">MOVE</span></h3>
        </div>
      </div>
      
      <div className="bg-dark rounded-lg p-3 mb-3">
        <div className="flex justify-between mb-2">
          <p className="text-sm">Staked Tokens</p>
          <p className="text-sm font-mono font-semibold">
            {formatTokenAmount(staked)} <span className="text-secondary text-xs">MOVE</span>
          </p>
        </div>
        <div className="progress-track mb-3">
          <div 
            className="progress-fill" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <div className="flex justify-between">
          <p className="text-xs text-gray-400">APR: <span className="text-secondary">{apr}%</span></p>
          <p className="text-xs text-gray-400">
            Pending: <span className="text-secondary font-mono">{formatTokenAmount(rewards)} MOVE</span>
          </p>
        </div>
      </div>
      
      {/* Token Action Buttons */}
      <div className="flex space-x-2">
        <Button 
          className="flex-1 bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-lg flex items-center justify-center"
          onClick={onStake}
        >
          <span className="material-icons text-sm mr-1">add_circle</span>
          Stake
        </Button>
        <Button 
          className="flex-1 border border-primary hover:bg-primary/10 text-white py-2 px-4 rounded-lg flex items-center justify-center"
          onClick={onClaim}
          disabled={parseFloat(formatTokenAmount(rewards)) <= 0}
        >
          <span className="material-icons text-sm mr-1">redeem</span>
          Claim
        </Button>
      </div>
    </div>
  );
}
