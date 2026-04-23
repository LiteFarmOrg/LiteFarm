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

import type { GeoJSONStoreFeatures, GeoJSONStoreGeometries } from 'terra-draw';
import { getDrawingOptions } from '../../containers/Map/useDrawingManager';

type PolygonOverlay = { type: 'polygon'; overlay: google.maps.Polygon };
type PolylineOverlay = { type: 'polyline'; overlay: google.maps.Polyline };
type MarkerOverlay = { type: 'marker'; overlay: google.maps.Marker };

export type DrawnOverlay = PolygonOverlay | PolylineOverlay | MarkerOverlay;

const toLatLng = ([lng, lat]: [number, number] | number[]): google.maps.LatLngLiteral => ({
  lat,
  lng,
});

export const terraFeatureToOverlay = (
  feature: GeoJSONStoreFeatures<GeoJSONStoreGeometries>,
  map: google.maps.Map,
  maps: typeof google.maps,
  locationType: string,
): DrawnOverlay | null => {
  const { geometry } = feature;
  const drawingOptions = getDrawingOptions(locationType);

  if (geometry.type === 'Polygon' && drawingOptions?.polygonOptions) {
    const ring = geometry.coordinates[0];
    const paths = ring.slice(0, -1).map(toLatLng);
    const overlay = new maps.Polygon({
      paths,
      map,
      ...drawingOptions.polygonOptions,
    });
    return { type: 'polygon', overlay };
  }

  if (geometry.type === 'LineString' && drawingOptions?.polylineOptions) {
    const path = geometry.coordinates.map(toLatLng);
    const overlay = new maps.Polyline({
      path,
      map,
      ...drawingOptions.polylineOptions,
    });
    return { type: 'polyline', overlay };
  }

  if (geometry.type === 'Point' && drawingOptions?.markerOptions) {
    const position = toLatLng(geometry.coordinates);
    const overlay = new maps.Marker({
      position,
      map,
      ...drawingOptions.markerOptions,
    });
    return { type: 'marker', overlay };
  }

  return null;
};
