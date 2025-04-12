import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useWeb3 } from '@/context/Web3Context';
import { usePlaceDiscovery } from '@/context/PlaceDiscoveryContext';
import useTts from '@/hooks/useTts';
import { Link, useLocation } from 'wouter';
import { formatAddress } from '@/lib/utils';
import { User } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import BadgeCollection from '@/components/discovery/BadgeCollection';

export default function ProfilePage() {
  const { toast } = useToast();
  const { address, isConnected, connect, disconnect } = useWeb3();
  const { 
    voices, 
    selectedVoice, 
    setVoicePreference, 
    speak, 
    isLoading: voicesLoading 
  } = useTts();
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en-US");
  const [useOfflineMaps, setUseOfflineMaps] = useState(true);
  const [distanceUnit, setDistanceUnit] = useState<'km' | 'mi'>('km');
  const [darkMode, setDarkMode] = useState(true);
  
  // Languages available
  const languages = [
    { code: "en-US", name: "English (US)" },
    { code: "es-ES", name: "Español" },
    { code: "fr-FR", name: "Français" },
    { code: "ja-JP", name: "日本語" },
    { code: "de-DE", name: "Deutsch" },
    { code: "zh-CN", name: "中文" }
  ];

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // In a real app, we'd fetch the current user's profile
        // For demo purposes, we'll use user ID 1
        const userId = 1;
        const res = await apiRequest('GET', `/api/users/${userId}`, undefined);
        const userData = await res.json();
        setUser(userData);
        
        // Set language preference from user data
        if (userData.language) {
          setSelectedLanguage(userData.language);
        }
      } catch (error) {
        toast({
          title: "Failed to load profile",
          description: "Could not retrieve your profile data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [toast]);
  
  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      await connect();
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to your wallet.",
        variant: "destructive",
      });
    }
  };
  
  // Handle wallet disconnection
  const handleDisconnectWallet = () => {
    disconnect();
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  };
  
  // Handle language change
  const handleLanguageChange = async (value: string) => {
    setSelectedLanguage(value);
    
    // Update user preference in DB
    try {
      if (user) {
        await apiRequest('PATCH', `/api/users/${user.id}`, { language: value });
      }
      
      // Demo that TTS works with the selected language
      const phrase = value === 'en-US' ? 'Language changed to English' :
                     value === 'es-ES' ? 'Idioma cambiado a Español' :
                     value === 'fr-FR' ? 'Langue changée en Français' :
                     value === 'ja-JP' ? '言語が日本語に変更されました' :
                     value === 'de-DE' ? 'Sprache auf Deutsch geändert' :
                     value === 'zh-CN' ? '语言已更改为中文' :
                     'Language changed';
      
      speak({ text: phrase, language: value });
    } catch (error) {
      toast({
        title: "Failed to save preference",
        description: "Could not update your language preference.",
        variant: "destructive",
      });
    }
  };
  
  // Handle voice selection
  const handleVoiceChange = (value: string) => {
    setVoicePreference(value);
    
    // Find voice details to get language
    const voice = voices.find(v => v.voiceURI === value);
    if (voice) {
      // Test the voice
      speak({ text: "This is a test of the selected voice." });
    }
  };
  
  // Handle distance unit change
  const handleDistanceUnitChange = (value: 'km' | 'mi') => {
    setDistanceUnit(value);
    toast({
      title: "Unit Changed",
      description: `Distance will now be displayed in ${value === 'km' ? 'kilometers' : 'miles'}.`,
    });
  };
  
  // Filter voices by selected language
  const filteredVoices = voices.filter(voice => 
    voice.language.startsWith(selectedLanguage.split('-')[0])
  );

  return (
    <div className="flex flex-col min-h-screen bg-dark text-light-gray pt-4 px-4 pb-20">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      
      {/* User Profile Card */}
      <Card className="bg-dark-gray border-0 mb-4">
        <CardContent className="pt-6">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mr-4">
              <span className="material-icons text-3xl">person</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold">{isLoading ? "Loading..." : user?.username || "User"}</h2>
              <p className="text-sm text-gray-400">MOVE Fitness</p>
            </div>
          </div>
          
          {/* Wallet Connection */}
          <div className="bg-dark rounded-lg p-4 mb-4">
            <h3 className="text-md font-medium mb-2">Wallet</h3>
            {isConnected ? (
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-400">Connected Address</p>
                  <p className="font-mono">{formatAddress(address || '')}</p>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleDisconnectWallet}
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-sm text-gray-400 mb-3">Connect your wallet to earn and manage MOVE tokens</p>
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleConnectWallet}
                >
                  <span className="material-icons mr-2 text-sm">account_balance_wallet</span>
                  Connect Wallet
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Settings Card */}
      <Card className="bg-dark-gray border-0 mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            <div className="flex items-center">
              <span className="material-icons mr-2">settings</span>
              Settings
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Language Selection */}
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger className="bg-dark border-gray-700">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent className="bg-dark-gray border-gray-700">
                {languages.map(lang => (
                  <SelectItem key={lang.code} value={lang.code} className="hover:bg-primary/10">
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Voice Selection */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="voice">Voice</Label>
              <Link href="/voice-settings">
                <Button variant="link" size="sm" className="text-primary hover:text-primary/90 -mt-1 px-0">
                  <span className="material-icons text-sm mr-1">mic</span>
                  Voice Commands
                </Button>
              </Link>
            </div>
            <Select 
              value={selectedVoice || ''} 
              onValueChange={handleVoiceChange} 
              disabled={voicesLoading || filteredVoices.length === 0}
            >
              <SelectTrigger className="bg-dark border-gray-700">
                <SelectValue placeholder={voicesLoading ? "Loading voices..." : "Select voice"} />
              </SelectTrigger>
              <SelectContent className="bg-dark-gray border-gray-700">
                {filteredVoices.length === 0 ? (
                  <SelectItem value="none" disabled className="text-gray-500">
                    No voices available for this language
                  </SelectItem>
                ) : (
                  filteredVoices.map(voice => (
                    <SelectItem key={voice.voiceURI} value={voice.voiceURI} className="hover:bg-primary/10">
                      {voice.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          {/* Distance Unit */}
          <div className="space-y-2">
            <Label>Distance Unit</Label>
            <div className="flex space-x-2">
              <Button 
                variant={distanceUnit === 'km' ? "default" : "outline"}
                className={distanceUnit === 'km' ? "bg-primary hover:bg-primary/90" : ""}
                onClick={() => handleDistanceUnitChange('km')}
              >
                Kilometers
              </Button>
              <Button 
                variant={distanceUnit === 'mi' ? "default" : "outline"}
                className={distanceUnit === 'mi' ? "bg-primary hover:bg-primary/90" : ""}
                onClick={() => handleDistanceUnitChange('mi')}
              >
                Miles
              </Button>
            </div>
          </div>
          
          {/* Toggle Switches */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="offline-maps">Offline Maps</Label>
                <p className="text-xs text-gray-400">Download maps for offline use</p>
              </div>
              <Switch 
                id="offline-maps"
                checked={useOfflineMaps}
                onCheckedChange={setUseOfflineMaps}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-xs text-gray-400">Toggle dark/light theme</p>
              </div>
              <Switch 
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* App Info */}
      <Card className="bg-dark-gray border-0">
        <CardContent className="pt-6 text-center">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="material-icons">directions_run</span>
          </div>
          <h3 className="text-lg font-semibold">MOVE App</h3>
          <p className="text-xs text-gray-400 mt-1">Version 1.0.0</p>
          
          <div className="mt-6 space-y-2 text-center">
            <Button variant="link" className="text-gray-400 hover:text-white">Privacy Policy</Button>
            <Button variant="link" className="text-gray-400 hover:text-white">Terms of Service</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
