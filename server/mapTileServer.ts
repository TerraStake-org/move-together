import express, { Request, Response } from 'express';
import MBTiles from '@mapbox/mbtiles';
import path from 'path';
import { promisify } from 'util';

// Create a mini Express app for serving tile data
const tileRouter = express.Router();

// Connect to the MBTiles file
export async function initializeTileServer(tilesFilePath: string) {
  try {
    console.log(`Attempting to load MBTiles from: ${tilesFilePath}`);
    
    // Use default world tiles if specific file is not available
    // In production, use the specific mbtiles file provided
    const openMBTiles = promisify((filename: string, callback: any) => {
      // @ts-ignore - MBTiles has a different signature than what TS expects
      new MBTiles(filename, callback);
    });
    
    try {
      const mbtilesInstance = await openMBTiles(tilesFilePath);
      console.log('MBTiles loaded successfully');
      
      // Set up the tile server routes
      setupTileRoutes(mbtilesInstance);
      return tileRouter;
    } catch (error) {
      console.error('Error loading MBTiles:', error);
      
      // Set up fallback routes
      setupFallbackTileRoutes();
      return tileRouter;
    }
  } catch (err) {
    console.error('Error in tile server initialization:', err);
    
    // Set up fallback routes
    setupFallbackTileRoutes();
    return tileRouter;
  }
}

function setupTileRoutes(mbtilesInstance: any) {
  // Endpoint to serve vector tiles
  tileRouter.get('/tiles/:z/:x/:y.pbf', async (req: Request, res: Response) => {
    try {
      const { z, x, y } = req.params;
      
      // Promisify the getTile method
      const getTile = promisify(mbtilesInstance.getTile.bind(mbtilesInstance));
      
      try {
        const [data, headers] = await getTile(+z, +x, +y);
        
        // Set headers and send tile data
        if (headers) {
          Object.keys(headers).forEach(key => {
            res.set(key, headers[key]);
          });
        }
        
        res.send(data);
      } catch (tileError) {
        console.warn(`Tile not found: z=${z}, x=${x}, y=${y}`);
        res.status(404).send('Tile not found');
      }
    } catch (error) {
      console.error('Error fetching tile:', error);
      res.status(500).send('Error fetching tile data');
    }
  });
  
  // Endpoint to get metadata about the tiles
  tileRouter.get('/metadata', async (req: Request, res: Response) => {
    try {
      const getMetadata = promisify(mbtilesInstance.getInfo.bind(mbtilesInstance));
      const metadata = await getMetadata();
      res.json(metadata);
    } catch (error) {
      console.error('Error fetching metadata:', error);
      res.status(500).send('Error fetching metadata');
    }
  });
}

function setupFallbackTileRoutes() {
  // Fallback routes if MBTiles file is not available
  tileRouter.get('/tiles/:z/:x/:y.pbf', (req: Request, res: Response) => {
    res.status(404).send('No tile data available');
  });
  
  tileRouter.get('/metadata', (req: Request, res: Response) => {
    res.status(404).json({
      message: 'No MBTiles file loaded',
      fallback: true,
      vector_layers: [],
      bounds: [-180, -85.0511, 180, 85.0511],
      center: [0, 0, 0],
      minzoom: 0,
      maxzoom: 14,
    });
  });
}

export default tileRouter;