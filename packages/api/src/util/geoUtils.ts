/*
 *  Copyright 2025 LiteFarm.org
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

import { polygon } from '@turf/helpers';
import { centroid } from '@turf/centroid';
import { area } from '@turf/area';

export interface Point {
  lat: number;
  lng: number;
}

// turf expects [lng, lat] for all points and polygon coordinates
type TurfPoint = [lng: number, lat: number];

export const getCentroidOfPolygon = (gridPoints: Point[]): Point | null => {
  const coordinates = gridPoints.map((p: Point): TurfPoint => [p.lng, p.lat]);
  const areaPolygon = safeCreatePolygon(coordinates);

  if (!areaPolygon) {
    return null;
  }

  try {
    const centroidFeature = centroid(areaPolygon);
    const [lng, lat] = centroidFeature.geometry.coordinates;
    return { lat, lng };
  } catch (err) {
    console.error('Error computing centroid:', err);
    return null;
  }
};

export const getAreaOfPolygon = (gridPoints: Point[]): number | null => {
  const coordinates = gridPoints.map((p: Point): TurfPoint => [p.lng, p.lat]);
  const areaPolygon = safeCreatePolygon(coordinates);

  if (!areaPolygon) {
    return null;
  }

  try {
    return area(areaPolygon);
  } catch (err) {
    console.error('Error computing area:', err);
    return null;
  }
};

// turf requires that all polygons be closed (first and last point equivalent)
const closePolygon = (coordinates: TurfPoint[]): TurfPoint[] => {
  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];

  const isClosed = first[0] === last[0] && first[1] === last[1];

  return isClosed ? coordinates : [...coordinates, first];
};

const safeCreatePolygon = (coordinates: TurfPoint[]): ReturnType<typeof polygon> | null => {
  try {
    // for necessity of wrapping coordinates in an array, see
    // https://github.com/Turfjs/turf/issues/1583
    return polygon([closePolygon(coordinates)]);
  } catch (error) {
    // turf will throw an error if the polygon is invalid
    console.error(error);
    return null;
  }
};
