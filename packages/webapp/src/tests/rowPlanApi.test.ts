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

describe('task rows', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reads the rows on a task', async () => {
    const rows = [
      { row_plan_id: 'plan-1', row_id: 'r1', row_number: 12, frag: 0, status: 'pending' },
    ];
    const urls: string[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (request: Request) => {
        urls.push(request.url);
        return json(rows, 'application/json');
      }),
    );
    const store = makeStore();
    const result = await store.dispatch(rowPlanApi.endpoints.getTaskRows.initiate({ task_id: 7 }));
    expect(result.data).toEqual(rows);
    expect(urls[0]).toContain('/row_plan/task/7/rows');
  });

  it('puts the row numbers on a task and reads them again afterwards', async () => {
    const calls: { method: string; url: string; body: string }[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (request: Request) => {
        calls.push({
          method: request.method,
          url: request.url,
          body: await request.clone().text(),
        });
        return request.method === 'PUT'
          ? json({ task_id: 7, row_plan_id: 'plan-1', row_numbers: [12, 13] }, 'application/json')
          : json([], 'application/json');
      }),
    );
    const store = makeStore();
    // Subscribed, so the save has a cached read to invalidate.
    const subscription = store.dispatch(rowPlanApi.endpoints.getTaskRows.initiate({ task_id: 7 }));
    await subscription;
    const saved = await store.dispatch(
      rowPlanApi.endpoints.setTaskRows.initiate({
        task_id: 7,
        row_plan_id: 'plan-1',
        row_numbers: [12, 13],
      }),
    );
    expect('error' in saved).toBe(false);
    const put = calls.find((call) => call.method === 'PUT');
    expect(put?.url).toContain('/row_plan/task/7/rows');
    expect(JSON.parse(put?.body ?? '{}')).toEqual({ row_plan_id: 'plan-1', row_numbers: [12, 13] });
    await vi.waitFor(() => expect(calls.filter((c) => c.method === 'GET')).toHaveLength(2));
    subscription.unsubscribe();
  });
});
