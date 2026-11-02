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

// Adds the selected soil WMS as a raster overlay below the farm locations, and keeps its opacity
// in sync. Passing a null layer removes the overlay.

import { useEffect } from 'react';
import { buildSoilSource, SOIL_LAYER_ID, SOIL_SOURCE_ID } from '../../util/soilLayers';

// Draw the overlay under the first of these layers that exists, so locations stay on top.
const FIRST_LOCATION_LAYER = 'areas-fill';

const removeOverlay = (map) => {
  if (map.getLayer?.(SOIL_LAYER_ID)) map.removeLayer(SOIL_LAYER_ID);
  if (map.getSource?.(SOIL_SOURCE_ID)) map.removeSource(SOIL_SOURCE_ID);
};

export default function useSoilLayers({ map, layer, opacity }) {
  useEffect(() => {
    if (!map) return;
    removeOverlay(map);
    if (!layer) return;
    map.addSource(SOIL_SOURCE_ID, buildSoilSource(layer));
    map.addLayer(
      {
        id: SOIL_LAYER_ID,
        type: 'raster',
        source: SOIL_SOURCE_ID,
        paint: { 'raster-opacity': opacity },
      },
      map.getLayer?.(FIRST_LOCATION_LAYER) ? FIRST_LOCATION_LAYER : undefined,
    );
    return () => {
      // The map may already have been removed when the page unmounts.
      try {
        removeOverlay(map);
      } catch {
        /* map is gone */
      }
    };
    // Opacity changes are handled below, without rebuilding the source.
  }, [map, layer]);

  useEffect(() => {
    if (!map || !layer || !map.getLayer?.(SOIL_LAYER_ID)) return;
    map.setPaintProperty(SOIL_LAYER_ID, 'raster-opacity', opacity);
  }, [map, layer, opacity]);
}
