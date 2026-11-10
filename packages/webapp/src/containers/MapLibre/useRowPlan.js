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

// Draws a planned set of rows (and the connected path) on top of the map. Passing null removes it.

import { useEffect } from 'react';

export const ROW_PLAN_SOURCE_ID = 'row-plan';
export const ROW_PLAN_ROWS_LAYER_ID = 'row-plan-rows';
export const ROW_PLAN_PATH_LAYER_ID = 'row-plan-path';

const removePlan = (map) => {
  [ROW_PLAN_PATH_LAYER_ID, ROW_PLAN_ROWS_LAYER_ID].forEach((id) => {
    if (map.getLayer?.(id)) map.removeLayer(id);
  });
  if (map.getSource?.(ROW_PLAN_SOURCE_ID)) map.removeSource(ROW_PLAN_SOURCE_ID);
};

export default function useRowPlan({ map, collection }) {
  useEffect(() => {
    if (!map) return;
    removePlan(map);
    if (!collection?.features?.length) return;
    map.addSource(ROW_PLAN_SOURCE_ID, { type: 'geojson', data: collection });
    const hasPath = collection.features.some((f) => f.properties?.role === 'path');
    map.addLayer({
      id: ROW_PLAN_ROWS_LAYER_ID,
      type: 'line',
      source: ROW_PLAN_SOURCE_ID,
      filter: ['==', ['get', 'role'], 'row'],
      paint: {
        'line-color': '#00aaff',
        'line-width': hasPath ? 1 : 2,
        'line-opacity': hasPath ? 0.5 : 1,
      },
    });
    if (hasPath) {
      map.addLayer({
        id: ROW_PLAN_PATH_LAYER_ID,
        type: 'line',
        source: ROW_PLAN_SOURCE_ID,
        filter: ['==', ['get', 'role'], 'path'],
        paint: { 'line-color': '#ff8800', 'line-width': 2 },
      });
    }
    return () => {
      // The map may already have been removed when the page unmounts.
      try {
        removePlan(map);
      } catch {
        /* map is gone */
      }
    };
  }, [map, collection]);
}
