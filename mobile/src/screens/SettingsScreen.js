import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useWeb3 } from '../web3/Web3Context';

const SettingsScreen = ({ navigation }) => {
  const { address, isConnected, connect, disconnect } = useWeb3();
  
  // Settings state
  const [darkMode, setDarkMode] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [backgroundTrackingEnabled, setBackgroundTrackingEnabled] = useState(true);
  const [voiceFeedbackEnabled, setVoiceFeedbackEnabled] = useState(true);
  const [measurementUnit, setMeasurementUnit] = useState('km');
  
  // Handle toggle switches
  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleNotifications = () => setNotificationsEnabled(!notificationsEnabled);
  const toggleTracking = () => setTrackingEnabled(!trackingEnabled);
  const toggleBackgroundTracking = () => setBackgroundTrackingEnabled(!backgroundTrackingEnabled);
  const toggleVoiceFeedback = () => setVoiceFeedbackEnabled(!voiceFeedbackEnabled);
  
  // Toggle measurement unit (km/mi)
  const toggleMeasurementUnit = () => {
    setMeasurementUnit(measurementUnit === 'km' ? 'mi' : 'km');
  };
  
  // Connect/disconnect wallet
  const handleWalletConnection = async () => {
    if (isConnected) {
      try {
        await disconnect();
        Alert.alert('Success', 'Wallet disconnected successfully');
      } catch (error) {
        Alert.alert('Error', `Failed to disconnect wallet: ${error.message}`);
      }
    } else {
      try {
        await connect();
      } catch (error) {
        Alert.alert('Error', `Failed to connect wallet: ${error.message}`);
      }
    }
  };
  
  // Navigate to TTS settings
  const navigateToTtsSettings = () => {
    // In a real app, this would navigate to TTS settings screen
    Alert.alert('Voice Settings', 'This would navigate to the Voice Settings screen in a real app');
  };
  
  // Backup wallet
  const handleBackupWallet = () => {
    Alert.alert(
      'Backup Wallet',
      'Do you want to backup your wallet? This will create a secure backup of your wallet.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Backup', 
          onPress: () => {
            // In a real app, this would trigger wallet backup logic
            Alert.alert('Success', 'Wallet backed up successfully!');
          }
        }
      ]
    );
  };
  
  // Reset statistics
  const handleResetStats = () => {
    Alert.alert(
      'Reset Statistics',
      'Are you sure you want to reset all your activity statistics? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            // In a real app, this would reset user statistics
            Alert.alert('Success', 'Statistics reset successfully');
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      
      {/* User Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <MaterialIcons name="account-circle" size={80} color="#FF6347" />
        </View>
        
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>MOVE User</Text>
          <Text style={styles.userSubtitle}>
            Level 5 Runner • 120km Total
          </Text>
          
          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Wallet Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Wallet</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <MaterialIcons name="account-balance-wallet" size={24} color="#FF6347" style={styles.settingIcon} />
            <Text style={styles.settingLabel}>Connect Wallet</Text>
          </View>
          <TouchableOpacity style={styles.actionButton} onPress={handleWalletConnection}>
            <Text style={styles.actionButtonText}>
              {isConnected ? 'Disconnect' : 'Connect'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {isConnected && (
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <MaterialIcons name="info" size={24} color="#FF6347" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>Wallet Address</Text>
                <Text style={styles.addressText}>
                  {`${address.substring(0, 8)}...${address.substring(address.length - 6)}`}
                </Text>
              </View>
            </View>
          </View>
        )}
        
        {isConnected && (
          <TouchableOpacity style={styles.settingItem} onPress={handleBackupWallet}>
            <View style={styles.settingContent}>
              <MaterialIcons name="backup" size={24} color="#FF6347" style={styles.settingIcon} />
              <Text style={styles.settingLabel}>Backup Wallet</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#AAAAAA" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* App Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <MaterialIcons name="brightness-4" size={24} color="#FF6347" style={styles.settingIcon} />
            <Text style={styles.settingLabel}>Dark Mode</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: '#767577', true: '#FF634780' }}
            thumbColor={darkMode ? '#FF6347' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <MaterialIcons name="notifications" size={24} color="#FF6347" style={styles.settingIcon} />
            <Text style={styles.settingLabel}>Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: '#767577', true: '#FF634780' }}
            thumbColor={notificationsEnabled ? '#FF6347' : '#f4f3f4'}
          />
        </View>
        
        <TouchableOpacity style={styles.settingItem} onPress={toggleMeasurementUnit}>
          <View style={styles.settingContent}>
            <MaterialIcons name="straighten" size={24} color="#FF6347" style={styles.settingIcon} />
            <Text style={styles.settingLabel}>Measurement Unit</Text>
          </View>
          <View style={styles.unitSelector}>
            <Text style={styles.unitText}>
              {measurementUnit === 'km' ? 'Kilometers (km)' : 'Miles (mi)'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      
      {/* Tracking Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tracking</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <MaterialIcons name="location-on" size={24} color="#FF6347" style={styles.settingIcon} />
            <Text style={styles.settingLabel}>Location Tracking</Text>
          </View>
          <Switch
            value={trackingEnabled}
            onValueChange={toggleTracking}
            trackColor={{ false: '#767577', true: '#FF634780' }}
            thumbColor={trackingEnabled ? '#FF6347' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <MaterialIcons name="gps-fixed" size={24} color="#FF6347" style={styles.settingIcon} />
            <Text style={styles.settingLabel}>Background Tracking</Text>
          </View>
          <Switch
            value={backgroundTrackingEnabled}
            onValueChange={toggleBackgroundTracking}
            trackColor={{ false: '#767577', true: '#FF634780' }}
            thumbColor={backgroundTrackingEnabled ? '#FF6347' : '#f4f3f4'}
          />
        </View>
      </View>
      
      {/* Voice Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Voice & Sound</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <MaterialIcons name="record-voice-over" size={24} color="#FF6347" style={styles.settingIcon} />
            <Text style={styles.settingLabel}>Voice Feedback</Text>
          </View>
          <Switch
            value={voiceFeedbackEnabled}
            onValueChange={toggleVoiceFeedback}
            trackColor={{ false: '#767577', true: '#FF634780' }}
            thumbColor={voiceFeedbackEnabled ? '#FF6347' : '#f4f3f4'}
          />
        </View>
        
        <TouchableOpacity style={styles.settingItem} onPress={navigateToTtsSettings}>
          <View style={styles.settingContent}>
            <MaterialIcons name="settings-voice" size={24} color="#FF6347" style={styles.settingIcon} />
            <Text style={styles.settingLabel}>Voice Settings</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#AAAAAA" />
        </TouchableOpacity>
      </View>
      
      {/* Data Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleResetStats}>
          <View style={styles.settingContent}>
            <MaterialIcons name="restore" size={24} color="#FF6347" style={styles.settingIcon} />
            <Text style={styles.settingLabel}>Reset Statistics</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#AAAAAA" />
        </TouchableOpacity>
      </View>
      
      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <MaterialIcons name="info" size={24} color="#FF6347" style={styles.settingIcon} />
            <View>
              <Text style={styles.settingLabel}>App Version</Text>
              <Text style={styles.versionText}>1.0.0</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingContent}>
            <MaterialIcons name="rate-review" size={24} color="#FF6347" style={styles.settingIcon} />
            <Text style={styles.settingLabel}>Rate This App</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#AAAAAA" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingContent}>
            <MaterialIcons name="help-outline" size={24} color="#FF6347" style={styles.settingIcon} />
            <Text style={styles.settingLabel}>Help & Support</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#AAAAAA" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileSection: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userSubtitle: {
    fontSize: 14,
    color: '#BBBBBB',
    marginBottom: 12,
  },
  editProfileButton: {
    backgroundColor: '#333333',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  editProfileText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  actionButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  addressText: {
    fontSize: 12,
    color: '#AAAAAA',
    marginTop: 2,
  },
  unitSelector: {
    backgroundColor: '#333333',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  unitText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  versionText: {
    fontSize: 12,
    color: '#AAAAAA',
    marginTop: 2,
  },
});

export default SettingsScreen;