import { ethers } from 'ethers';

class WalletConnector {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private address: string | null = null;

  constructor() {
    this.initializeProvider();
  }

  private async initializeProvider() {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        this.provider = new ethers.BrowserProvider(window.ethereum);
        
        // Check if already connected
        const accounts = await this.provider.listAccounts();
        if (accounts.length > 0) {
          this.signer = await this.provider.getSigner();
          this.address = accounts[0].address;
        }
      } catch (error) {
        console.error('Failed to initialize Web3 provider:', error);
      }
    }
  }

  public async connect() {
    if (!this.provider) {
      if (typeof window !== 'undefined' && window.ethereum) {
        this.provider = new ethers.BrowserProvider(window.ethereum);
      } else {
        throw new Error('No Web3 provider detected. Please install MetaMask.');
      }
    }
    
    try {
      // Request account access
      await this.provider.send('eth_requestAccounts', []);
      this.signer = await this.provider.getSigner();
      this.address = await this.signer.getAddress();
      return { address: this.address, signer: this.signer };
    } catch (error) {
      console.error('User rejected connection:', error);
      throw error;
    }
  }

  public disconnect() {
    this.signer = null;
    this.address = null;
  }

  public isConnected(): boolean {
    return !!this.signer && !!this.address;
  }

  public async getSigner() {
    if (!this.signer) {
      throw new Error('Not connected to wallet');
    }
    return { address: this.address as string, signer: this.signer };
  }

  public getProvider() {
    return this.provider;
  }

  public getAddress() {
    return this.address;
  }
}

export default new WalletConnector();
