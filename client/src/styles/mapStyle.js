// src/styles/mapStyle.js
export const mapStyle = [
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ff6347' }],
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: '#f0f0f0' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#c9c9c9' }],
  },
];

// Enhanced styles for our modern map implementation
export const modernMapStyles = {
  // Dark theme with blue accents
  dark: {
    background: '#121212',
    pattern: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233b82f6' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    colors: {
      primary: '#3b82f6',
      secondary: '#2563eb',
      text: '#ffffff',
      subdued: '#9ca3af',
      highlight: '#3b82f6',
      paths: '#3b82f6',
      startPoint: '#10b981',
      currentPoint: '#3b82f6',
      overlay: 'from-dark to-transparent',
      statusBox: 'bg-dark/80',
      controlButton: 'bg-dark-gray/80 hover:bg-dark-gray',
    }
  },
  
  // Neon theme with bright cyan accents
  neon: {
    background: '#0d1117',
    pattern: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300f2ff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    colors: {
      primary: '#00f2ff',
      secondary: '#00d7df',
      text: '#ffffff',
      subdued: '#a5f3ff',
      highlight: '#00f2ff',
      paths: '#00f2ff',
      startPoint: '#00ff9d',
      currentPoint: '#00f2ff',
      overlay: 'from-blue-900/70 to-transparent',
      statusBox: 'bg-blue-900/80 border border-[#00f2ff]/50',
      controlButton: 'bg-blue-900/80 hover:bg-blue-900 text-[#00f2ff] border border-[#00f2ff]/50',
    }
  },
  
  // Retro adventure theme with earth tones
  retro: {
    background: '#e8ddcb',
    pattern: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='smallGrid' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 8 0 L 0 0 0 8' fill='none' stroke='%23d9ccb0' stroke-width='0.5'/%3E%3C/pattern%3E%3Cpattern id='grid' width='80' height='80' patternUnits='userSpaceOnUse'%3E%3Crect width='80' height='80' fill='url(%23smallGrid)'/%3E%3Cpath d='M 80 0 L 0 0 0 80' fill='none' stroke='%23c6bb9f' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)' /%3E%3C/svg%3E")`,
    colors: {
      primary: '#f8c967',
      secondary: '#e5b75f',
      text: '#543b1a',
      subdued: '#a58d6e',
      highlight: '#f8c967',
      paths: 'gradient', // This uses a gradient in the code
      startPoint: '#a7bd74',
      currentPoint: '#f8c967',
      overlay: 'from-amber-900/40 to-transparent',
      statusBox: 'bg-amber-800/80 text-amber-50 border border-amber-600/50',
      controlButton: 'bg-amber-50/80 hover:bg-amber-50 text-amber-900',
    }
  }
};