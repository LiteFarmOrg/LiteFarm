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

import { api } from './apiSlice';
import { rowPlanUrl } from '../../apiConfig';

export interface RowPlanSummary {
  row_plan_id: string;
  location_id: string;
  source: 'in_app' | 'robot';
  created_at: string;
}

export interface ImportRowPlanArgs {
  farm_id: string;
  location_id: string;
  geojson: object;
}

export interface ImportRowPlanResponse {
  row_plan: RowPlanSummary;
  row_count: number;
  warnings: string[];
}

export interface GetFieldRowPlanArgs {
  farm_id: string;
  location_id: string;
}

export interface FieldRowPlanGeoJSON {
  type: 'FeatureCollection';
  features: object[];
}

export const rowPlanApi = api.injectEndpoints({
  endpoints: (build) => ({
    // The field's current (not superseded) plan as map features, or null when it has none.
    getFieldRowPlan: build.query<FieldRowPlanGeoJSON | null, GetFieldRowPlanArgs>({
      async queryFn({ farm_id, location_id }, _api, _extraOptions, baseQuery) {
        const list = await baseQuery(`${rowPlanUrl}/farm/${farm_id}?location_id=${location_id}`);
        if (list.error) return { error: list.error };
        const [current] = list.data as RowPlanSummary[]; // newest first, superseded plans excluded
        if (!current) return { data: null };
        const geojson = await baseQuery(`${rowPlanUrl}/${current.row_plan_id}/geojson`);
        if (geojson.error) return { error: geojson.error };
        return { data: geojson.data as FieldRowPlanGeoJSON };
      },
    }),
    // Saves a plan for a field. The field's current in-app plan, if any, is superseded so the
    // field keeps one current plan. A robot plan is never superseded from here.
    importRowPlan: build.mutation<ImportRowPlanResponse, ImportRowPlanArgs>({
      async queryFn({ farm_id, location_id, geojson }, _api, _extraOptions, baseQuery) {
        const current = await baseQuery(`${rowPlanUrl}/farm/${farm_id}?location_id=${location_id}`);
        if (current.error) return { error: current.error };
        const previous = (current.data as RowPlanSummary[]).find(
          (plan) => plan.source === 'in_app',
        );
        const saved = await baseQuery({
          url: `${rowPlanUrl}/import`,
          method: 'POST',
          body: { location_id, geojson, supersedes_row_plan_id: previous?.row_plan_id },
        });
        if (saved.error) return { error: saved.error };
        return { data: saved.data as ImportRowPlanResponse };
      },
    }),
  }),
});

export const { useImportRowPlanMutation, useGetFieldRowPlanQuery } = rowPlanApi;
