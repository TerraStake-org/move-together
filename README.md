# MoveTogether

A cutting-edge mobile application that transforms physical activity into a rewarding blockchain-powered experience, leveraging advanced location discovery and interactive design.

## Key Features

- **Move-to-Earn**: Earn MOVE tokens for your physical activities
- **Offline Maps**: Built-in support for offline map tiles
- **Movement Intensity Tracking**: Dynamic UI that adapts to your movement speed
- **Location NFTs**: Mint your favorite locations as NFTs
- **Voice Commands**: Hands-free operation through voice commands
- **Multi-language Support**: Voice and text in multiple languages
- **Blockchain Integration**: MOVE token can be staked, traded, and claimed

## Technologies

- React Native for cross-platform mobile development
- Blockchain integration for MOVE token rewards
- Advanced geolocation tracking and discovery mechanisms
- AI-powered personalization and interaction features
- Web3 staking and reward systems

## Development

To set up the development environment:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

## Offline Maps

The application supports offline map functionality through MBTiles format. Map tiles can be downloaded from [OpenMapTiles](https://openmaptiles.org/).

### Map Tile Setup

1. Download map tiles in MBTiles format (.mbtiles files)
2. Place the files in the `tiles` directory
3. Rename your primary map file to `world.mbtiles` or update the path in `server/mapTileServer.ts`

For quick testing, you can use the provided script:
```bash
# Make the script executable
chmod +x tiles/download-sample-tiles.sh

# Run the script to download a sample map
./tiles/download-sample-tiles.sh
```

### GDAL and MapServer Libraries

For advanced map processing, the application can leverage GDAL and MapServer libraries. See the documentation in the `tiles` directory for installation instructions and usage details.

The recommended versions are:
- GDAL 3.9.2 with MapServer 8.2.2 (for newer systems)
- GDAL 3.9 with MapServer 8.0 (alternative version)

## License

© 2025 TerraStake. All rights reserved.