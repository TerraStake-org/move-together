declare module '@mapbox/mbtiles' {
  type MBTilesCallback = (err: Error | null, instance?: MBTilesInstance) => void;
  type GetTileCallback = (err: Error | null, data?: Buffer, headers?: Record<string, any>) => void;
  type GetInfoCallback = (err: Error | null, info?: Record<string, any>) => void;

  interface MBTilesInstance {
    getTile(z: number, x: number, y: number, callback: GetTileCallback): void;
    getInfo(callback: GetInfoCallback): void;
  }

  const MBTiles: {
    new (filename: string, callback: MBTilesCallback): void;
  };

  export = MBTiles;
}