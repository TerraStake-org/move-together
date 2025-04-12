import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import * as SecureStore from 'expo-secure-store';
import { Alert, Platform } from 'react-native';

// Create context
const Web3Context = createContext(null);

// Context values and methods
export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [network, setNetwork] = useState(null);
  
  // Initialize provider on component mount
  useEffect(() => {
    initializeProvider();
  }, []);
  
  // Load saved wallet on mount
  useEffect(() => {
    loadSavedWallet();
  }, [provider]);
  
  // Initialize provider
  const initializeProvider = async () => {
    try {
      // For React Native, ethers needs a JSON-RPC provider URL
      // Using Ethereum mainnet for production or a testnet for testing
      const ethereumProvider = new ethers.JsonRpcProvider(
        'https://eth-mainnet.g.alchemy.com/v2/demo' // Replace with your API key in production
      );
      
      setProvider(ethereumProvider);
      console.log('Provider initialized');
      
      // Get network information
      const network = await ethereumProvider.getNetwork();
      setNetwork({
        name: network.name,
        chainId: Number(network.chainId)
      });
      
    } catch (error) {
      console.error('Failed to initialize provider:', error);
    }
  };
  
  // Load wallet from secure storage
  const loadSavedWallet = async () => {
    if (!provider) return;
    
    try {
      // Check if we have a privateKey stored
      const privateKey = await SecureStore.getItemAsync('wallet_private_key');
      
      if (privateKey) {
        // Create a wallet from the stored private key
        const wallet = new ethers.Wallet(privateKey, provider);
        setSigner(wallet);
        setAddress(await wallet.getAddress());
        setIsConnected(true);
        console.log('Wallet loaded from storage');
      }
    } catch (error) {
      console.error('Failed to load wallet:', error);
    }
  };
  
  // Connect wallet (in a mobile app, this would typically create or import a wallet)
  const connect = async () => {
    if (!provider) {
      Alert.alert('Error', 'Web3 provider not initialized. Please try again.');
      return;
    }
    
    try {
      // For testing, we'll create a random wallet
      // In a real app, you'd implement a proper wallet creation/import flow
      const wallet = ethers.Wallet.createRandom().connect(provider);
      
      // Save private key to secure storage
      await SecureStore.setItemAsync('wallet_private_key', wallet.privateKey);
      
      // Update state
      setSigner(wallet);
      setAddress(await wallet.getAddress());
      setIsConnected(true);
      
      return wallet.address;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };
  
  // Disconnect wallet
  const disconnect = async () => {
    try {
      // Clear wallet from secure storage
      await SecureStore.deleteItemAsync('wallet_private_key');
      
      // Reset state
      setSigner(null);
      setAddress(null);
      setIsConnected(false);
      
      return true;
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw error;
    }
  };
  
  // Check if connected to correct network
  const isCorrectNetwork = () => {
    // For this app, we're accepting any network for testing
    // In a production app, you'd check for specific networks
    return true;
  };

  // Context value
  const value = {
    provider,
    signer,
    address,
    isConnected,
    network,
    connect,
    disconnect,
    isCorrectNetwork
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Context;