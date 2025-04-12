import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MapPin, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWeb3 } from '@/context/Web3Context';
import { useLocation } from '@/context/LocationContext';
import { getLocationNFTService, MintedNFT } from '@/web3/LocationNFT';
import { useTheme } from '@/context/ThemeContext';

// Props for the component
interface LocationNFTMinterProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (nft: MintedNFT) => void;
}

// Component for minting location NFTs
export default function LocationNFTMinter({ 
  isOpen, 
  onClose, 
  onSuccess 
}: LocationNFTMinterProps) {
  // Get context values
  const { provider, signer, isConnected } = useWeb3();
  const { location } = useLocation();
  const { colors } = useTheme();
  const { toast } = useToast();
  
  // Component state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isMinting, setIsMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [mintedNFT, setMintedNFT] = useState<MintedNFT | null>(null);
  
  // Reset form state when modal is opened/closed
  React.useEffect(() => {
    if (!isOpen) {
      // Reset form when modal is closed
      setTimeout(() => {
        setName('');
        setDescription('');
        setMintSuccess(false);
        setMintedNFT(null);
      }, 300);
    }
  }, [isOpen]);
  
  // Handler for minting NFT
  const handleMint = async () => {
    if (!location || !isConnected || !signer || !provider) {
      toast({
        title: "Cannot mint NFT",
        description: !location 
          ? "No location data available. Make sure tracking is enabled."
          : "Wallet not connected. Please connect your wallet first.",
        variant: "destructive"
      });
      return;
    }
    
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your location NFT.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsMinting(true);
      
      // Get NFT service
      const nftService = getLocationNFTService(provider, signer);
      
      // Mint NFT with current location
      const nft = await nftService.mintCurrentLocation(
        name,
        description,
        location.latitude,
        location.longitude
      );
      
      if (nft) {
        setMintedNFT(nft);
        setMintSuccess(true);
        
        toast({
          title: "NFT Minted Successfully!",
          description: `Your location "${name}" has been minted as an NFT.`,
          variant: "default"
        });
        
        if (onSuccess) {
          onSuccess(nft);
        }
      } else {
        throw new Error("Failed to mint NFT");
      }
    } catch (error) {
      console.error("Error minting location NFT:", error);
      toast({
        title: "Minting Failed",
        description: "There was an error minting your NFT. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsMinting(false);
    }
  };
  
  // Get address details from location
  const getAddressString = (lat: number, lng: number) => {
    // In a real app, we would use a geocoding service
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };
  
  // Generate static map preview URL
  const getMapPreviewUrl = (lat: number, lng: number) => {
    // In a real app, this would use an API key
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=400x200&markers=color:red%7C${lat},${lng}&key=YOUR_API_KEY`;
  };
  
  // Render success screen
  const renderSuccess = () => (
    <div className="flex flex-col items-center justify-center py-4 space-y-4">
      <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
        <Check className="h-8 w-8 text-green-600 dark:text-green-300" />
      </div>
      <h3 className="text-xl font-semibold text-center">NFT Minted Successfully!</h3>
      <p className="text-center text-muted-foreground">
        Your location NFT has been minted and added to your collection.
      </p>
      {mintedNFT && (
        <div className="w-full p-4 border rounded-lg bg-card mt-4">
          <h4 className="font-medium">{mintedNFT.metadata.name}</h4>
          <p className="text-sm text-muted-foreground mb-2">{mintedNFT.metadata.description}</p>
          <div className="flex items-center text-sm text-muted-foreground mb-4">
            <MapPin className="h-4 w-4 mr-1" />
            <span>
              {getAddressString(mintedNFT.metadata.latitude, mintedNFT.metadata.longitude)}
            </span>
          </div>
          <div className="aspect-video rounded-md bg-muted overflow-hidden relative">
            {/* Placeholder for map image */}
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
          <div className="mt-4 text-sm">
            <span className="font-medium">Token ID:</span> {mintedNFT.tokenId}
          </div>
        </div>
      )}
      <Button onClick={onClose} className="mt-4">
        Close
      </Button>
    </div>
  );
  
  // Render mint form
  const renderMintForm = () => (
    <>
      <DialogHeader>
        <DialogTitle>Mint Location NFT</DialogTitle>
        <DialogDescription>
          Immortalize your current location as an NFT on the blockchain.
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid gap-4 py-4">
        {location ? (
          <>
            <div className="aspect-video rounded-md bg-muted overflow-hidden relative">
              {/* Placeholder for map preview */}
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
            
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{getAddressString(location.latitude, location.longitude)}</span>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Location Name</Label>
              <Input
                id="name"
                placeholder="My Favorite Hiking Spot"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isMinting}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe what makes this location special..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isMinting}
                rows={3}
              />
            </div>
          </>
        ) : (
          <div className="py-8 text-center">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              No location data available. Make sure tracking is enabled.
            </p>
          </div>
        )}
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isMinting}>
          Cancel
        </Button>
        <Button 
          onClick={handleMint} 
          disabled={isMinting || !location || !isConnected || !name.trim()}
        >
          {isMinting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Minting...
            </>
          ) : (
            "Mint NFT"
          )}
        </Button>
      </DialogFooter>
    </>
  );
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        {mintSuccess ? renderSuccess() : renderMintForm()}
      </DialogContent>
    </Dialog>
  );
}