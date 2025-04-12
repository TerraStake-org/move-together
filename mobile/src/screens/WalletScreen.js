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
import { getTokenBalance } from '../web3/TokenMinter';

const WalletScreen = () => {
  const { address, isConnected, connect } = useWeb3();
  const [balance, setBalance] = useState('0');
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch token balance
  const fetchBalance = async () => {
    if (!isConnected || !address) return;
    
    try {
      setIsLoading(true);
      const balanceResult = await getTokenBalance(address);
      if (balanceResult.success) {
        setBalance(balanceResult.balance);
      } else {
        console.error('Error fetching balance:', balanceResult.error);
      }
    } catch (error) {
      console.error('Failed to get token balance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch transaction history (mock data for now)
  const fetchTransactionHistory = async () => {
    if (!isConnected || !address) return;
    
    setIsLoading(true);
    
    // In a real app, this would be fetched from the blockchain
    // using a service like Etherscan API or similar
    setTimeout(() => {
      const mockTransactions = [
        {
          id: '1',
          type: 'Reward',
          amount: '5.2',
          timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
          description: 'Running reward'
        },
        {
          id: '2',
          type: 'Reward',
          amount: '3.7',
          timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
          description: 'Walking reward'
        },
        {
          id: '3',
          type: 'Stake',
          amount: '-10.0',
          timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
          description: 'Tokens staked'
        }
      ];
      
      setTransactions(mockTransactions);
      setIsLoading(false);
    }, 1000);
  };

  // Connect wallet function
  const handleConnectWallet = async () => {
    try {
      await connect();
    } catch (error) {
      Alert.alert('Connection Error', error.message);
    }
  };

  // Format timestamp to readable date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Refresh all data
  const refreshData = () => {
    fetchBalance();
    fetchTransactionHistory();
  };

  // Load data when component mounts or when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      refreshData();
    }
  }, [isConnected, address]);

  // Render loading state
  if (isLoading && !isConnected) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6347" />
        <Text style={styles.loadingText}>Loading wallet data...</Text>
      </View>
    );
  }

  // Render connect wallet state
  if (!isConnected) {
    return (
      <View style={styles.centered}>
        <MaterialIcons name="account-balance-wallet" size={64} color="#FF6347" />
        <Text style={styles.title}>Connect Wallet</Text>
        <Text style={styles.subtitle}>
          Connect your wallet to view your MOVE token balance and transaction history
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleConnectWallet}>
          <Text style={styles.buttonText}>Connect Wallet</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wallet</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={refreshData}>
          <MaterialIcons name="refresh" size={24} color="#FF6347" />
        </TouchableOpacity>
      </View>
      
      <ScrollView>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Your MOVE Balance</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceValue}>
              {parseFloat(balance).toFixed(2)}
            </Text>
            <Text style={styles.tokenSymbol}>MOVE</Text>
          </View>
          <Text style={styles.walletAddress}>
            {address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : ''}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIcon}>
              <MaterialIcons name="send" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionText}>Send</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIcon}>
              <MaterialIcons name="call-received" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionText}>Receive</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIcon}>
              <MaterialIcons name="sync" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionText}>Swap</Text>
          </TouchableOpacity>
        </View>

        {/* Transactions Section */}
        <View style={styles.transactionsContainer}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          {isLoading ? (
            <ActivityIndicator size="small" color="#FF6347" style={styles.loader} />
          ) : transactions.length > 0 ? (
            transactions.map(transaction => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionIconContainer}>
                  <MaterialIcons 
                    name={transaction.type === 'Reward' ? 'directions-run' : 'account-balance'} 
                    size={24} 
                    color={transaction.type === 'Reward' ? '#4CAF50' : '#FF9800'} 
                  />
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionTitle}>{transaction.description}</Text>
                  <Text style={styles.transactionDate}>{formatDate(transaction.timestamp)}</Text>
                </View>
                <Text style={[
                  styles.transactionAmount,
                  { color: transaction.amount.startsWith('-') ? '#FF5252' : '#4CAF50' }
                ]}>
                  {transaction.amount.startsWith('-') ? '' : '+'}{transaction.amount} MOVE
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No recent transactions</Text>
          )}
        </View>
      </ScrollView>
    </View>
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
  balanceCard: {
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
  balanceLabel: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
  },
  tokenSymbol: {
    color: '#FF6347',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
    marginBottom: 4,
  },
  walletAddress: {
    color: '#888888',
    fontSize: 14,
    marginTop: 8,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginBottom: 24,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    backgroundColor: '#FF6347',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  transactionsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  transactionDate: {
    color: '#AAAAAA',
    fontSize: 12,
    marginTop: 4,
  },
  transactionAmount: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyText: {
    color: '#888888',
    textAlign: 'center',
    marginTop: 20,
  },
  loader: {
    marginTop: 20,
  },
});

export default WalletScreen;