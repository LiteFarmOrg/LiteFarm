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
import useRowPlan, {
  ROW_PLAN_PATH_LAYER_ID,
  ROW_PLAN_ROWS_LAYER_ID,
  ROW_PLAN_SOURCE_ID,
} from '../containers/MapLibre/useRowPlan';

const makeMap = () => {
  const layers = new Set<string>();
  const sources = new Set<string>();
  return {
    layers,
    sources,
    getLayer: vi.fn((id: string) => (layers.has(id) ? { id } : undefined)),
    getSource: vi.fn((id: string) => (sources.has(id) ? { id } : undefined)),
    addSource: vi.fn((id: string) => sources.add(id)),
    addLayer: vi.fn((layer: { id: string }) => layers.add(layer.id)),
    removeLayer: vi.fn((id: string) => layers.delete(id)),
    removeSource: vi.fn((id: string) => sources.delete(id)),
  };
};

const feature = (role: string) => ({
  type: 'Feature',
  properties: { role },
  geometry: {
    type: 'LineString',
    coordinates: [
      [0, 0],
      [1, 1],
    ],
  },
});
const collection = (...roles: string[]) => ({
  type: 'FeatureCollection',
  features: roles.map(feature),
});

describe('useRowPlan', () => {
  it('does nothing without a map or a plan', () => {
    const map = makeMap();
    renderHook(() => useRowPlan({ map: null, collection: collection('row') }));
    renderHook(() => useRowPlan({ map, collection: null }));
    expect(map.addSource).not.toHaveBeenCalled();
  });
  it('adds rows only when there is no path', () => {
    const map = makeMap();
    renderHook(() => useRowPlan({ map, collection: collection('row', 'row') }));
    expect(map.sources.has(ROW_PLAN_SOURCE_ID)).toBe(true);
    expect(map.layers.has(ROW_PLAN_ROWS_LAYER_ID)).toBe(true);
    expect(map.layers.has(ROW_PLAN_PATH_LAYER_ID)).toBe(false);
  });
  it('adds the path layer above the rows when there is a path', () => {
    const map = makeMap();
    renderHook(() => useRowPlan({ map, collection: collection('row', 'path') }));
    expect([...map.layers]).toEqual([ROW_PLAN_ROWS_LAYER_ID, ROW_PLAN_PATH_LAYER_ID]);
  });
  it('replaces the plan when the collection changes and removes it on null and unmount', () => {
    const map = makeMap();
    const { rerender, unmount } = renderHook(({ c }) => useRowPlan({ map, collection: c }), {
      initialProps: { c: collection('row', 'path') as any },
    });
    rerender({ c: collection('row') });
    expect([...map.layers]).toEqual([ROW_PLAN_ROWS_LAYER_ID]);
    rerender({ c: null });
    expect(map.layers.size).toBe(0);
    expect(map.sources.size).toBe(0);
    rerender({ c: collection('row') });
    unmount();
    expect(map.layers.size).toBe(0);
  });
  it('survives a map that was already removed', () => {
    const map = makeMap();
    const { unmount } = renderHook(() => useRowPlan({ map, collection: collection('row') }));
    map.getLayer.mockImplementation(() => {
      throw new Error('gone');
    });
    expect(() => unmount()).not.toThrow();
  });
});
