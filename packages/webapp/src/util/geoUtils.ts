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

export interface Location {
  location_id: string;
  grid_points: Point[];
}

/**
 * Filters locations that contain the specified point.
 *
 * @param locations - array of locations to filter
 * @param pt - The point to check within the locations
 * @returns filtered array of locations containing the point
 */

export const getLocationsContainingPoint = (locations: Location[], pt: Point): Location[] => {
  if (!locations.length) {
    return [];
  }

  const filteredLocations: Location[] = [];

  for (const currentLocation of locations) {
    try {
      // turf expects [lng, lat] for points and polygon coordinates
      const coordinates = currentLocation.grid_points.map((p: Point) => [p.lng, p.lat]);

      // polygon must be closed (first and last point equivalent)
      const isClosed =
        coordinates[0][0] === coordinates[coordinates.length - 1][0] &&
        coordinates[0][1] === coordinates[coordinates.length - 1][1];

      const closedCoordinates = isClosed ? coordinates : [...coordinates, coordinates[0]];

      const pointIsInArea = booleanPointInPolygon(
        point([pt.lng, pt.lat]),
        polygon([closedCoordinates]),
      );

      if (pointIsInArea) {
        filteredLocations.push(currentLocation);
      }
    } catch (error) {
      // turf can throw an error if the polygon is invalid
      console.error(`Error processing location_id: ${currentLocation.location_id}`, error);
    }
  }

  return filteredLocations;
};
