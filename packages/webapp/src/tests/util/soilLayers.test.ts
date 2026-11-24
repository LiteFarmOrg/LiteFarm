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

import { describe, expect, it } from 'vitest';
import {
  buildSoilSource,
  buildWmsTileUrl,
  getSoilLayersForLocation,
  getSoilRegions,
  SOIL_LAYERS,
} from '../../util/soilLayers';

describe('getSoilRegions', () => {
  it('offers only the global layers away from the regional datasets', () => {
    expect(getSoilRegions(-1.29, 36.82)).toEqual(['global']); // Nairobi
    expect(getSoilRegions(51.54, -2.4)).toEqual(['global']); // South Gloucestershire
  });

  it('adds Scottish layers first in Scotland', () => {
    expect(getSoilRegions(57.15, -2.1)).toEqual(['scotland', 'global']);
  });

  it('adds SSURGO first in the US, including Alaska and Hawaii', () => {
    expect(getSoilRegions(42.4, -76.5)).toEqual(['us', 'global']);
    expect(getSoilRegions(64.8, -147.7)).toEqual(['us', 'global']);
    expect(getSoilRegions(19.7, -155.1)).toEqual(['us', 'global']);
  });

  it('falls back to global for missing coordinates', () => {
    expect(getSoilRegions(NaN, NaN)).toEqual(['global']);
    expect(getSoilRegions(undefined as any, undefined as any)).toEqual(['global']);
  });
});

describe('getSoilLayersForLocation', () => {
  it('lists regional layers before the global ones', () => {
    const ids = getSoilLayersForLocation(57.15, -2.1).map((layer) => layer.id);
    expect(ids.slice(0, 2)).toEqual(['hutton-wrb', 'hutton-lca']);
    expect(ids).toContain('soilgrids-phh2o');
    expect(ids).not.toContain('ssurgo-mapunits');
  });

  it('never offers regional layers outside their region', () => {
    const ids = getSoilLayersForLocation(51.54, -2.4).map((layer) => layer.id);
    expect(ids.every((id) => id.startsWith('soilgrids-'))).toBe(true);
  });
});

describe('buildWmsTileUrl', () => {
  it('keeps the MapLibre bbox token unencoded', () => {
    const url = buildWmsTileUrl('https://example.org/wms', 'a');
    expect(url).toContain('BBOX={bbox-epsg-3857}');
    expect(url).not.toContain('%7B');
  });

  it('requests WMS 1.3.0 PNG tiles in EPSG:3857', () => {
    const url = buildWmsTileUrl('https://example.org/wms', 'a');
    expect(url).toContain('VERSION=1.3.0');
    expect(url).toContain('REQUEST=GetMap');
    expect(url).toContain('CRS=EPSG:3857');
    expect(url).toContain('FORMAT=image/png');
    expect(url).toContain('TRANSPARENT=TRUE');
    expect(url).toContain('WIDTH=256');
    expect(url).toContain('HEIGHT=256');
  });

  it('appends to an existing query string with &', () => {
    const url = buildWmsTileUrl(
      'https://maps.isric.org/mapserv?map=/map/phh2o.map',
      'phh2o_0-5cm_mean',
    );
    expect(url.startsWith('https://maps.isric.org/mapserv?map=/map/phh2o.map&SERVICE=WMS')).toBe(
      true,
    );
    expect(url).toContain('LAYERS=phh2o_0-5cm_mean');
  });

  it('does not repeat parameters already in the base URL', () => {
    const url = buildWmsTileUrl('https://example.org/service.ows?SERVICE=WMS', 'mapunitpoly');
    expect(url.match(/SERVICE=WMS/g)).toHaveLength(1);
  });

  it('encodes layer names', () => {
    expect(buildWmsTileUrl('https://example.org/wms', 'a b,c')).toContain('LAYERS=a%20b%2Cc');
  });
});

describe('SOIL_LAYERS', () => {
  it('has unique ids and https endpoints', () => {
    const ids = SOIL_LAYERS.map((layer) => layer.id);
    expect(new Set(ids).size).toBe(ids.length);
    SOIL_LAYERS.forEach((layer) => expect(layer.baseUrl.startsWith('https://')).toBe(true));
  });

  it('has an attribution for every layer', () => {
    SOIL_LAYERS.forEach((layer) => expect(layer.attribution.length).toBeGreaterThan(0));
  });

  it('builds a raster source capped at the layer max zoom', () => {
    const layer = SOIL_LAYERS.find((l) => l.id === 'soilgrids-clay')!;
    const source = buildSoilSource(layer);
    expect(source.type).toBe('raster');
    expect(source.maxzoom).toBe(layer.maxZoom);
    expect(source.tiles).toHaveLength(1);
    expect(source.attribution).toBe(layer.attribution);
  });
});
