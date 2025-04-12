import { ethers } from 'ethers';
import { useWeb3 } from './Web3Context';

// MOVE Token ABI (simplified)
const MOVE_TOKEN_ABI = [
  // Read-only functions
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  // Authenticated functions
  "function transfer(address to, uint amount) returns (bool)",
  // Events
  "event Transfer(address indexed from, address indexed to, uint amount)"
];

// Mock token contract address (replace with real address in production)
const MOVE_TOKEN_ADDRESS = '0x6B175474E89094C44Da98b954EedeAC495271d0F'; // This is DAI address for testing

/**
 * Get a token contract instance
 */
export const getTokenContract = async (provider, withSigner = false) => {
  try {
    const web3Context = useWeb3();
    const contractProvider = withSigner && web3Context.signer 
      ? web3Context.signer 
      : (provider || web3Context.provider);
      
    if (!contractProvider) {
      throw new Error('No provider available');
    }
    
    return new ethers.Contract(MOVE_TOKEN_ADDRESS, MOVE_TOKEN_ABI, contractProvider);
  } catch (error) {
    console.error('Failed to get token contract:', error);
    return null;
  }
};

/**
 * Get the token balance for an address
 */
export const getTokenBalance = async (address) => {
  try {
    if (!address) {
      throw new Error('Address is required');
    }
    
    const web3Context = useWeb3();
    const contract = await getTokenContract(web3Context.provider);
    
    if (!contract) {
      throw new Error('Failed to initialize token contract');
    }
    
    const balance = await contract.balanceOf(address);
    const decimals = await contract.decimals();
    
    // Format the balance with proper decimals
    const formattedBalance = ethers.formatUnits(balance, decimals);
    
    return {
      success: true,
      balance: formattedBalance,
      rawBalance: balance.toString()
    };
  } catch (error) {
    console.error('Failed to get token balance:', error);
    return {
      success: false,
      balance: '0',
      error
    };
  }
};

/**
 * Reward a user with tokens based on distance traveled
 * This is the core "move-to-earn" functionality
 */
export const rewardUserForDistance = async (distanceKm) => {
  try {
    if (isNaN(distanceKm) || distanceKm <= 0) {
      throw new Error('Invalid distance');
    }
    
    const web3Context = useWeb3();
    if (!web3Context.isConnected || !web3Context.address) {
      throw new Error('Wallet not connected');
    }
    
    // Basic reward calculation: 1 MOVE per km
    let moveTokens = distanceKm;
    
    // Apply streak bonus if available (from user profile)
    // This would be implemented in a real app
    const streakDays = 0; // Mock value
    const streakBonus = Math.min(streakDays * 0.01, 0.5); // Max 50% bonus
    
    // Apply time of day bonus (early morning / late evening bonus)
    const currentHour = new Date().getHours();
    const isEarlyOrLate = (currentHour < 8 || currentHour > 20);
    const timeBonus = isEarlyOrLate ? 0.15 : 0; // 15% bonus
    
    // Calculate final reward with bonuses
    const totalBonus = 1 + streakBonus + timeBonus;
    moveTokens *= totalBonus;
    
    // In a real implementation, this would call a smart contract function
    // that mints tokens to the user's wallet
    // For this demo, we'll just simulate success
    
    // Return the calculated reward
    return {
      success: true,
      amount: moveTokens.toFixed(2),
      breakdown: {
        base: distanceKm,
        streakBonus: streakBonus * 100,
        timeBonus: timeBonus * 100,
        total: moveTokens
      }
    };
  } catch (error) {
    console.error('Failed to reward user:', error);
    return {
      success: false,
      error
    };
  }
};

/**
 * Transfer tokens from the user's wallet to another address
 */
export const transferTokens = async (toAddress, amount) => {
  try {
    if (!toAddress || !ethers.isAddress(toAddress)) {
      throw new Error('Invalid recipient address');
    }
    
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Invalid amount');
    }
    
    const web3Context = useWeb3();
    if (!web3Context.isConnected || !web3Context.signer) {
      throw new Error('Wallet not connected');
    }
    
    const contract = await getTokenContract(null, true);
    
    if (!contract) {
      throw new Error('Failed to initialize token contract');
    }
    
    // Get decimals to format amount correctly
    const decimals = await contract.decimals();
    const amountInWei = ethers.parseUnits(amount.toString(), decimals);
    
    // Send transaction
    const tx = await contract.transfer(toAddress, amountInWei);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.hash,
      receipt
    };
  } catch (error) {
    console.error('Failed to transfer tokens:', error);
    return {
      success: false,
      error
    };
  }
};