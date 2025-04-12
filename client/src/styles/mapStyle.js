// Basic map style for Google Maps
export const mapStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#1d1d1d' }]
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f5f5f5' }]
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#242f3e' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#38414e' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212a37' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#17263c' }]
  }
];

// Modern map styles themed by type (used by ModernMap.tsx)
export const modernMapStyles = {
  dark: {
    background: '#121212',
    pattern: 'radial-gradient(circle at center, #1a1a1a 0%, #121212 100%)',
    mapStyle: [
      {
        elementType: 'geometry',
        stylers: [{ color: '#000000' }]
      },
      {
        elementType: 'labels.text.fill',
        stylers: [{ color: '#3b82f6' }]
      },
      {
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#222222' }]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#222222' }]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#101820' }]
      }
    ]
  },
  neon: {
    background: '#0a0a20',
    pattern: 'linear-gradient(to bottom, #0a0a20 0%, #1a1a2a 100%)',
    mapStyle: [
      {
        elementType: 'geometry',
        stylers: [{ color: '#000030' }]
      },
      {
        elementType: 'labels.text.fill',
        stylers: [{ color: '#00f2ff' }]
      },
      {
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#000040' }]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#000050' }]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#000060' }]
      }
    ]
  },
  retro: {
    background: '#e8d5b7',
    pattern: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23996633\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
    mapStyle: [
      {
        elementType: 'geometry',
        stylers: [{ color: '#e8d5b7' }]
      },
      {
        elementType: 'labels.text.fill',
        stylers: [{ color: '#6b4226' }]
      },
      {
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#f5f1e6' }]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#f8c967' }]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#abd9e9' }]
      }
    ]
  }
};