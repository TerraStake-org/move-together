import { ethers } from 'ethers';
import MoveTokenABI from '../abis/MoveToken.json';

// Use environment variable with fallback
const MOVE_TOKEN_ADDRESS = import.meta.env.VITE_MOVE_TOKEN_ADDRESS || '0xYourDeployedMoveTokenAddress';

export const mintMoveTokens = async (userAddress: string, amount: number, signer: ethers.JsonRpcSigner) => {
  try {
    const tokenAmount = ethers.parseUnits(amount.toString(), 18);
    const contract = new ethers.Contract(MOVE_TOKEN_ADDRESS, MoveTokenABI.abi, signer);
    
    const tx = await contract.mint(userAddress, tokenAmount);
    const receipt = await tx.wait();
    
    return { 
      success: true, 
      hash: tx.hash,
      receipt 
    };
  } catch (error) {
    console.error('Token minting error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
};

export const getTokenBalance = async (address: string, provider: ethers.Provider) => {
  try {
    const contract = new ethers.Contract(MOVE_TOKEN_ADDRESS, MoveTokenABI.abi, provider);
    const balance = await contract.balanceOf(address);
    return ethers.formatUnits(balance, 18);
  } catch (error) {
    console.error('Failed to get token balance:', error);
    throw error;
  }
};

export const rewardUserForDistance = async (userAddress: string, distanceKm: number, signer: ethers.JsonRpcSigner) => {
  // Simple ratio: 1 MOVE token per 1 km
  const tokensToMint = distanceKm;
  return mintMoveTokens(userAddress, tokensToMint, signer);
};

export const getContractAddress = () => MOVE_TOKEN_ADDRESS;
