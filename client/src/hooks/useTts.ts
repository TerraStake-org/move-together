import { useState, useEffect, useCallback } from 'react';

interface TtsOptions {
  text: string;
  language?: string;
  rate?: number;
  pitch?: number;
}

interface VoiceInfo {
  name: string;
  language: string;
  voiceURI: string;
}

const useTts = () => {
  const [voices, setVoices] = useState<VoiceInfo[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      try {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
          setError('Speech synthesis is not supported in this browser');
          setIsLoading(false);
          return;
        }

        const speechVoices = window.speechSynthesis.getVoices();
        
        // Check if voices are available
        if (speechVoices.length === 0) {
          // Some browsers need an event to get voices
          window.speechSynthesis.onvoiceschanged = () => {
            const updatedVoices = window.speechSynthesis.getVoices();
            const voicesList = updatedVoices.map(voice => ({
              name: voice.name,
              language: voice.lang,
              voiceURI: voice.voiceURI
            }));
            setVoices(voicesList);
            setIsLoading(false);
          };
        } else {
          // Voices already loaded
          const voicesList = speechVoices.map(voice => ({
            name: voice.name,
            language: voice.lang,
            voiceURI: voice.voiceURI
          }));
          setVoices(voicesList);
          setIsLoading(false);
        }
      } catch (err) {
        setError(`Failed to load voices: ${err instanceof Error ? err.message : String(err)}`);
        setIsLoading(false);
      }
    };

    loadVoices();
    
    // Try to load saved voice preference
    const savedVoice = localStorage.getItem('preferredVoice');
    if (savedVoice) {
      setSelectedVoice(savedVoice);
    }
  }, []);

  // Set voice preference
  const setVoicePreference = useCallback((voiceURI: string) => {
    setSelectedVoice(voiceURI);
    localStorage.setItem('preferredVoice', voiceURI);
  }, []);

  // Speak text
  const speak = useCallback(({ text, language, rate = 1, pitch = 1 }: TtsOptions) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setError('Speech synthesis is not supported');
      return false;
    }

    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
      
      // Set language or use selected voice
      if (selectedVoice) {
        const voice = window.speechSynthesis.getVoices().find(v => v.voiceURI === selectedVoice);
        if (voice) {
          utterance.voice = voice;
        }
      } else if (language) {
        utterance.lang = language;
      }
      
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (err) {
      setError(`Failed to speak: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    }
  }, [selectedVoice]);

  // Stop speaking
  const stop = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
  }, []);

  // Get voices by language
  const getVoicesByLanguage = useCallback((language: string) => {
    return voices.filter(voice => voice.language.startsWith(language));
  }, [voices]);

  return {
    voices,
    selectedVoice,
    setVoicePreference,
    speak,
    stop,
    isLoading,
    error,
    getVoicesByLanguage
  };
};

export default useTts;
