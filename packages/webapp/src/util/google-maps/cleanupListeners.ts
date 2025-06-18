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

export const instanceTypes = ['polygon', 'marker', 'polyline', 'circle'] as const;

export interface Geometry {
  polygon?: google.maps.Polygon;
  marker?: google.maps.Marker;
  polyline?: google.maps.Polyline;
  circle?: google.maps.Circle;

  // Location data shape differs between Map and LocationPicker
  location?: { name?: string; location_id: string };
  location_name?: string;
  location_id?: string;
}

/**
 * Clears all event listeners from a given Google Maps instance object.
 *
 * @param {google.maps.MVCObject} instance - The instance from which to clear listeners.
 * @param {typeof google.maps} gMaps - The Google Maps API reference.
 */
export function cleanupInstanceListeners(
  instance: google.maps.MVCObject,
  gMaps: typeof google.maps,
) {
  gMaps.event.clearInstanceListeners(instance);
}

/**
 * Iterates over a set of Geometry entries—each of which may be a single Geometry
 * or an array of Geometry objects—and clears all event listeners on each
 * contained Google Maps overlay (polygon, marker, polyline, circle).
 *
 * @param {Record<string, Geometry | Geometry[]>} geometries
 *   An object mapping keys (either location IDs or location types) to a single Geometry or an array of Geometry items.
 * @param {typeof google.maps} gMaps
 *   The Google Maps API reference.
 */
export function cleanupGeometryListeners(
  geometries: Record<string, Geometry | Geometry[]>,
  gMaps: typeof google.maps,
) {
  Object.values(geometries).forEach((entry) => {
    const items = Array.isArray(entry) ? entry : [entry];
    items.forEach((geometry) => {
      instanceTypes.forEach((instanceKey) => {
        if (geometry[instanceKey]) {
          cleanupInstanceListeners(geometry[instanceKey], gMaps);
        }
      });
    });
  });
}
