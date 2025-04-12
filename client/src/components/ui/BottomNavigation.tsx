import React from 'react';
import { Link } from 'wouter';

interface BottomNavigationProps {
  activeTab: string;
}

export default function BottomNavigation({ activeTab }: BottomNavigationProps) {
  const tabs = [
    { id: 'map', icon: 'map', label: 'Map', path: '/map' },
    { id: 'activity', icon: 'insights', label: 'Activity', path: '/activity' },
    { id: 'rewards', icon: 'savings', label: 'Rewards', path: '/rewards' },
    { id: 'profile', icon: 'person', label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="bg-dark-gray px-2 py-4 flex justify-around items-center border-t border-gray-800 fixed bottom-0 left-0 right-0 z-10">
      {tabs.map((tab) => (
        <Link 
          key={tab.id}
          href={tab.path}
          className={`flex flex-col items-center ${activeTab === tab.id ? 'nav-active text-white font-medium' : 'nav-inactive text-gray-500'}`}
        >
          <div className={activeTab === tab.id ? "nav-indicator mb-1" : "mb-1 h-[25px]"}></div>
          <span className="material-icons">{tab.icon}</span>
          <span className="text-xs mt-1">{tab.label}</span>
        </Link>
      ))}
    </div>
  );
}
