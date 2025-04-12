import { useState, useEffect, useCallback } from 'react';

// Sample phrases for different languages (from the provided TtsSettingsScreen)
const SAMPLE_PHRASES: Record<string, string> = {
  'en-US': 'Hello, I wish you a wonderful day.',
  'en-GB': 'Hello, I wish you a wonderful day.',
  'es-ES': 'Hola, te deseo un día maravilloso.',
  'fr-FR': 'Bonjour, je vous souhaite une merveilleuse journée.',
  'de-DE': 'Hallo, ich wünsche dir einen wunderbaren Tag.',
  'ja-JP': 'こんにちは、素晴らしい一日をお過ごしください。',
  'ko-KR': '안녕하세요, 멋진 하루 되세요.',
  'zh-CN': '你好，祝你有美好的一天。',
  'ar-SA': 'مرحبًا، أتمنى لك يومًا رائعًا.',
  'ru-RU': 'Здравствуйте, желаю вам прекрасного дня.',
  'default': 'Hello, I wish you a wonderful day.',
};

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
  networkRequired?: boolean;
  default?: boolean;
}

interface GroupedVoices {
  [language: string]: VoiceInfo[];
}

const useTts = () => {
  const [voices, setVoices] = useState<VoiceInfo[]>([]);
  const [groupedVoices, setGroupedVoices] = useState<GroupedVoices>({});
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLanguages, setExpandedLanguages] = useState<Record<string, boolean>>({});

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
            processVoices(updatedVoices);
          };
        } else {
          // Voices already loaded
          processVoices(speechVoices);
        }
      } catch (err) {
        setError(`Failed to load voices: ${err instanceof Error ? err.message : String(err)}`);
        setIsLoading(false);
      }
    };

    const processVoices = (speechVoices: SpeechSynthesisVoice[]) => {
      // First, create the flat list of all voices
      const voicesList = speechVoices.map(voice => ({
        name: voice.name,
        language: voice.lang,
        voiceURI: voice.voiceURI,
        networkRequired: false,
        default: voice.default
      }));
      setVoices(voicesList);

      // Then group them by language
      const grouped = voicesList.reduce((acc, voice) => {
        const lang = voice.language || 'Unknown';
        if (!acc[lang]) acc[lang] = [];
        acc[lang].push(voice);
        return acc;
      }, {} as GroupedVoices);
      
      setGroupedVoices(grouped);
      setIsLoading(false);

      // Set default expanded language to the current browser language
      const browserLang = navigator.language;
      const langKey = Object.keys(grouped).find(key => key.startsWith(browserLang.split('-')[0]));
      if (langKey) {
        setExpandedLanguages(prev => ({ ...prev, [langKey]: true }));
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

  // Toggle language expansion
  const toggleLanguage = useCallback((language: string) => {
    setExpandedLanguages(prev => ({
      ...prev,
      [language]: !prev[language]
    }));
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
          // Make sure to also set the language to avoid mismatches
          utterance.lang = voice.lang;
        }
      } else if (language) {
        utterance.lang = language;
        
        // Try to find a voice for this language
        const availableVoices = window.speechSynthesis.getVoices();
        const voiceForLanguage = availableVoices.find(v => v.lang === language);
        if (voiceForLanguage) {
          utterance.voice = voiceForLanguage;
        }
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

  // Get voice by URI
  const getVoiceByUri = useCallback((uri: string): VoiceInfo | undefined => {
    return voices.find(voice => voice.voiceURI === uri);
  }, [voices]);

  // Get sample phrase for language
  const getSamplePhrase = useCallback((language: string): string => {
    return SAMPLE_PHRASES[language] || SAMPLE_PHRASES['default'];
  }, []);

  // Speak sample for testing voice
  const speakSample = useCallback((voiceURI: string) => {
    const voice = getVoiceByUri(voiceURI);
    if (!voice) return false;
    
    const sampleText = getSamplePhrase(voice.language);
    return speak({ text: sampleText, language: voice.language });
  }, [getVoiceByUri, getSamplePhrase, speak]);

  return {
    voices,
    groupedVoices,
    selectedVoice,
    expandedLanguages,
    setVoicePreference,
    toggleLanguage,
    speak,
    speakSample,
    getSamplePhrase,
    stop,
    isLoading,
    error
  };
};

export default useTts;
