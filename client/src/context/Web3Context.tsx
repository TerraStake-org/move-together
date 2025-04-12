import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

interface Web3ContextType {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  address: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider = ({ children }: Web3ProviderProps) => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  
  // Disconnect wallet
  const disconnect = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setIsConnected(false);
    
    // Clear connection status from local storage
    localStorage.removeItem('walletConnected');
  }, []);

  // Attempt to auto-connect on startup
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum && window.ethereum.selectedAddress) {
        try {
          // Using direct connection logic instead of calling connect()
          // to avoid the dependency cycle
          const ethProvider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          
          if (accounts.length > 0) {
            const ethSigner = await ethProvider.getSigner();
            const userAddress = await ethSigner.getAddress();

            setProvider(ethProvider);
            setSigner(ethSigner);
            setAddress(userAddress);
            setIsConnected(true);
          }
        } catch (error) {
          console.error("Auto-connect failed:", error);
        }
      }
    };

    checkConnection();
  }, []);

  // Handle account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected their wallet
        disconnect();
      } else if (accounts[0] !== address) {
        // User switched accounts
        setAddress(accounts[0]);
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, [address, disconnect]);

  // Connect wallet
  const connect = async () => {
    if (!window.ethereum) {
      throw new Error("No Ethereum wallet found. Please install MetaMask or another wallet.");
    }

    try {
      // Request account access
      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const ethSigner = await ethProvider.getSigner();
      const userAddress = await ethSigner.getAddress();

      setProvider(ethProvider);
      setSigner(ethSigner);
      setAddress(userAddress);
      setIsConnected(true);

      // Save connection status to local storage
      localStorage.setItem('walletConnected', 'true');
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    }
  };

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        address,
        isConnected,
        connect,
        disconnect,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}