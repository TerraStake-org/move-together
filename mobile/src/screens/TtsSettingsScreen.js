import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert
} from 'react-native';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Sample phrases for different languages
const SAMPLE_PHRASES = {
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

const TtsSettingsScreen = ({ navigation }) => {
  const [groupedVoices, setGroupedVoices] = useState([]);
  const [expandedLanguages, setExpandedLanguages] = useState({});
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set up and load voices when component mounts
  useEffect(() => {
    loadVoices();
    loadSelectedVoice();
  }, []);

  // Load the previously selected voice
  const loadSelectedVoice = async () => {
    try {
      const saved = await AsyncStorage.getItem('selectedVoice');
      if (saved) {
        setSelectedVoice(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load selected voice', error);
    }
  };

  // Load available voices
  const loadVoices = async () => {
    try {
      const allVoices = await Speech.getAvailableVoicesAsync();
      
      // Group voices by language
      const grouped = allVoices.reduce((acc, voice) => {
        // Extract base language code (e.g., 'en' from 'en-US')
        const lang = voice.language || 'Unknown';
        if (!acc[lang]) acc[lang] = [];
        acc[lang].push(voice);
        return acc;
      }, {});

      // Convert to section format
      const sections = Object.entries(grouped).map(([language, data]) => ({
        title: language,
        data,
      }));

      setGroupedVoices(sections);
      
      // Default expand the selected voice's language
      if (selectedVoice) {
        setExpandedLanguages(prev => ({
          ...prev,
          [selectedVoice.language]: true
        }));
      }
    } catch (err) {
      console.error('Failed to load voices', err);
      Alert.alert('Error', 'Failed to load available voices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle language section expansion
  const toggleLanguage = (lang) => {
    setExpandedLanguages((prev) => ({
      ...prev,
      [lang]: !prev[lang],
    }));
  };

  // Select and test a voice
  const selectVoice = async (voice) => {
    try {
      setSelectedVoice(voice);
      await AsyncStorage.setItem('selectedVoice', JSON.stringify(voice));
      
      // Speak sample phrase in the selected language
      const phrase = SAMPLE_PHRASES[voice.language] || SAMPLE_PHRASES['default'];
      await Speech.speak(phrase, {
        language: voice.language,
        voice: voice.identifier
      });
    } catch (error) {
      console.error('Error selecting voice', error);
      Alert.alert('Error', 'Failed to set voice. Please try a different one.');
    }
  };

  // Render each voice item
  const renderVoiceItem = ({ item, section }) => {
    if (!expandedLanguages[section.title]) return null;

    const isSelected = selectedVoice && selectedVoice.identifier === item.identifier;
    return (
      <TouchableOpacity
        style={[styles.voiceItem, isSelected && styles.selectedItem]}
        onPress={() => selectVoice(item)}
      >
        <View style={styles.voiceRow}>
          <View>
            <Text style={styles.voiceName}>{item.name}</Text>
            <Text style={styles.voiceQuality}>
              {item.quality === 'Enhanced' ? 'High Quality' : 'Standard'}
            </Text>
          </View>
          
          {isSelected && (
            <MaterialIcons name="check-circle" size={24} color="#FF6347" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Render language section header
  const renderSectionHeader = ({ section: { title } }) => (
    <TouchableOpacity 
      onPress={() => toggleLanguage(title)} 
      style={styles.sectionHeader}
    >
      <Text style={styles.sectionTitle}>
        {getLanguageName(title)}
      </Text>
      <MaterialIcons 
        name={expandedLanguages[title] ? "keyboard-arrow-down" : "keyboard-arrow-right"} 
        size={24} 
        color="#FFFFFF" 
      />
    </TouchableOpacity>
  );

  // Get friendly language name from code
  const getLanguageName = (code) => {
    const languages = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'ar': 'Arabic',
      'ru': 'Russian',
      'pt': 'Portuguese',
      'nl': 'Dutch',
      'hi': 'Hindi',
      'sv': 'Swedish',
      'tr': 'Turkish',
      'pl': 'Polish',
      'da': 'Danish',
      'fi': 'Finnish',
      'no': 'Norwegian',
      'th': 'Thai',
      'vi': 'Vietnamese',
      'Unknown': 'Other Languages'
    };
    
    return languages[code] || code;
  };

  // Test current voice
  const testCurrentVoice = async () => {
    if (!selectedVoice) {
      Alert.alert('No Voice Selected', 'Please select a voice first.');
      return;
    }
    
    const phrase = SAMPLE_PHRASES[selectedVoice.language] || SAMPLE_PHRASES['default'];
    await Speech.speak(phrase, {
      language: selectedVoice.language,
      voice: selectedVoice.identifier
    });
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6347" />
        <Text style={styles.loadingText}>Loading available voices...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Voice Settings</Text>
        <View style={styles.spacer} />
      </View>
      
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Voice Feedback</Text>
        <Text style={styles.infoText}>
          Select a voice for audio feedback during your runs. The app will announce your distance, 
          pace, and achievements in the selected voice.
        </Text>
      </View>
      
      <View style={styles.selectedVoiceContainer}>
        <Text style={styles.sectionLabel}>Currently Selected</Text>
        {selectedVoice ? (
          <View style={styles.currentVoiceCard}>
            <View>
              <Text style={styles.currentVoiceName}>{selectedVoice.name}</Text>
              <Text style={styles.currentVoiceLanguage}>
                {getLanguageName(selectedVoice.language)}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.testButton}
              onPress={testCurrentVoice}
            >
              <MaterialIcons name="volume-up" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.noVoiceText}>No voice selected</Text>
        )}
      </View>
      
      <Text style={styles.sectionLabel}>Available Voices</Text>
      <SectionList
        sections={groupedVoices}
        keyExtractor={(item) => item.identifier}
        renderItem={renderVoiceItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
  },
  spacer: {
    width: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    color: '#AAAAAA',
    marginTop: 16,
  },
  infoCard: {
    backgroundColor: '#1E1E1E',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6347',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#AAAAAA',
    lineHeight: 20,
  },
  selectedVoiceContainer: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  currentVoiceCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentVoiceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  currentVoiceLanguage: {
    fontSize: 14,
    color: '#AAAAAA',
    marginTop: 4,
  },
  testButton: {
    backgroundColor: '#FF6347',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noVoiceText: {
    color: '#AAAAAA',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    backgroundColor: '#1E1E1E',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  voiceItem: {
    padding: 16,
    backgroundColor: '#2A2A2A',
    marginHorizontal: 16,
    marginTop: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  selectedItem: {
    backgroundColor: 'rgba(255, 99, 71, 0.2)',
  },
  voiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voiceName: {
    fontSize: 15,
    color: '#FFFFFF',
  },
  voiceQuality: {
    fontSize: 12,
    color: '#AAAAAA',
    marginTop: 4,
  },
});

export default TtsSettingsScreen;