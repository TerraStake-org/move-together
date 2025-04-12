import React from 'react';
import { Link } from 'wouter';

interface BottomNavigationProps {
  activeTab: string;
}

export default function BottomNavigation({ activeTab }: BottomNavigationProps) {
  // Match the exact tabs from the React Native version
  const tabs = [
    { id: 'map', icon: 'map', label: 'Map', path: '/' },
    { id: 'wallet', icon: 'account_balance_wallet', label: 'Wallet', path: '/wallet' },
    { id: 'rewards', icon: 'redeem', label: 'Rewards', path: '/rewards' },
    { id: 'profile', icon: 'settings', label: 'Settings', path: '/profile' },
  ];

  return (
    <div className="bg-dark-gray px-2 py-2 flex justify-around items-center border-t border-gray-800 fixed bottom-0 left-0 right-0 z-50 h-16">
      {tabs.map((tab) => (
        <Link 
          key={tab.id}
          href={tab.path}
          className={`flex flex-col items-center justify-center w-full h-full ${
            activeTab === tab.id 
              ? 'text-[#ff6347] font-medium' // Match React Native tomato color
              : 'text-gray-500'
          }`}
        >
          <span className="material-icons text-xl">{tab.icon}</span>
          <span className="text-xs mt-0.5">{tab.label}</span>
        </Link>
      ))}
    </div>
  );
}
