import { ethers } from 'ethers';
import MoveTokenABI from '../abis/MoveToken.json';

// This would be replaced with a real deployed contract address
const MOVE_TOKEN_ADDRESS = '0x1234567890123456789012345678901234567890'; 

/**
 * Returns the MOVE token contract address
 * @returns The contract address for the MOVE token
 */
export const getContractAddress = () => {
  return MOVE_TOKEN_ADDRESS;
};

/**
 * Mints MOVE tokens when the user walks or checks into a location
 * @param userAddress The address to mint tokens to
 * @param amount The amount of tokens to mint
 * @param signer The signer with minter role permission
 * @returns Transaction result
 */
export const mintMoveTokens = async (
  userAddress: string, 
  amount: number, 
  signer: ethers.JsonRpcSigner
) => {
  try {
    const contract = new ethers.Contract(MOVE_TOKEN_ADDRESS, MoveTokenABI, signer);
    // parseUnits converts to the smallest unit (wei equivalent)
    const amountInTokenUnits = ethers.parseUnits(amount.toString(), 18);
    
    const tx = await contract.mint(userAddress, amountInTokenUnits);
    await tx.wait();
    return { success: true, hash: tx.hash };
  } catch (error) {
    console.error('Mint error:', error);
    return { success: false, error };
  }
};

/**
 * Rewards a user with tokens based on distance traveled
 * This is the core "move-to-earn" functionality
 * @param userAddress The address to reward
 * @param distanceKm The distance traveled in kilometers
 * @param signer The signer with minter role permission
 */
export const rewardUserForDistance = async (
  userAddress: string, 
  distanceKm: number,
  signer: ethers.JsonRpcSigner
) => {
  if (!distanceKm || distanceKm <= 0) return { success: false, error: 'Invalid distance' };
  
  // Simple reward calculation: 1 MOVE token per km
  // In a real implementation, this could include bonuses for streaks, time of day, etc.
  const baseReward = distanceKm;
  
  try {
    return await mintMoveTokens(userAddress, baseReward, signer);
  } catch (error) {
    console.error('Failed to reward user:', error);
    return { success: false, error };
  }
};

/**
 * Get the token balance for an address
 * @param address The address to check balance for
 * @param provider The ethers provider
 * @returns The token balance in MOVE
 */
export const getTokenBalance = async (
  address: string, 
  provider: ethers.Provider
): Promise<{ success: boolean; balance?: string; error?: any }> => {
  try {
    const contract = new ethers.Contract(MOVE_TOKEN_ADDRESS, MoveTokenABI, provider);
    const balance = await contract.balanceOf(address);
    return { 
      success: true, 
      balance: ethers.formatUnits(balance, 18)
    };
  } catch (error) {
    console.error('Failed to get token balance:', error);
    return { success: false, error };
  }
};

/**
 * Get a user's staking information
 * @param address The address to check staking info for 
 * @param provider The ethers provider
 */
export const getStakingInfo = async (
  address: string,
  provider: ethers.Provider
): Promise<{ 
  success: boolean; 
  staked?: string; 
  lastStakedAt?: Date; 
  pendingRewards?: string; 
  error?: any 
}> => {
  try {
    const contract = new ethers.Contract(MOVE_TOKEN_ADDRESS, MoveTokenABI, provider);
    const stakeInfo = await contract.stakes(address);
    const pendingRewards = await contract.pendingRewards(address);
    
    return {
      success: true,
      staked: ethers.formatUnits(stakeInfo.amount, 18),
      lastStakedAt: new Date(Number(stakeInfo.lastStakedAt) * 1000),
      pendingRewards: ethers.formatUnits(pendingRewards, 18)
    };
  } catch (error) {
    console.error('Failed to get staking info:', error);
    return { success: false, error };
  }
};

/**
 * Stake MOVE tokens
 * @param amount The amount of tokens to stake
 * @param signer The signer
 */
export const stakeTokens = async (
  amount: number,
  signer: ethers.JsonRpcSigner
): Promise<{ success: boolean; hash?: string; error?: any }> => {
  try {
    const contract = new ethers.Contract(MOVE_TOKEN_ADDRESS, MoveTokenABI, signer);
    const amountInTokenUnits = ethers.parseUnits(amount.toString(), 18);
    const tx = await contract.stake(amountInTokenUnits);
    await tx.wait();
    return { success: true, hash: tx.hash };
  } catch (error) {
    console.error('Staking error:', error);
    return { success: false, error };
  }
};

/**
 * Unstake MOVE tokens
 * @param amount The amount of tokens to unstake
 * @param signer The signer
 */
export const unstakeTokens = async (
  amount: number,
  signer: ethers.JsonRpcSigner
): Promise<{ success: boolean; hash?: string; error?: any }> => {
  try {
    const contract = new ethers.Contract(MOVE_TOKEN_ADDRESS, MoveTokenABI, signer);
    const amountInTokenUnits = ethers.parseUnits(amount.toString(), 18);
    const tx = await contract.unstake(amountInTokenUnits);
    await tx.wait();
    return { success: true, hash: tx.hash };
  } catch (error) {
    console.error('Unstaking error:', error);
    return { success: false, error };
  }
};