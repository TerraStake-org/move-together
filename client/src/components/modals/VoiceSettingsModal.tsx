import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import useTts from '@/hooks/useTts';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VoiceSettingsModal({ isOpen, onClose }: VoiceSettingsModalProps) {
  const { 
    voices, 
    groupedVoices, 
    selectedVoice, 
    expandedLanguages, 
    toggleLanguage, 
    setVoicePreference, 
    speakSample, 
    isLoading 
  } = useTts();
  
  const { toast } = useToast();
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [activeTab, setActiveTab] = useState<'voices' | 'settings'>('voices');

  const handleVoiceSelection = (voiceUri: string) => {
    setVoicePreference(voiceUri);
    speakSample(voiceUri);
    
    toast({
      title: "Voice Updated",
      description: "Your voice preference has been saved.",
    });
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="bg-dark-gray border-gray-700 text-light-gray sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Voice Settings</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="ml-3">Loading available voices...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-dark-gray border-gray-700 text-light-gray sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Voice Settings</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="voices" onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="voices">Available Voices</TabsTrigger>
            <TabsTrigger value="settings">Voice Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="voices" className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {Object.entries(groupedVoices).map(([language, languageVoices]) => (
              <div key={language} className="mb-4">
                <Button
                  variant="ghost"
                  className="w-full text-left flex justify-between items-center py-2 border-b border-gray-700"
                  onClick={() => toggleLanguage(language)}
                >
                  <span className="font-medium">{language}</span>
                  <span>{expandedLanguages[language] ? '▾' : '▸'}</span>
                </Button>
                
                {expandedLanguages[language] && (
                  <div className="space-y-2 mt-2">
                    {languageVoices.map((voice) => (
                      <Button
                        key={voice.voiceURI}
                        variant="ghost"
                        className={`w-full text-left py-2 px-3 rounded ${selectedVoice === voice.voiceURI ? 'bg-primary/20 border border-primary/50' : 'hover:bg-gray-800'}`}
                        onClick={() => handleVoiceSelection(voice.voiceURI)}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm">{voice.name}</span>
                          {selectedVoice === voice.voiceURI && (
                            <span className="text-primary">✓</span>
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {Object.keys(groupedVoices).length === 0 && (
              <div className="text-center py-4">
                <p className="text-gray-400">No voice options available for your browser</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Speaking Rate</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-xs">Slow</span>
                  <Slider
                    value={[rate]}
                    min={0.5}
                    max={2}
                    step={0.1}
                    onValueChange={(values) => setRate(values[0])}
                  />
                  <span className="text-xs">Fast</span>
                </div>
                <div className="text-right text-xs text-gray-400">{rate.toFixed(1)}x</div>
              </div>
              
              <div className="space-y-3">
                <Label>Pitch</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-xs">Low</span>
                  <Slider
                    value={[pitch]}
                    min={0.5}
                    max={2}
                    step={0.1}
                    onValueChange={(values) => setPitch(values[0])}
                  />
                  <span className="text-xs">High</span>
                </div>
                <div className="text-right text-xs text-gray-400">{pitch.toFixed(1)}</div>
              </div>
              
              <Button 
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => {
                  if (selectedVoice) {
                    speakSample(selectedVoice);
                  }
                }}
                disabled={!selectedVoice}
              >
                Test Current Voice
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}