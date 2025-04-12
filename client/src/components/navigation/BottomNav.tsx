import React from 'react';
import { useLocation, Link } from 'wouter';
import { useIsMobile } from '@/hooks/use-mobile';

// Navigation items matching the mobile app structure
const navItems = [
  { name: 'Map', path: '/', icon: 'map' },
  { name: 'Wallet', path: '/wallet', icon: 'account_balance_wallet' },
  { name: 'Rewards', path: '/rewards', icon: 'redeem' },
  { name: 'Settings', path: '/profile', icon: 'settings' }
];

export default function BottomNav() {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  
  if (!isMobile) return null; // Only show on mobile
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-dark-gray border-t border-neutral-800 flex justify-around items-center h-16 z-50">
      {navItems.map((item) => {
        const isActive = location === item.path;
        
        return (
          <Link 
            key={item.name} 
            href={item.path}
            className={`flex flex-col items-center justify-center w-full h-full ${
              isActive ? 'text-primary' : 'text-neutral-400'
            }`}
          >
            <span className="material-icons text-xl">{item.icon}</span>
            <span className="text-xs mt-0.5">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}