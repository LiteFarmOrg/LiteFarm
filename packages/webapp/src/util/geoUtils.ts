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

import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon';
import { point, polygon } from '@turf/helpers';

export interface Point {
  lat: number;
  lng: number;
}

export interface PointLocation {
  point: Point;
}

export interface AreaLocation {
  grid_points: Point[];
}

// turf expects [lng, lat] for all points and polygon coordinates
type TurfPoint = [lng: number, lat: number];

export const getAreaLocationsContainingPoint = (
  areaLocations: AreaLocation[],
  pt: Point,
): AreaLocation[] => {
  if (!areaLocations.length) {
    return [];
  }

  const filteredAreas: AreaLocation[] = [];

  try {
    const locationPoint = point([pt.lng, pt.lat]);

    for (const area of areaLocations) {
      const coordinates = area.grid_points.map((p: Point): TurfPoint => [p.lng, p.lat]);

      // for necessity of wrapping coordinates in an array, see
      // https://github.com/Turfjs/turf/issues/1583
      const areaPolygon = polygon([closePolygon(coordinates)]);

      const pointIsInArea = booleanPointInPolygon(locationPoint, areaPolygon);

      if (pointIsInArea) {
        filteredAreas.push(area);
      }
    }
  } catch (error) {
    // turf will throw an error if any point or polygon is invalid
    console.error(error);
  }

  return filteredAreas;
};

export const getPointLocationsWithinPolygon = (
  pointLocations: PointLocation[],
  gridPoints: Point[],
): PointLocation[] => {
  if (!pointLocations.length) {
    return [];
  }
  const filteredPoints: PointLocation[] = [];

  try {
    const coordinates = gridPoints.map((p: Point): TurfPoint => [p.lng, p.lat]);
    const areaPolygon = polygon([closePolygon(coordinates)]);

    for (const location of pointLocations) {
      const locationPoint = point([location.point.lng, location.point.lat]);
      const pointIsInArea = booleanPointInPolygon(locationPoint, areaPolygon);

      if (pointIsInArea) {
        filteredPoints.push(location);
      }
    }
  } catch (error) {
    // turf will throw an error if any point or polygon is invalid
    console.error(error);
  }

  return filteredPoints;
};

// turf requires that all polygons be closed (first and last point equivalent)
const closePolygon = (coordinates: TurfPoint[]): TurfPoint[] => {
  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];

  const isClosed = first[0] === last[0] && first[1] === last[1];

  return isClosed ? coordinates : [...coordinates, first];
};
