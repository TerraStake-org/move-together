import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { useToast } from '@/hooks/use-toast';

interface Web3ContextType {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  address: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const Web3Context = createContext<Web3ContextType>({
  provider: null,
  signer: null,
  address: null,
  isConnected: false,
  connect: async () => {},
  disconnect: () => {},
});

export const useWeb3 = () => useContext(Web3Context);

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider = ({ children }: Web3ProviderProps) => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  
  const { toast } = useToast();

  // Initialize provider on component mount if window.ethereum exists
  useEffect(() => {
    const initializeProvider = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(provider);
          
          // Check if already connected
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            const signer = await provider.getSigner();
            setSigner(signer);
            setAddress(accounts[0].address);
            setIsConnected(true);
          }
        } catch (error) {
          console.error('Failed to initialize Web3 provider:', error);
        }
      }
    };
    
    initializeProvider();
  }, []);

  // Connect wallet
  const connect = async () => {
    if (!provider) {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(provider);
        } catch (error) {
          toast({
            title: "Web3 Error",
            description: "No Web3 provider detected. Please install MetaMask or a similar wallet.",
            variant: "destructive",
          });
          return;
        }
      } else {
        toast({
          title: "Web3 Error",
          description: "No Web3 provider detected. Please install MetaMask or a similar wallet.",
          variant: "destructive",
        });
        return;
      }
    }
    
    try {
      // Request account access
      if (provider) {
        await provider.send('eth_requestAccounts', []);
        const signer = await provider.getSigner();
        setSigner(signer);
        setAddress(await signer.getAddress());
        setIsConnected(true);
        
        toast({
          title: "Wallet Connected",
          description: "Your wallet has been successfully connected!",
        });
      }
    } catch (error) {
      console.error('User rejected connection:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to your wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    setSigner(null);
    setAddress(null);
    setIsConnected(false);
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
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
