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

import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import useSoilLayers from '../containers/MapLibre/useSoilLayers';
import { SOIL_LAYER_ID, SOIL_LAYERS, SOIL_SOURCE_ID } from '../util/soilLayers';

const makeMap = (existingLayers: string[] = ['areas-fill']) => {
  const layers = new Set(existingLayers);
  const sources = new Set<string>();
  return {
    layers,
    sources,
    getLayer: vi.fn((id: string) => (layers.has(id) ? { id } : undefined)),
    getSource: vi.fn((id: string) => (sources.has(id) ? { id } : undefined)),
    addSource: vi.fn((id: string) => sources.add(id)),
    addLayer: vi.fn((layer: { id: string }, _beforeId?: string) => layers.add(layer.id)),
    removeLayer: vi.fn((id: string) => layers.delete(id)),
    removeSource: vi.fn((id: string) => sources.delete(id)),
    setPaintProperty: vi.fn(),
  };
};

const phLayer = SOIL_LAYERS.find((l) => l.id === 'soilgrids-phh2o')!;
const clayLayer = SOIL_LAYERS.find((l) => l.id === 'soilgrids-clay')!;

describe('useSoilLayers', () => {
  it('does nothing without a map', () => {
    expect(() =>
      renderHook(() => useSoilLayers({ map: null, layer: phLayer, opacity: 0.5 })),
    ).not.toThrow();
  });

  it('adds nothing when no layer is selected', () => {
    const map = makeMap();
    renderHook(() => useSoilLayers({ map, layer: null, opacity: 0.5 }));
    expect(map.addSource).not.toHaveBeenCalled();
    expect(map.addLayer).not.toHaveBeenCalled();
  });

  it('adds the source and a raster layer under the locations', () => {
    const map = makeMap();
    renderHook(() => useSoilLayers({ map, layer: phLayer, opacity: 0.5 }));
    expect(map.addSource).toHaveBeenCalledWith(
      SOIL_SOURCE_ID,
      expect.objectContaining({ type: 'raster', attribution: phLayer.attribution }),
    );
    expect(map.addLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        id: SOIL_LAYER_ID,
        type: 'raster',
        source: SOIL_SOURCE_ID,
        paint: { 'raster-opacity': 0.5 },
      }),
      'areas-fill',
    );
  });

  it('adds the layer on top when the locations layer does not exist yet', () => {
    const map = makeMap([]);
    renderHook(() => useSoilLayers({ map, layer: phLayer, opacity: 0.5 }));
    expect(map.addLayer.mock.calls[0][1]).toBeUndefined();
  });

  it('replaces the overlay when another layer is chosen', () => {
    const map = makeMap();
    const { rerender } = renderHook((props) => useSoilLayers(props), {
      initialProps: { map, layer: phLayer as typeof phLayer | null, opacity: 0.5 },
    });
    rerender({ map, layer: clayLayer, opacity: 0.5 });
    expect(map.removeLayer).toHaveBeenCalledWith(SOIL_LAYER_ID);
    expect(map.removeSource).toHaveBeenCalledWith(SOIL_SOURCE_ID);
    expect(map.addSource).toHaveBeenCalledTimes(2);
    expect(map.sources.has(SOIL_SOURCE_ID)).toBe(true);
  });

  it('removes the overlay when the selection is cleared', () => {
    const map = makeMap();
    const { rerender } = renderHook((props) => useSoilLayers(props), {
      initialProps: { map, layer: phLayer as typeof phLayer | null, opacity: 0.5 },
    });
    rerender({ map, layer: null, opacity: 0.5 });
    expect(map.layers.has(SOIL_LAYER_ID)).toBe(false);
    expect(map.sources.has(SOIL_SOURCE_ID)).toBe(false);
  });

  it('updates opacity without rebuilding the source', () => {
    const map = makeMap();
    const { rerender } = renderHook((props) => useSoilLayers(props), {
      initialProps: { map, layer: phLayer as typeof phLayer | null, opacity: 0.5 },
    });
    rerender({ map, layer: phLayer, opacity: 0.8 });
    expect(map.setPaintProperty).toHaveBeenCalledWith(SOIL_LAYER_ID, 'raster-opacity', 0.8);
    expect(map.addSource).toHaveBeenCalledTimes(1);
  });

  it('removes the overlay on unmount and tolerates a map that is already gone', () => {
    const map = makeMap();
    const { unmount } = renderHook(() => useSoilLayers({ map, layer: phLayer, opacity: 0.5 }));
    unmount();
    expect(map.layers.has(SOIL_LAYER_ID)).toBe(false);

    const brokenMap = makeMap();
    const hook = renderHook(() => useSoilLayers({ map: brokenMap, layer: phLayer, opacity: 0.5 }));
    brokenMap.removeLayer.mockImplementation(() => {
      throw new Error('map removed');
    });
    expect(() => hook.unmount()).not.toThrow();
  });
});
