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

import { describe, expect, it, vi } from 'vitest';
import {
  areaToRing,
  buildDownloadGeoJSON,
  buildPlanRequest,
  checkSurveyCsv,
  createPlannerClient,
  DEFAULT_PLAN_SETTINGS,
  findObstacles,
  listPlannableAreas,
  planToFeatureCollection,
  summarisePlan,
  validateSettings,
} from '../util/rowPlanner';

const pts = (...coords: [number, number][]) => coords.map(([lat, lng]) => ({ lat, lng }));
const square = (lat: number, lng: number, d: number) =>
  pts([lat, lng], [lat, lng + d], [lat + d, lng + d], [lat + d, lng]);

const field = {
  location_id: 'f1',
  name: 'North',
  type: 'field',
  grid_points: square(51, -2, 0.002),
};
const barn = {
  location_id: 'b1',
  name: 'Barn',
  type: 'barn',
  grid_points: square(51.0005, -1.9995, 0.0002),
};
const farAway = {
  location_id: 'b2',
  name: 'Far',
  type: 'barn',
  grid_points: square(52, -2, 0.0002),
};

describe('areaToRing', () => {
  it('drops the closing duplicate and keeps [lat, lng] order', () => {
    const closed = { grid_points: [...square(51, -2, 0.001), { lat: 51, lng: -2 }] };
    expect(areaToRing(closed)).toEqual([
      [51, -2],
      [51, -1.999],
      [51.001, -1.999],
      [51.001, -2],
    ]);
  });
  it('rejects areas with fewer than 3 points', () => {
    expect(areaToRing({ grid_points: pts([1, 1], [2, 2]) })).toBeNull();
    expect(areaToRing({})).toBeNull();
  });
});

describe('listPlannableAreas and findObstacles', () => {
  const areas = { field: [field], barn: [barn, farAway] };
  it('lists only fields and gardens', () => {
    expect(listPlannableAreas(areas).map((a) => a.id)).toEqual(['f1']);
  });
  it('accepts a single object per type', () => {
    expect(listPlannableAreas({ field })).toHaveLength(1);
  });
  it('returns only obstacles whose centre is inside the field', () => {
    const ring = listPlannableAreas(areas)[0].ring;
    expect(findObstacles(areas, ring)).toHaveLength(1);
  });
});

describe('validateSettings', () => {
  const ok = DEFAULT_PLAN_SETTINGS;
  it('accepts the defaults', () => expect(validateSettings(ok, 0)).toBeNull());
  it('rejects narrow or blank row spacing', () => {
    expect(validateSettings({ ...ok, toolWidth: 0.2 }, 0)).toBe('TOOL_WIDTH');
    expect(validateSettings({ ...ok, toolWidth: '' }, 0)).toBe('TOOL_WIDTH');
  });
  it('rejects a negative headland', () => {
    expect(validateSettings({ ...ok, headland: -1 }, 0)).toBe('NEGATIVE');
  });
  it('requires an angle for straight rows only', () => {
    expect(validateSettings({ ...ok, angle: '' }, 0)).toBe('ANGLE');
    expect(validateSettings({ ...ok, angle: '', contour: true }, 5)).toBeNull();
  });
  it('requires a survey and a sane grid for contour rows', () => {
    expect(validateSettings({ ...ok, contour: true }, 2)).toBe('NEEDS_SURVEY');
    expect(validateSettings({ ...ok, contour: true, gridResolution: 0.1 }, 5)).toBe('GRID');
  });
});

describe('checkSurveyCsv', () => {
  it('counts valid points', () => {
    const csv = 'stamp,lat,lon,alt\n1,48,3,99\n2,48,3.1,98\n3,48,3.2,97\n4,x,3,1\n';
    expect(checkSurveyCsv(csv)).toEqual({ count: 3, errorKey: null });
  });
  it('rejects missing columns and too few points', () => {
    expect(checkSurveyCsv('a,b\n1,2').errorKey).toBe('SURVEY_COLUMNS');
    expect(checkSurveyCsv('lat,lon,alt\n1,2,3\n').errorKey).toBe('SURVEY_POINTS');
  });
  it('does not count blank cells as zero', () => {
    expect(checkSurveyCsv('lat,lon,alt\n1,2,\n1,2,\n1,2,\n').count).toBe(0);
  });
  it('copes with a byte order mark and an empty file', () => {
    expect(checkSurveyCsv('\uFEFFlat,lon,alt\n1,2,3\n1,2,3\n1,2,3').errorKey).toBeNull();
    expect(checkSurveyCsv('').errorKey).toBe('SURVEY_COLUMNS');
  });
});

