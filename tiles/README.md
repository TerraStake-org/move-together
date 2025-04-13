# Map Tiles Directory

This directory is used to store offline map tiles in MBTiles format for the MoveTogether application.

## Required Files

To enable offline maps functionality, you need to:

1. Download map tiles in MBTiles format (`.mbtiles` files) from services like [OpenMapTiles](https://openmaptiles.org/)
2. Place the downloaded MBTiles files in this directory
3. Ensure the main map file is named `world.mbtiles` (or update the path in `server/mapTileServer.ts`)

## GDAL and MapServer Libraries

For advanced map processing, the following libraries are recommended:

- GDAL 3.9.2 with MapServer 8.2.2 (for newer systems)
- GDAL 3.9 with MapServer 8.0 (alternative version)

These libraries provide powerful tools for working with geospatial data and can enhance the map tile processing capabilities.

## Installation Instructions

### Installing Libraries

1. Extract the GDAL/MapServer ZIP packages to a suitable location on your system
2. Add the library directories to your system path
3. Verify installation with `gdal-config --version` and `mapserv -v`

### Processing Map Tiles

Use GDAL utilities for common tasks:

```bash
# List information about an MBTiles file
gdalinfo world.mbtiles

# Convert between formats
gdal_translate -of MBTILES input.tif output.mbtiles

# Create tile index
gdaltindex -write_absolute_path index.shp world.mbtiles
```

For more information on working with MBTiles, consult the [GDAL documentation](https://gdal.org/drivers/raster/mbtiles.html).

## Notes

- Map tiles can be large files. They are excluded from Git tracking via `.gitignore`.
- The server requires read access to these files, ensure proper permissions are set.