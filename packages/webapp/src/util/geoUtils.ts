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
import { centroid } from '@turf/centroid';
import { sector } from '@turf/sector';
import { FlattenedInternalArea } from '../hooks/location/types';
import { Point as ApiPoint, GridPoint } from '../store/api/types';

export type Point = GridPoint;

export type PointLocation = ApiPoint;

// turf expects [lng, lat] for all points and polygon coordinates
type TurfPoint = [lng: number, lat: number];

export const getAreaLocationsContainingPoint = (
  areaLocations: FlattenedInternalArea[],
  pt: Point,
): FlattenedInternalArea[] => {
  if (!areaLocations.length) {
    return [];
  }

  const filteredAreas: FlattenedInternalArea[] = [];

  const locationPoint = safeCreatePoint([pt.lng, pt.lat]);

  if (!locationPoint) {
    return [];
  }

  for (const area of areaLocations) {
    const coordinates = area.grid_points.map((p: Point): TurfPoint => [p.lng, p.lat]);

    const areaPolygon = safeCreatePolygon(coordinates);

    if (!areaPolygon) {
      continue;
    }

    const pointIsInArea = booleanPointInPolygon(locationPoint, areaPolygon);

    if (pointIsInArea) {
      filteredAreas.push(area);
    }
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

  const coordinates = gridPoints.map((p: Point): TurfPoint => [p.lng, p.lat]);
  const areaPolygon = safeCreatePolygon(coordinates);

  if (!areaPolygon) {
    return [];
  }

  for (const location of pointLocations) {
    const locationPoint = safeCreatePoint([location.point.lng, location.point.lat]);

    if (!locationPoint) {
      continue;
    }

    const pointIsInArea = booleanPointInPolygon(locationPoint, areaPolygon);

    if (pointIsInArea) {
      filteredPoints.push(location);
    }
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

const safeCreatePoint = (coordinates: TurfPoint): ReturnType<typeof point> | null => {
  try {
    return point(coordinates);
  } catch (error) {
    // turf will throw an error if the point is invalid
    console.error(error);
    return null;
  }
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

export const getCentroidOfPolygon = (gridPoints: Point[]): Point | null => {
  const coordinates = gridPoints.map((p: Point): TurfPoint => [p.lng, p.lat]);
  const areaPolygon = safeCreatePolygon(coordinates);

  if (!areaPolygon) {
    return areaPolygon;
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

/**
 * Creates coordinates for a circular sector (pie slice)
 *
 * @param center - Center point of the circle
 * @param radius - Radius in meters
 * @param startAngle - Start angle in mathematical degrees (0 = east, 90 = north, etc.)
 * @param endAngle - End angle in degrees, moving clockwise from start angle
 * @returns Array of points representing the sector, including the center point
 */
export const createSectorCoordinates = (
  center: Point,
  radius: number,
  startAngle: number,
  endAngle: number,
): Point[] => {
  const centerPoint = [center.lng, center.lat];

  // Turf sector expects radius in kilometers
  const radiusKm = radius / 1000;

  // Turf uses 0 = north, 90 = east so we need to adjust angles from standard mathematical angles
  // Negative angles are permissible in turf.sector()
  const turfStartAngle = (90 - startAngle) % 360;
  const turfEndAngle = (90 - endAngle) % 360;

  const sectorFeature = sector(centerPoint, radiusKm, turfStartAngle, turfEndAngle, { steps: 32 });

  // Extract the outer (only) ring of the polygon and convert to {lat,lng} format
  const coords = sectorFeature.geometry.coordinates[0].map((coord) => ({
    lat: coord[1],
    lng: coord[0],
  }));

  return coords;
};