describe('buildPlanRequest', () => {
  it('ignores the angle when contour rows are requested', () => {
    const req = buildPlanRequest([[1, 1]], [], {
      ...DEFAULT_PLAN_SETTINGS,
      angle: 30,
      contour: true,
    });
    expect(req).toMatchObject({ w: 5, a: 0, h: 0, p: 0, s: true, c: true, dr: 1 });
  });
  it('converts string input to numbers', () => {
    const req = buildPlanRequest([[1, 1]], [], {
      ...DEFAULT_PLAN_SETTINGS,
      toolWidth: '3.5',
      angle: '45',
    });
    expect(req).toMatchObject({ w: 3.5, a: 45 });
  });
});

describe('plan output', () => {
  const result = {
    rows: [
      [
        [51, -2],
        [51, -1.999],
      ],
      [
        [51.0001, -1.999],
        [51.0001, -2],
      ],
    ] as [number, number][][],
    tags: [
      [0, 0],
      [1, 0],
    ] as [number, number][],
    path: [
      [
        [51, -2],
        [51, -1.999],
        [51.0001, -1.999],
        [51.0001, -2],
      ],
    ] as [number, number][][],
    contour: false,
    asked: true,
  };

  it('swaps [lat, lng] to GeoJSON [lng, lat] and tags rows and paths', () => {
    const { features } = planToFeatureCollection(result);
    expect(features).toHaveLength(3);
    expect(features[0].geometry.coordinates[0]).toEqual([-2, 51]);
    expect(features.map((f) => f.properties.role)).toEqual(['row', 'row', 'path']);
  });
  it('returns an empty collection for no plan', () => {
    expect(planToFeatureCollection(null).features).toEqual([]);
  });
  it('summarises lengths and flags a contour fall back', () => {
    const summary = summarisePlan(result);
    expect(summary.rows).toBe(2);
    expect(summary.passes).toBe(1);
    expect(summary.swathKm).toBeGreaterThan(0.1);
    expect(summary.fellBack).toBe(true);
    expect(summary.contourUsed).toBe(false);
  });
  it('writes field and obstacle polygons before rows in the download', () => {
    const request = buildPlanRequest(
      [
        [51, -2],
        [51, -1.9],
        [51.1, -1.9],
      ],
      [
        [
          [51.01, -1.99],
          [51.01, -1.98],
          [51.02, -1.98],
        ],
      ],
      DEFAULT_PLAN_SETTINGS,
    );
    const geojson = buildDownloadGeoJSON(request, result);
    expect(geojson.features.slice(0, 2).map((f) => f.properties.role)).toEqual([
      'field',
      'obstacle',
    ]);
    expect(geojson.features[0].geometry.coordinates[0][0]).toEqual([-2, 51]);
    expect(geojson.features[0].geometry.coordinates[0].at(-1)).toEqual([-2, 51]);
    expect(geojson.properties).toMatchObject({
      generator: 'litefarm-row-planner',
      origin: [51, -2],
    });
  });
});

describe('createPlannerClient', () => {
  const makeFakeWorker = (reply: (msg: any, emit: (data: any) => void) => void) => {
    const listeners = new Set<(e: MessageEvent) => void>();
    const emit = (data: any) => listeners.forEach((l) => l({ data } as MessageEvent));
    return {
      addEventListener: (_: string, l: any) => listeners.add(l),
      removeEventListener: (_: string, l: any) => listeners.delete(l),
      postMessage: vi.fn((msg: any) => reply(msg, emit)),
      terminate: vi.fn(),
      listeners,
    };
  };
  const request = buildPlanRequest([[1, 1]], [], DEFAULT_PLAN_SETTINGS);

  it('relays status messages, resolves with the result and removes its listener', async () => {
    const worker = makeFakeWorker((msg, emit) => {
      emit({ id: msg.id, status: 'PLANNING' });
      emit({ id: msg.id + 99, ok: true, result: 'someone else' });
      emit({ id: msg.id, ok: true, result: { rows: [] } });
    });
    const client = createPlannerClient(() => worker as unknown as Worker);
    const onStatus = vi.fn();
    await expect(client.plan(request, '', onStatus)).resolves.toEqual({ rows: [] });
    expect(onStatus).toHaveBeenCalledWith('PLANNING');
    expect(worker.listeners.size).toBe(0);
  });
  it('rejects with the worker error', async () => {
    const worker = makeFakeWorker((msg, emit) => emit({ id: msg.id, ok: false, error: 'boom' }));
    const client = createPlannerClient(() => worker as unknown as Worker);
    await expect(client.plan(request, '')).rejects.toThrow('boom');
  });
  it('creates the worker once and terminates it', async () => {
    const worker = makeFakeWorker((msg, emit) => emit({ id: msg.id, ok: true, result: {} }));
    const make = vi.fn(() => worker as unknown as Worker);
    const client = createPlannerClient(make);
    await client.plan(request, '');
    await client.plan(request, '');
    expect(make).toHaveBeenCalledTimes(1);
    client.terminate();
    expect(worker.terminate).toHaveBeenCalled();
  });
});
