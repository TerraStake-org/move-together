import { ethers } from 'ethers';
import { useWeb3 } from './Web3Context';
import { getTokenContract } from './TokenMinter';

// Staking Contract ABI (simplified)
const STAKING_ABI = [
  // Read-only functions
  "function stakes(address user) view returns (uint256 amount, uint256 startTime, uint256 lastRewardTime)",
  "function totalStaked() view returns (uint256)",
  "function rewardRatePerSecond() view returns (uint256)",
  "function pendingRewards(address user) view returns (uint256)",
  // Authenticated functions
  "function stake(uint256 amount) returns (bool)",
  "function unstake(uint256 amount) returns (bool)",
  "function claimRewards() returns (uint256)",
  // Events
  "event Staked(address indexed user, uint256 amount, uint256 timestamp)",
  "event Unstaked(address indexed user, uint256 amount, uint256 timestamp)",
  "event RewardsClaimed(address indexed user, uint256 amount, uint256 timestamp)"
];

// Mock staking contract address (replace with real address in production)
const STAKING_CONTRACT_ADDRESS = '0x9A8d4a9226eAD13D6A399389A5A8D0b8c73A7A52'; // Example address

/**
 * Get the staking contract instance
 */
export const getStakingContract = async (withSigner = false) => {
  try {
    const web3Context = useWeb3();
    const contractProvider = withSigner && web3Context.signer 
      ? web3Context.signer 
      : web3Context.provider;
      
    if (!contractProvider) {
      throw new Error('No provider available');
    }
    
    return new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI, contractProvider);
  } catch (error) {
    console.error('Failed to get staking contract:', error);
    return null;
  }
};

/**
 * Get staking information for a user
 */
export const getStakingInfo = async (address) => {
  try {
    if (!address) {
      throw new Error('Address is required');
    }
    
    const contract = await getStakingContract();
    if (!contract) {
      throw new Error('Failed to initialize staking contract');
    }
    
    // Get stake info
    const stakeInfo = await contract.stakes(address);
    const totalStaked = await contract.totalStaked();
    const rewardRate = await contract.rewardRatePerSecond();
    const pendingRewards = await contract.pendingRewards(address);
    
    // Format values with proper decimals (assuming 18 decimals)
    const stakedAmount = ethers.formatUnits(stakeInfo.amount, 18);
    const formattedTotalStaked = ethers.formatUnits(totalStaked, 18);
    const formattedRewardRate = ethers.formatUnits(rewardRate, 18);
    const formattedPendingRewards = ethers.formatUnits(pendingRewards, 18);
    
    return {
      success: true,
      data: {
        stakedAmount,
        totalStaked: formattedTotalStaked,
        rewardRate: formattedRewardRate,
        pendingRewards: formattedPendingRewards,
        lastStakedAt: Number(stakeInfo.startTime)
      }
    };
  } catch (error) {
    console.error('Error getting staking info:', error);
    return {
      success: false,
      error
    };
  }
};

/**
 * Stake tokens in the staking contract
 */
export const stakeTokens = async (amount) => {
  try {
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Invalid amount');
    }
    
    const web3Context = useWeb3();
    if (!web3Context.isConnected || !web3Context.signer) {
      throw new Error('Wallet not connected');
    }
    
    // First approve the staking contract to spend tokens
    const tokenContract = await getTokenContract(null, true);
    if (!tokenContract) {
      throw new Error('Failed to initialize token contract');
    }
    
    const amountInWei = ethers.parseUnits(amount.toString(), 18);
    
    // Approve staking contract to spend tokens
    const approveTx = await tokenContract.approve(STAKING_CONTRACT_ADDRESS, amountInWei);
    await approveTx.wait();
    
    // Now stake the tokens
    const stakingContract = await getStakingContract(true);
    if (!stakingContract) {
      throw new Error('Failed to initialize staking contract');
    }
    
    const stakeTx = await stakingContract.stake(amountInWei);
    const receipt = await stakeTx.wait();
    
    return {
      success: true,
      transactionHash: receipt.hash,
      receipt
    };
  } catch (error) {
    console.error('Failed to stake tokens:', error);
    return {
      success: false,
      error
    };
  }
};

/**
 * Unstake tokens from the staking contract
 */
export const unstakeTokens = async (amount) => {
  try {
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Invalid amount');
    }
    
    const web3Context = useWeb3();
    if (!web3Context.isConnected || !web3Context.signer) {
      throw new Error('Wallet not connected');
    }
    
    const stakingContract = await getStakingContract(true);
    if (!stakingContract) {
      throw new Error('Failed to initialize staking contract');
    }
    
    const amountInWei = ethers.parseUnits(amount.toString(), 18);
    
    const unstakeTx = await stakingContract.unstake(amountInWei);
    const receipt = await unstakeTx.wait();
    
    return {
      success: true,
      transactionHash: receipt.hash,
      receipt
    };
  } catch (error) {
    console.error('Failed to unstake tokens:', error);
    return {
      success: false,
      error
    };
  }
};

/**
 * Claim staking rewards
 */
export const claimRewards = async () => {
  try {
    const web3Context = useWeb3();
    if (!web3Context.isConnected || !web3Context.signer) {
      throw new Error('Wallet not connected');
    }
    
    const stakingContract = await getStakingContract(true);
    if (!stakingContract) {
      throw new Error('Failed to initialize staking contract');
    }
    
    const claimTx = await stakingContract.claimRewards();
    const receipt = await claimTx.wait();
    
    return {
      success: true,
      transactionHash: receipt.hash,
      receipt
    };
  } catch (error) {
    console.error('Failed to claim rewards:', error);
    return {
      success: false,
      error
    };
  }
};

/**
 * Calculate the Annual Percentage Rate (APR) for staking
 */
export const getApr = async () => {
  try {
    const contract = await getStakingContract();
    if (!contract) {
      throw new Error('Failed to initialize staking contract');
    }
    
    const rewardRate = await contract.rewardRatePerSecond();
    const totalStaked = await contract.totalStaked();
    
    // Avoid division by zero
    if (totalStaked.toString() === '0') {
      return {
        success: true,
        apr: 0
      };
    }
    
    // Calculate APR: (reward per second * seconds in a year / total staked) * 100
    const secondsInYear = 31536000; // 365 days
    const yearlyRewards = rewardRate * BigInt(secondsInYear);
    
    // Convert to proper decimals for calculation
    const rewardsInEther = Number(ethers.formatUnits(yearlyRewards, 18));
    const totalStakedInEther = Number(ethers.formatUnits(totalStaked, 18));
    
    const apr = (rewardsInEther / totalStakedInEther) * 100;
    
    return {
      success: true,
      apr: apr
    };
  } catch (error) {
    console.error('Failed to calculate APR:', error);
    return {
      success: false,
      error
    };
  }
};