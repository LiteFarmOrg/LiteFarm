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

import { configureStore } from '@reduxjs/toolkit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '../store/api/apiSlice';
import { rowPlanApi } from '../store/api/rowPlanApi';

// Uses the real api slice (and its 'content-type' response handler) with only fetch stubbed, because
// the API serves plan exports as application/geo+json, which RTK Query does not treat as JSON.
const makeStore = () =>
  configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      entitiesReducer: () => ({ userFarmReducer: { user_id: 'user', farm_id: 'farm' } }),
    },
    middleware: (getDefault) => getDefault({ serializableCheck: false }).concat(api.middleware),
  });

const json = (body: unknown, contentType: string) =>
  new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': contentType } });

const geojson = {
  type: 'FeatureCollection',
  features: [{ type: 'Feature', properties: { role: 'row' }, geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] } }],
};

describe('getFieldRowPlan', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('returns the current plan as an object even though the export is application/geo+json', async () => {
    const urls: string[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (request: Request) => {
        urls.push(request.url);
        return request.url.endsWith('/geojson')
          ? json(geojson, 'application/geo+json; charset=utf-8')
          : json([{ row_plan_id: 'plan-1', location_id: 'field', source: 'in_app' }], 'application/json');
      }),
    );
    const store = makeStore();
    const result = await store.dispatch(
      rowPlanApi.endpoints.getFieldRowPlan.initiate({ farm_id: 'farm', location_id: 'field' }),
    );
    expect(result.error).toBeUndefined();
    expect(typeof result.data).toBe('object');
    expect(result.data?.features).toHaveLength(1);
    expect(urls[0]).toContain('/row_plan/farm/farm?location_id=field');
    expect(urls[1]).toContain('/row_plan/plan-1/geojson');
  });

  it('returns null when the field has no current plan', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => json([], 'application/json')));
    const store = makeStore();
    const result = await store.dispatch(
      rowPlanApi.endpoints.getFieldRowPlan.initiate({ farm_id: 'farm', location_id: 'field' }),
    );
    expect(result.data).toBeNull();
  });
});
