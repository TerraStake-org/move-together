#!/bin/bash
# Script to download a sample MBTiles file for testing

set -e  # Exit on any error

echo "MoveTogether - Map Tiles Downloader"
echo "===================================="
echo ""
echo "This script will download a small sample MBTiles file for testing."
echo "For production use, please download full map tiles from OpenMapTiles.org"
echo ""

# Create temp directory
TEMP_DIR=$(mktemp -d)
echo "Created temporary directory: $TEMP_DIR"

# Download sample tiles
echo "Downloading sample map tiles (this may take a few minutes)..."
curl -L "https://github.com/openmaptiles/openmaptiles/releases/download/v3.12.2/zurich_switzerland.mbtiles" -o "$TEMP_DIR/sample.mbtiles"

# Verify download
if [ ! -f "$TEMP_DIR/sample.mbtiles" ]; then
  echo "Error: Failed to download sample map tiles"
  exit 1
fi

FILESIZE=$(du -h "$TEMP_DIR/sample.mbtiles" | cut -f1)
echo "Download complete. File size: $FILESIZE"

# Move to final location
echo "Moving file to tiles directory..."
mv "$TEMP_DIR/sample.mbtiles" "$(dirname "$0")/world.mbtiles"

# Cleanup
rmdir "$TEMP_DIR"

echo ""
echo "Sample map tiles have been downloaded and installed."
echo "File location: $(dirname "$0")/world.mbtiles"
echo ""
echo "This sample contains map data for Zurich, Switzerland."
echo "For full maps, visit: https://openmaptiles.org/"
echo ""
echo "To use these tiles with MoveTogether:"
echo "1. Start the application server"
echo "2. The server will automatically detect and use the world.mbtiles file"
echo "3. Switch to 'Offline' mode in the app"
echo ""
echo "Done!"