# GDAL and MapServer Installation Guide

This document provides detailed instructions for installing and configuring GDAL and MapServer libraries for use with the MoveTogether application's offline mapping features.

## Prerequisites

- 64-bit operating system (Windows, macOS, or Linux)
- Sufficient disk space for map tiles (10-50GB depending on coverage)
- Administrative privileges for installing software

## Installation Steps

### Windows

1. Extract the GDAL/MapServer ZIP package to a permanent location (e.g., `C:\Program Files\GDAL`)
2. Add the bin directory to your system PATH:
   - Open System Properties → Advanced → Environment Variables
   - Edit the Path variable and add the bin directory path
3. Set GDAL_DATA environment variable to point to the `gdal-data` directory in the extracted files
4. Set PROJ_LIB environment variable to point to the `proj` directory

### macOS

1. Extract the GDAL/MapServer package to `/usr/local/gdal`
2. Add the following to your `.bash_profile` or `.zshrc`:
   ```bash
   export PATH="/usr/local/gdal/bin:$PATH"
   export GDAL_DATA="/usr/local/gdal/share/gdal"
   export PROJ_LIB="/usr/local/gdal/share/proj"
   ```
3. Apply changes with `source ~/.bash_profile` or `source ~/.zshrc`

### Linux

1. Extract the GDAL/MapServer package to `/opt/gdal`
2. Create a file in `/etc/profile.d/gdal.sh` with:
   ```bash
   export PATH="/opt/gdal/bin:$PATH"
   export LD_LIBRARY_PATH="/opt/gdal/lib:$LD_LIBRARY_PATH"
   export GDAL_DATA="/opt/gdal/share/gdal"
   export PROJ_LIB="/opt/gdal/share/proj"
   ```
3. Make it executable: `chmod +x /etc/profile.d/gdal.sh`
4. Apply changes by logging out and in again or running `source /etc/profile.d/gdal.sh`

## Verification

Verify the installation by running:

```bash
gdalinfo --version
ogrinfo --version
mapserv -v
```

## Downloading Map Tiles

1. Visit [OpenMapTiles](https://openmaptiles.org/) and register for an account
2. Select a region/country and download the MBTiles file
3. Place the downloaded file in the `tiles` directory as `world.mbtiles`
4. Alternatively, use multiple region files and configure the paths in `server/mapTileServer.ts`

## Working with Large Map Tiles

For processing very large map files:

```bash
# Split a large MBTiles file into regions
ogr2ogr -f MBTILES region1.mbtiles world.mbtiles -spat xmin ymin xmax ymax

# Merge multiple MBTiles files
ogrmerge.py -f MBTILES -o combined.mbtiles file1.mbtiles file2.mbtiles

# Convert and optimize
gdal_translate -of MBTILES -co COMPRESSION=JPEG -co QUALITY=85 input.mbtiles optimized.mbtiles
```

## Troubleshooting

- **DLL Missing Error**: Ensure all DLLs from the bin directory are accessible in your PATH
- **"Not a supported file format"**: Check if your MBTiles file is corrupt or incomplete
- **Performance Issues**: Consider using smaller regional files instead of a single world file
- **Memory Errors**: Increase the value of GDAL_CACHEMAX environment variable

## Additional Resources

- [GDAL Documentation](https://gdal.org/index.html)
- [MapServer Documentation](https://mapserver.org/documentation.html)
- [MBTiles Specification](https://github.com/mapbox/mbtiles-spec)
- [OpenMapTiles Documentation](https://openmaptiles.org/docs/)

For any further assistance, consult the project maintainers or the GitHub repository issues.