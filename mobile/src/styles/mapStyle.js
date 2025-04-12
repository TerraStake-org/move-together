// Dark map style for Google Maps
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
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#FF6347' }] // Tomato color for locality names
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#263c3f' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b9a76' }]
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
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca5b3' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#746855' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f2835' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f3d19c' }]
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2f3948' }]
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#17263c' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#515c6d' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#17263c' }]
  }
];

// Neon map style
export const neonMapStyle = [
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
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#0000ff' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#0064ff' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#000060' }]
  }
];

// Retro/vintage map style
export const retroMapStyle = [
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
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#e69b54' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#abd9e9' }]
  }
];