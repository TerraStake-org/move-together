import { ethers } from 'ethers';

// ABI for Location NFT smart contract (ERC-721 compatible)
const locationNftAbi = [
  // ERC-721 standard functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function approve(address to, uint256 tokenId)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function setApprovalForAll(address operator, bool approved)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
  "function safeTransferFrom(address from, address to, uint256 tokenId, bytes data)",
  
  // Custom functions for our Location NFT
  "function mintLocationNFT(address to, string memory name, string memory description, int256 latitude, int256 longitude, string memory imageURI) returns (uint256)",
  "function getLocationData(uint256 tokenId) view returns (string, string, int256, int256, string, uint256)",
  "function getOwnedTokenIds(address owner) view returns (uint256[] memory)",
  "function totalSupply() view returns (uint256)"
];

// The mock contract address - would be replaced with actual deployed contract address
const locationNftContractAddress = "0xD5c6C01Cd7357CbBa7E6124A269DCfaF2e2b0525";

export interface LocationNFTMetadata {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  imageURI: string;
  mintedAt: number;
}

export interface MintedNFT {
  tokenId: string;
  metadata: LocationNFTMetadata;
  transactionHash: string;
}

/**
 * Class to handle Location NFT operations
 */
export class LocationNFTService {
  private contract: ethers.Contract | null = null;
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  
  /**
   * Initialize the service with a provider and signer
   */
  constructor(provider: ethers.BrowserProvider | null, signer: ethers.JsonRpcSigner | null) {
    this.provider = provider;
    this.signer = signer;
    
    if (provider && signer) {
      this.contract = new ethers.Contract(
        locationNftContractAddress,
        locationNftAbi,
        signer
      );
    }
  }
  
  /**
   * Update the provider and signer
   */
  updateProviderAndSigner(provider: ethers.BrowserProvider | null, signer: ethers.JsonRpcSigner | null) {
    this.provider = provider;
    this.signer = signer;
    
    if (provider && signer) {
      this.contract = new ethers.Contract(
        locationNftContractAddress,
        locationNftAbi,
        signer
      );
    } else {
      this.contract = null;
    }
  }
  
  /**
   * Check if the service is initialized
   */
  isInitialized(): boolean {
    return !!this.contract && !!this.signer;
  }
  
  /**
   * Mint a new Location NFT
   */
  async mintLocationNFT(
    name: string,
    description: string,
    latitude: number,
    longitude: number,
    imageURI: string
  ): Promise<MintedNFT | null> {
    try {
      if (!this.contract || !this.signer) {
        throw new Error("Service not initialized");
      }
      
      const address = await this.signer.getAddress();
      
      // Convert latitude and longitude to fixed-point representation
      // Multiply by 1e6 to preserve 6 decimal places
      const latitudeFixed = Math.round(latitude * 1000000);
      const longitudeFixed = Math.round(longitude * 1000000);
      
      // Mint the NFT
      const tx = await this.contract.mintLocationNFT(
        address,
        name,
        description,
        latitudeFixed,
        longitudeFixed,
        imageURI
      );
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      // In a real implementation, we would parse the event logs to get the tokenId
      // For now, we'll just get the most recent token
      const tokenIds = await this.getOwnedTokenIds();
      const tokenId = tokenIds[tokenIds.length - 1];
      
      // Get the metadata for the new token
      const metadata = await this.getLocationMetadata(tokenId);
      
      return {
        tokenId,
        metadata,
        transactionHash: receipt.hash
      };
    } catch (error) {
      console.error("Error minting location NFT:", error);
      return null;
    }
  }
  
  /**
   * Generate a static map image URI for a location
   */
  generateStaticMapImage(latitude: number, longitude: number, zoom: number = 15): string {
    // In a real app, this would use a map API like Google Maps or Mapbox
    // For now, we'll return a placeholder
    return `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=${zoom}&size=600x400&markers=color:red%7C${latitude},${longitude}&key=YOUR_API_KEY`;
  }
  
  /**
   * Create and mint a location NFT from the current position
   */
  async mintCurrentLocation(
    name: string,
    description: string,
    latitude: number,
    longitude: number
  ): Promise<MintedNFT | null> {
    try {
      // Generate image URI from coordinates
      const imageURI = this.generateStaticMapImage(latitude, longitude);
      
      // Mint the NFT
      return await this.mintLocationNFT(
        name,
        description,
        latitude,
        longitude,
        imageURI
      );
    } catch (error) {
      console.error("Error minting current location:", error);
      return null;
    }
  }
  
  /**
   * Get all Location NFTs owned by the current user
   */
  async getOwnedTokenIds(): Promise<string[]> {
    try {
      if (!this.contract || !this.signer) {
        throw new Error("Service not initialized");
      }
      
      const address = await this.signer.getAddress();
      const tokenIds = await this.contract.getOwnedTokenIds(address);
      
      return tokenIds.map((id: ethers.BigNumberish) => id.toString());
    } catch (error) {
      console.error("Error getting owned token IDs:", error);
      return [];
    }
  }
  
  /**
   * Get metadata for a Location NFT
   */
  async getLocationMetadata(tokenId: string): Promise<LocationNFTMetadata> {
    try {
      if (!this.contract) {
        throw new Error("Service not initialized");
      }
      
      const data = await this.contract.getLocationData(tokenId);
      
      // Convert fixed-point coordinates back to decimal
      const latitude = parseInt(data[2].toString()) / 1000000;
      const longitude = parseInt(data[3].toString()) / 1000000;
      
      return {
        name: data[0],
        description: data[1],
        latitude,
        longitude,
        imageURI: data[4],
        mintedAt: parseInt(data[5].toString()) * 1000 // Convert seconds to milliseconds
      };
    } catch (error) {
      console.error(`Error getting metadata for token ${tokenId}:`, error);
      // Return placeholder data if there's an error
      return {
        name: "Unknown Location",
        description: "Metadata could not be loaded",
        latitude: 0,
        longitude: 0,
        imageURI: "",
        mintedAt: Date.now()
      };
    }
  }
  
  /**
   * Get all Location NFTs with metadata
   */
  async getAllLocationNFTs(): Promise<MintedNFT[]> {
    try {
      const tokenIds = await this.getOwnedTokenIds();
      
      const nfts = await Promise.all(
        tokenIds.map(async (tokenId) => {
          const metadata = await this.getLocationMetadata(tokenId);
          return {
            tokenId,
            metadata,
            transactionHash: "" // We don't have this in our current implementation
          };
        })
      );
      
      return nfts;
    } catch (error) {
      console.error("Error getting all location NFTs:", error);
      return [];
    }
  }
}

// Create a singleton instance that can be updated when the provider/signer changes
let locationNFTService: LocationNFTService | null = null;

export const getLocationNFTService = (
  provider: ethers.BrowserProvider | null,
  signer: ethers.JsonRpcSigner | null
): LocationNFTService => {
  if (!locationNFTService) {
    locationNFTService = new LocationNFTService(provider, signer);
  } else if (provider && signer) {
    locationNFTService.updateProviderAndSigner(provider, signer);
  }
  
  return locationNFTService;
};