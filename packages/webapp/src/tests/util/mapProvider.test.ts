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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  for (const key of [
    'VITE_MAP_PROVIDER',
    'VITE_MAP_IMAGERY_URL',
    'VITE_MAP_IMAGERY_ATTRIBUTION',
    'VITE_MAP_IMAGERY_MAXZOOM',
  ])
    vi.stubEnv(key, '');
});
afterEach(() => vi.unstubAllEnvs());

describe('map provider configuration', () => {
  it.each(['', 'google', 'unknown', 'MapLibre'])(
    'preserves Google as the default for provider %j',
    async (provider) => {
      vi.stubEnv('VITE_MAP_PROVIDER', provider);
      const config = await import('../../util/mapProvider');
      expect(config.MAP_PROVIDER).toBe('google');
      expect(config.isMapLibreProvider).toBe(false);
    },
  );

  it('enables MapLibre explicitly', async () => {
    vi.stubEnv('VITE_MAP_PROVIDER', 'maplibre');
    const config = await import('../../util/mapProvider');
    expect(config.MAP_PROVIDER).toBe('maplibre');
    expect(config.isMapLibreProvider).toBe(true);
  });

  it('builds the default satellite raster style', async () => {
    const { buildImageryStyle } = await import('../../util/mapProvider');
    expect(buildImageryStyle()).toEqual({
      version: 8,
      sources: {
        imagery: {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
          maxzoom: 19,
          attribution: 'Esri',
        },
      },
      layers: [
        { id: 'background', type: 'background', paint: { 'background-color': '#e8e8e8' } },
        { id: 'imagery', type: 'raster', source: 'imagery' },
      ],
    });
  });

  it('uses custom imagery configuration and gives each map an independent style', async () => {
    vi.stubEnv('VITE_MAP_IMAGERY_URL', 'https://tiles.example/{z}/{x}/{y}.png');
    vi.stubEnv('VITE_MAP_IMAGERY_ATTRIBUTION', 'Local imagery');
    vi.stubEnv('VITE_MAP_IMAGERY_MAXZOOM', '17');
    const { buildImageryStyle, IMAGERY_MAX_ZOOM } = await import('../../util/mapProvider');
    const first = buildImageryStyle();
    expect(first.sources.imagery).toMatchObject({
      tiles: ['https://tiles.example/{z}/{x}/{y}.png'],
      attribution: 'Local imagery',
      maxzoom: 17,
    });
    expect(IMAGERY_MAX_ZOOM).toBe(17);
    first.sources.imagery.tiles.push('changed');
    first.layers.pop();
    const second = buildImageryStyle();
    expect(second.sources.imagery.tiles).toEqual(['https://tiles.example/{z}/{x}/{y}.png']);
    expect(second.layers).toHaveLength(2);
  });

  it.each(['', 'invalid'])('uses default zoom for missing or nonnumeric zoom %j', async (zoom) => {
    vi.stubEnv('VITE_MAP_IMAGERY_MAXZOOM', zoom);
    const { IMAGERY_MAX_ZOOM } = await import('../../util/mapProvider');
    expect(IMAGERY_MAX_ZOOM).toBe(19);
  });
});
