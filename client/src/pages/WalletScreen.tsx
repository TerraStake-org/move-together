import React from 'react';
import { useWeb3 } from '@/context/Web3Context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function WalletScreen() {
  const { address, connect, isConnected } = useWeb3();
  const { toast } = useToast();

  const handleConnect = async () => {
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

  return (
    <div className="flex flex-col min-h-screen bg-dark text-light-gray">
      {/* Header */}
      <div className="bg-dark-gray p-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Wallet</h1>
        {isConnected ? (
          <div className="bg-primary px-3 py-1 rounded-full text-xs flex items-center">
            <span className="material-icons text-sm mr-1">account_balance_wallet</span>
            <span>Connected</span>
          </div>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-full flex items-center text-xs" 
            onClick={handleConnect}
          >
            <span className="material-icons text-sm mr-1">account_balance_wallet</span>
            Connect Wallet
          </Button>
        )}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-6">
        {isConnected ? (
          <div className="space-y-8">
            {/* Wallet Info */}
            <div className="bg-dark-gray rounded-xl p-6">
              <h2 className="text-lg font-medium mb-4">Your Wallet</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Address:</span>
                  <span className="font-mono text-sm">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">MOVE Balance:</span>
                  <span>1,250.00 MOVE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Staked:</span>
                  <span>750.00 MOVE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Available to Withdraw:</span>
                  <span>500.00 MOVE</span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="bg-dark-gray border-primary/50 hover:bg-dark-gray/80 h-16 flex flex-col items-center justify-center"
              >
                <span className="material-icons mb-1">arrow_circle_up</span>
                <span>Send</span>
              </Button>
              <Button 
                variant="outline" 
                className="bg-dark-gray border-primary/50 hover:bg-dark-gray/80 h-16 flex flex-col items-center justify-center"
              >
                <span className="material-icons mb-1">arrow_circle_down</span>
                <span>Receive</span>
              </Button>
              <Button 
                variant="outline" 
                className="bg-dark-gray border-primary/50 hover:bg-dark-gray/80 h-16 flex flex-col items-center justify-center"
              >
                <span className="material-icons mb-1">swap_horiz</span>
                <span>Swap</span>
              </Button>
              <Button 
                variant="outline" 
                className="bg-dark-gray border-primary/50 hover:bg-dark-gray/80 h-16 flex flex-col items-center justify-center"
              >
                <span className="material-icons mb-1">history</span>
                <span>History</span>
              </Button>
            </div>
            
            {/* Recent Transactions */}
            <div className="bg-dark-gray rounded-xl p-6">
              <h2 className="text-lg font-medium mb-4">Recent Transactions</h2>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        i % 2 === 0 ? 'bg-green-900/30 text-green-400' : 'bg-blue-900/30 text-blue-400'
                      }`}>
                        <span className="material-icons">
                          {i % 2 === 0 ? 'add_circle' : 'remove_circle'}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="font-medium">
                          {i % 2 === 0 ? 'Earned from Exercise' : 'Staked MOVE Tokens'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className={i % 2 === 0 ? 'text-green-400' : 'text-blue-400'}>
                      {i % 2 === 0 ? '+' : ''}{i * 25}.00 MOVE
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-dark-gray rounded-xl p-8 text-center max-w-md">
              <span className="material-icons text-6xl text-gray-500 mb-4">account_balance_wallet</span>
              <h2 className="text-xl font-medium mb-2">Connect Your Wallet</h2>
              <p className="text-gray-400 mb-6">Connect your wallet to view your MOVE token balance and transaction history</p>
              <Button onClick={handleConnect} className="w-full">
                Connect Wallet
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}