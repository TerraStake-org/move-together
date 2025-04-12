import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useWeb3 } from '../web3/Web3Context';
import { getStakingInfo, stakeTokens, unstakeTokens, claimRewards, getApr } from '../web3/MoveStaking';

const RewardsScreen = () => {
  const { address, isConnected, connect } = useWeb3();
  const [stakingInfo, setStakingInfo] = useState({
    stakedAmount: '0',
    totalStaked: '0',
    rewardRate: '0',
    pendingRewards: '0',
    lastStakedAt: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [apr, setApr] = useState(0);
  const [stakeAmount, setStakeAmount] = useState('10');
  const [unstakeAmount, setUnstakeAmount] = useState('0');

  // Fetch staking info
  const fetchStakingInfo = async () => {
    if (!isConnected || !address) return;
    
    try {
      setIsLoading(true);
      const info = await getStakingInfo(address);
      if (info && info.success) {
        setStakingInfo(info.data);
      } else {
        console.error('Error getting staking info:', info?.error);
      }

      // Get APR
      const aprResult = await getApr();
      if (aprResult && aprResult.success) {
        setApr(aprResult.apr);
      } else {
        console.error('Failed to calculate APR:', aprResult?.error);
      }
    } catch (error) {
      console.error('Failed to get staking info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle staking tokens
  const handleStake = async () => {
    if (!isConnected || !address) {
      Alert.alert('Connection Required', 'Please connect your wallet first');
      return;
    }
    
    try {
      setIsLoading(true);
      const amount = parseFloat(stakeAmount);
      
      if (isNaN(amount) || amount <= 0) {
        Alert.alert('Invalid Amount', 'Please enter a valid stake amount');
        return;
      }
      
      const result = await stakeTokens(amount);
      
      if (result.success) {
        Alert.alert('Success', `Successfully staked ${amount} MOVE tokens!`);
        fetchStakingInfo(); // Refresh data
      } else {
        Alert.alert('Staking Failed', result.error?.message || 'Unknown error occurred');
      }
    } catch (error) {
      Alert.alert('Staking Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle unstaking tokens
  const handleUnstake = async () => {
    if (!isConnected || !address) {
      Alert.alert('Connection Required', 'Please connect your wallet first');
      return;
    }
    
    try {
      setIsLoading(true);
      const amount = parseFloat(unstakeAmount);
      
      if (isNaN(amount) || amount <= 0) {
        Alert.alert('Invalid Amount', 'Please enter a valid unstake amount');
        return;
      }
      
      if (amount > parseFloat(stakingInfo.stakedAmount)) {
        Alert.alert('Insufficient Stake', 'You cannot unstake more than your staked amount');
        return;
      }
      
      const result = await unstakeTokens(amount);
      
      if (result.success) {
        Alert.alert('Success', `Successfully unstaked ${amount} MOVE tokens!`);
        fetchStakingInfo(); // Refresh data
      } else {
        Alert.alert('Unstaking Failed', result.error?.message || 'Unknown error occurred');
      }
    } catch (error) {
      Alert.alert('Unstaking Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle claiming rewards
  const handleClaim = async () => {
    if (!isConnected || !address) {
      Alert.alert('Connection Required', 'Please connect your wallet first');
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (parseFloat(stakingInfo.pendingRewards) <= 0) {
        Alert.alert('No Rewards', 'You have no pending rewards to claim');
        return;
      }
      
      const result = await claimRewards();
      
      if (result.success) {
        Alert.alert('Success', `Successfully claimed ${stakingInfo.pendingRewards} MOVE tokens!`);
        fetchStakingInfo(); // Refresh data
      } else {
        Alert.alert('Claiming Failed', result.error?.message || 'Unknown error occurred');
      }
    } catch (error) {
      Alert.alert('Claiming Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Connect wallet function
  const handleConnectWallet = async () => {
    try {
      await connect();
    } catch (error) {
      Alert.alert('Connection Error', error.message);
    }
  };

  // Calculate time since last staked
  const getTimeStaked = () => {
    if (!stakingInfo.lastStakedAt) return 'Not staked yet';
    
    const lastStakedDate = new Date(stakingInfo.lastStakedAt * 1000);
    const now = new Date();
    const diffMs = now - lastStakedDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${diffDays}d ${diffHrs}h`;
  };

  // Load data when component mounts or when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      fetchStakingInfo();
    }
  }, [isConnected, address]);

  // Render loading state
  if (isLoading && !isConnected) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6347" />
        <Text style={styles.loadingText}>Loading staking data...</Text>
      </View>
    );
  }

  // Render connect wallet state
  if (!isConnected) {
    return (
      <View style={styles.centered}>
        <MaterialIcons name="redeem" size={64} color="#FF6347" />
        <Text style={styles.title}>Connect Wallet</Text>
        <Text style={styles.subtitle}>
          Connect your wallet to stake MOVE tokens and earn rewards
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleConnectWallet}>
          <Text style={styles.buttonText}>Connect Wallet</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Staking Rewards</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchStakingInfo}>
          <MaterialIcons name="refresh" size={24} color="#FF6347" />
        </TouchableOpacity>
      </View>
      
      {/* Staking Overview Card */}
      <View style={styles.overviewCard}>
        <View style={styles.overviewRow}>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewLabel}>Staked</Text>
            <Text style={styles.overviewValue}>
              {parseFloat(stakingInfo.stakedAmount).toFixed(2)} MOVE
            </Text>
          </View>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewLabel}>APR</Text>
            <Text style={styles.overviewValue}>
              {apr ? `${apr.toFixed(2)}%` : '--'}
            </Text>
          </View>
        </View>
        
        <View style={styles.overviewRow}>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewLabel}>Pending Rewards</Text>
            <Text style={styles.overviewValue}>
              {parseFloat(stakingInfo.pendingRewards).toFixed(2)} MOVE
            </Text>
          </View>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewLabel}>Time Staked</Text>
            <Text style={styles.overviewValue}>{getTimeStaked()}</Text>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.rewardActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.stakeButton]} 
            onPress={handleStake}
            disabled={isLoading}
          >
            <Text style={styles.actionButtonText}>Stake</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.unstakeButton]} 
            onPress={handleUnstake}
            disabled={isLoading || parseFloat(stakingInfo.stakedAmount) <= 0}
          >
            <Text style={styles.actionButtonText}>Unstake</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              styles.claimButton,
              parseFloat(stakingInfo.pendingRewards) <= 0 ? styles.disabledButton : null
            ]} 
            onPress={handleClaim}
            disabled={isLoading || parseFloat(stakingInfo.pendingRewards) <= 0}
          >
            <Text style={styles.actionButtonText}>Claim</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Staking Information */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Staking Information</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>My Stake</Text>
            <Text style={styles.infoValue}>
              {parseFloat(stakingInfo.stakedAmount).toFixed(2)} MOVE
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Staked (All Users)</Text>
            <Text style={styles.infoValue}>
              {parseFloat(stakingInfo.totalStaked).toFixed(2)} MOVE
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Rewards Rate</Text>
            <Text style={styles.infoValue}>
              {parseFloat(stakingInfo.rewardRate).toFixed(4)} MOVE/day
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>APR</Text>
            <Text style={styles.infoValue}>
              {apr ? `${apr.toFixed(2)}%` : '--'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>My Pending Rewards</Text>
            <Text style={styles.infoValue}>
              {parseFloat(stakingInfo.pendingRewards).toFixed(2)} MOVE
            </Text>
          </View>
        </View>
      </View>
      
      {/* How Staking Works */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>How Staking Works</Text>
        
        <View style={styles.stepCard}>
          <View style={styles.stepIconContainer}>
            <MaterialIcons name="monetization-on" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>1. Stake Your MOVE Tokens</Text>
            <Text style={styles.stepDescription}>
              Stake your MOVE tokens to earn passive rewards. The longer you stake, the more you earn.
            </Text>
          </View>
        </View>
        
        <View style={styles.stepCard}>
          <View style={styles.stepIconContainer}>
            <MaterialIcons name="timelapse" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>2. Earn Rewards Over Time</Text>
            <Text style={styles.stepDescription}>
              Rewards accumulate automatically based on your stake amount and the current APR.
            </Text>
          </View>
        </View>
        
        <View style={styles.stepCard}>
          <View style={styles.stepIconContainer}>
            <MaterialIcons name="redeem" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>3. Claim Your Rewards</Text>
            <Text style={styles.stepDescription}>
              Claim your earned rewards at any time. Rewards will be added to your wallet balance.
            </Text>
          </View>
        </View>
        
        <View style={styles.stepCard}>
          <View style={styles.stepIconContainer}>
            <MaterialIcons name="repeat" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>4. Unstake Anytime</Text>
            <Text style={styles.stepDescription}>
              You can unstake your MOVE tokens at any time with no penalties.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  refreshButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginVertical: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#AAAAAA',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#FF6347',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    color: '#AAAAAA',
    marginTop: 16,
  },
  overviewCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    margin: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  overviewItem: {
    flex: 1,
  },
  overviewLabel: {
    color: '#AAAAAA',
    fontSize: 14,
    marginBottom: 4,
  },
  overviewValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#333333',
    marginVertical: 16,
  },
  rewardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  stakeButton: {
    backgroundColor: '#4CAF50',
  },
  unstakeButton: {
    backgroundColor: '#FF9800',
  },
  claimButton: {
    backgroundColor: '#FF6347',
  },
  disabledButton: {
    backgroundColor: '#555555',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  infoSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  infoLabel: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  stepIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6347',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stepDescription: {
    color: '#AAAAAA',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default RewardsScreen;