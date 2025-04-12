import { ethers } from 'ethers';
import MoveTokenABI from '../abis/MoveToken.json';
import { getContractAddress } from './TokenMinter';

export const getStakingInfo = async (userAddress: string, provider: ethers.Provider) => {
  try {
    const contract = new ethers.Contract(getContractAddress(), MoveTokenABI, provider);
    
    // Get user's staking info
    const stakeInfo = await contract.stakes(userAddress);
    
    // Get global staking info
    const totalStaked = await contract.totalStaked();
    const rewardRate = await contract.rewardRatePerSecond();
    const pendingRewards = await contract.pendingRewards(userAddress);
    
    return {
      stakedAmount: ethers.formatUnits(stakeInfo.amount, 18),
      totalStaked: ethers.formatUnits(totalStaked, 18),
      rewardRate: ethers.formatUnits(rewardRate, 18),
      pendingRewards: ethers.formatUnits(pendingRewards, 18),
      lastStakedAt: Number(stakeInfo.lastStakedAt)
    };
  } catch (error) {
    console.error('Failed to get staking info:', error);
    throw error;
  }
};

export const stakeTokens = async (amount: number, signer: ethers.JsonRpcSigner) => {
  try {
    const tokenAmount = ethers.parseUnits(amount.toString(), 18);
    const contract = new ethers.Contract(getContractAddress(), MoveTokenABI, signer);
    
    const tx = await contract.stake(tokenAmount);
    const receipt = await tx.wait();
    
    return { 
      success: true, 
      hash: tx.hash,
      receipt 
    };
  } catch (error) {
    console.error('Staking error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
};

export const unstakeTokens = async (amount: number, signer: ethers.JsonRpcSigner) => {
  try {
    const tokenAmount = ethers.parseUnits(amount.toString(), 18);
    const contract = new ethers.Contract(getContractAddress(), MoveTokenABI, signer);
    
    const tx = await contract.unstake(tokenAmount);
    const receipt = await tx.wait();
    
    return { 
      success: true, 
      hash: tx.hash,
      receipt 
    };
  } catch (error) {
    console.error('Unstaking error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
};

export const claimRewards = async (signer: ethers.JsonRpcSigner) => {
  try {
    const contract = new ethers.Contract(getContractAddress(), MoveTokenABI, signer);
    
    // To claim rewards, we can either stake 0 tokens or unstake 0 tokens
    // Let's use the stake function with 0 amount
    const tx = await contract.stake(0);
    const receipt = await tx.wait();
    
    return { 
      success: true, 
      hash: tx.hash,
      receipt 
    };
  } catch (error) {
    console.error('Claim rewards error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
};

// Calculate APR based on reward rate
export const calculateAPR = async (provider: ethers.Provider) => {
  try {
    const contract = new ethers.Contract(getContractAddress(), MoveTokenABI, provider);
    
    const rewardRatePerSecond = await contract.rewardRatePerSecond();
    const totalStaked = await contract.totalStaked();
    
    if (totalStaked.isZero()) {
      return 0;
    }
    
    // Reward per second for each staked token
    const rewardPerStakedToken = rewardRatePerSecond / totalStaked;
    
    // Convert to annual rate
    const secondsInYear = 365 * 24 * 60 * 60;
    const annualRate = rewardPerStakedToken * secondsInYear;
    
    // Convert to percentage
    return Number(annualRate) * 100;
  } catch (error) {
    console.error('Failed to calculate APR:', error);
    return 0;
  }
};