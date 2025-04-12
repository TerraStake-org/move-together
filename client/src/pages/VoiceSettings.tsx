import { useState } from 'react';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';
import { VoiceCommandList, VoiceCommandButton } from '@/components/voice/VoiceCommandButton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Volume2, Plus, Check } from 'lucide-react';

/**
 * Voice Settings Page
 * Allows users to manage voice commands and settings
 */
export default function VoiceSettings() {
  const [language, setLanguage] = useState('en-US');
  const [command, setCommand] = useState('');
  const [action, setAction] = useState('navigation');
  const [icon, setIcon] = useState('navigation');
  
  const { createCommand } = useVoiceCommands(language);
  
  // List of available languages
  const languages = [
    { value: 'en-US', label: 'English (US)' },
    { value: 'es-ES', label: 'Spanish (Spain)' },
    { value: 'fr-FR', label: 'French (France)' },
    { value: 'ja-JP', label: 'Japanese (Japan)' }
  ];
  
  // List of common actions
  const actions = [
    { value: 'navigation', label: 'Navigation', icon: 'navigation' },
    { value: 'tracking', label: 'Activity Tracking', icon: 'track_changes' },
    { value: 'balance', label: 'Check Balance', icon: 'savings' },
    { value: 'rewards', label: 'View Rewards', icon: 'emoji_events' },
    { value: 'settings', label: 'Open Settings', icon: 'settings' }
  ];
  
  // Handle form submission to create a new command
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!command || !action || !icon) return;
    
    createCommand({
      command,
      action,
      icon,
      language
    });
    
    // Reset form
    setCommand('');
  };
  
  return (
    <div className="container max-w-4xl py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Voice Commands</h1>
          <p className="text-muted-foreground">
            Manage your voice commands and settings
          </p>
        </div>
        
        {/* Example voice command button */}
        <VoiceCommandButton 
          language={language} 
          position="relative" 
        />
      </div>
      
      <Tabs defaultValue="commands" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="commands">Available Commands</TabsTrigger>
          <TabsTrigger value="add">Add New Command</TabsTrigger>
        </TabsList>
        
        <TabsContent value="commands" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Language</CardTitle>
              <CardDescription>
                Select the language for voice commands
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full md:w-[300px]">
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Commands</CardTitle>
              <CardDescription>
                List of available voice commands for {
                  languages.find(lang => lang.value === language)?.label || language
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VoiceCommandList language={language} />
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Say "Help" or "What can I say?" to hear available commands while using the app.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add New Command</CardTitle>
              <CardDescription>
                Create a custom voice command for your needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="command">Command Phrase</Label>
                  <div className="flex items-start gap-2">
                    <Volume2 className="mt-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="command"
                      placeholder="E.g., Navigate to the park"
                      value={command}
                      onChange={(e) => setCommand(e.target.value)}
                      required
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enter the exact phrase you want to say to trigger this command
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="action">Action</Label>
                  <Select value={action} onValueChange={(value) => {
                    setAction(value);
                    // Set default icon based on action
                    const selectedAction = actions.find(a => a.value === value);
                    if (selectedAction) {
                      setIcon(selectedAction.icon);
                    }
                  }}>
                    <SelectTrigger id="action">
                      <SelectValue placeholder="Select an action" />
                    </SelectTrigger>
                    <SelectContent>
                      {actions.map((act) => (
                        <SelectItem key={act.value} value={act.value}>
                          {act.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-4">
                  <Button type="submit" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Command
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Natural language processing will help recognize commands even when they're not an exact match.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Test Command Recognition</CardTitle>
            <CardDescription>
              Try saying a phrase to see if it matches an existing command
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <div className="text-center">
              <p className="mb-4">Press the microphone button and say a command</p>
              <VoiceCommandButton size="lg" position="relative" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              <p>Natural language processing helps understand similar phrases.</p>
            </div>
            <div className="flex items-center text-sm text-green-600">
              <Check className="mr-1 h-4 w-4" />
              <span>NLP Processing Active</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}