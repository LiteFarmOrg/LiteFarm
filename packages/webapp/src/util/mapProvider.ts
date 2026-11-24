/*
 *  Copyright 2026 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

/**
 * Selects the map implementation. `google` is the existing behaviour and the default.
 * `maplibre` uses the MapLibre GL container with the raster imagery configured below.
 */
export type MapProvider = 'google' | 'maplibre';

const env = import.meta.env;

export const MAP_PROVIDER: MapProvider =
  env.VITE_MAP_PROVIDER === 'maplibre' ? 'maplibre' : 'google';

export const isMapLibreProvider = MAP_PROVIDER === 'maplibre';

// Same public Esri World Imagery endpoint the Sowbot web planner uses (no API key).
// Check Esri's terms before relying on it in production, or point these at another provider.
export const IMAGERY_TILE_URL: string =
  env.VITE_MAP_IMAGERY_URL ||
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

export const IMAGERY_ATTRIBUTION: string = env.VITE_MAP_IMAGERY_ATTRIBUTION || 'Esri';

export const IMAGERY_MAX_ZOOM: number = Number(env.VITE_MAP_IMAGERY_MAXZOOM) || 19;

/** MapLibre style with the configured raster imagery over a plain background. */
export const buildImageryStyle = () => ({
  version: 8 as const,
  sources: {
    imagery: {
      type: 'raster' as const,
      tiles: [IMAGERY_TILE_URL],
      tileSize: 256,
      maxzoom: IMAGERY_MAX_ZOOM,
      attribution: IMAGERY_ATTRIBUTION,
    },
  },
  layers: [
    { id: 'background', type: 'background' as const, paint: { 'background-color': '#e8e8e8' } },
    { id: 'imagery', type: 'raster' as const, source: 'imagery' },
  ],
});
