import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MapPin, User, Globe, Clock, ExternalLink } from 'lucide-react';
import { useWeb3 } from '@/context/Web3Context';
import { getLocationNFTService, MintedNFT, LocationNFTMetadata } from '@/web3/LocationNFT';
import { useTheme } from '@/context/ThemeContext';
import { formatRelative } from 'date-fns';

// Props for the component
interface LocationNFTCollectionProps {
  isOpen: boolean;
  onClose: () => void;
}

// Component for displaying a user's NFT collection
export default function LocationNFTCollection({ 
  isOpen, 
  onClose 
}: LocationNFTCollectionProps) {
  // Get context values
  const { provider, signer, isConnected, address } = useWeb3();
  const { colors } = useTheme();
  
  // Component state
  const [nfts, setNfts] = useState<MintedNFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNFT, setSelectedNFT] = useState<MintedNFT | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  // Load NFTs when modal is opened
  useEffect(() => {
    if (isOpen && isConnected && provider && signer) {
      loadNFTs();
    }
  }, [isOpen, isConnected, provider, signer]);
  
  // Load NFTs from the service
  const loadNFTs = async () => {
    if (!isConnected || !provider || !signer) {
      setError("Wallet not connected");
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const nftService = getLocationNFTService(provider, signer);
      const userNfts = await nftService.getAllLocationNFTs();
      
      setNfts(userNfts);
    } catch (error) {
      console.error("Error loading NFTs:", error);
      setError("Failed to load your NFT collection");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Open NFT details dialog
  const openDetails = (nft: MintedNFT) => {
    setSelectedNFT(nft);
    setDetailsOpen(true);
  };
  
  // Render NFT details dialog
  const renderNFTDetails = () => {
    if (!selectedNFT) return null;
    
    const { metadata, tokenId } = selectedNFT;
    
    return (
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{metadata.name}</DialogTitle>
            <DialogDescription>
              NFT Token ID: {tokenId}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            {/* Map preview */}
            <div className="aspect-video rounded-md bg-muted overflow-hidden relative">
              <div 
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundColor: colors.background,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23${colors.primary.substring(1)}' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E")`
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="p-2 rounded-full bg-black/50">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
            
            {/* Metadata */}
            <div className="grid gap-2">
              {metadata.description && (
                <p className="text-sm text-muted-foreground">
                  {metadata.description}
                </p>
              )}
              
              <div className="flex flex-col gap-1 mt-2">
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{metadata.latitude.toFixed(6)}, {metadata.longitude.toFixed(6)}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Minted {formatRelative(new Date(metadata.mintedAt), new Date())}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <User className="h-4 w-4 mr-2" />
                  <span>Owner: {shortenAddress(address || '')}</span>
                </div>
              </div>
            </div>
            
            {/* View on Explorer button */}
            <div className="pt-2">
              <Button variant="outline" className="w-full" onClick={() => openBlockExplorer(tokenId)}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Block Explorer
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  // Mock function to open block explorer
  const openBlockExplorer = (tokenId: string) => {
    // This would normally link to Etherscan or similar
    window.open(`https://etherscan.io/token/${locationNftContractAddress}?a=${tokenId}`, '_blank');
  };
  
  // Shorten address for display
  const shortenAddress = (address: string): string => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Render loading state
  const renderLoading = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="w-full">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[125px] w-full rounded-md" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-9 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
  
  // Render empty state
  const renderEmpty = () => (
    <div className="py-12 text-center">
      <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">No NFTs Found</h3>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
        You haven't minted any location NFTs yet. Start moving and mint your favorite places!
      </p>
    </div>
  );
  
  // Render error state
  const renderError = () => (
    <div className="py-12 text-center">
      <h3 className="text-lg font-medium text-destructive mb-2">Error Loading NFTs</h3>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-4">
        {error || "Something went wrong. Please try again."}
      </p>
      <Button onClick={loadNFTs} variant="outline">
        Retry
      </Button>
    </div>
  );
  
  // Render NFT collection
  const renderCollection = () => (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-4">
        {nfts.map((nft) => (
          <NFTCard key={nft.tokenId} nft={nft} onClick={() => openDetails(nft)} />
        ))}
      </div>
    </ScrollArea>
  );
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Your Location NFTs</DialogTitle>
          <DialogDescription>
            View and manage your collection of minted location memories.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {isLoading ? renderLoading() :
           error ? renderError() :
           nfts.length === 0 ? renderEmpty() :
           renderCollection()}
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
      
      {renderNFTDetails()}
    </Dialog>
  );
}

// Mock contract address - for demo purposes
const locationNftContractAddress = "0xD5c6C01Cd7357CbBa7E6124A269DCfaF2e2b0525";

// NFT Card component
interface NFTCardProps {
  nft: MintedNFT;
  onClick: () => void;
}

function NFTCard({ nft, onClick }: NFTCardProps) {
  const { colors } = useTheme();
  const { metadata, tokenId } = nft;
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md cursor-pointer" onClick={onClick}>
      <div 
        className="h-40 bg-muted relative"
        style={{
          backgroundColor: colors.background,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23${colors.primary.substring(1)}' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E")`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="p-2 rounded-full bg-black/50">
            <MapPin className="h-8 w-8 text-white" />
          </div>
        </div>
        
        <div className="absolute bottom-2 right-2">
          <Badge variant="secondary" className="text-xs">
            #{tokenId}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{metadata.name}</CardTitle>
        <CardDescription className="flex items-center text-xs">
          <MapPin className="h-3 w-3 mr-1" />
          {metadata.latitude.toFixed(4)}, {metadata.longitude.toFixed(4)}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        {metadata.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {metadata.description}
          </p>
        )}
      </CardContent>
      
      <CardFooter className="pt-0">
        <div className="text-xs flex items-center text-muted-foreground">
          <Calendar className="h-3 w-3 mr-1" />
          <span>
            {new Date(metadata.mintedAt).toLocaleDateString()}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}