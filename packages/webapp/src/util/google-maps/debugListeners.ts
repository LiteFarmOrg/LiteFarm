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

import { Geometry, instanceTypes } from './cleanupListeners';

const userEvents = ['click', 'mouseover', 'mouseout'];
const mapEvents = [
  'set_at',
  'insert_at',
  'polygoncomplete',
  'polylinecomplete',
  'overlaycomplete',
  'visible_changed',
  'idle',
];

const eventTypes = [...userEvents, ...mapEvents];

/*---------------------------------
 Use the helper tools below to evaluate the listeners on your Google Map components

 These were written for <LocationPicker /> and subsequently extended for <Map /> to decide which objects needed to be cleared

 E.g. in <LocationPicker />

      if (gMaps && geometriesRef.current) {
        debugGeometryListeners(geometriesRef.current, gMaps);
      }
      if (gMaps && markerClusterRef.current) {
        debugInstanceListeners(markerClusterRef.current, gMaps, 'markerCluster');
      }
      if (gMaps && pinMarkerRef.current) {
        debugInstanceListeners(pinMarkerRef.current, gMaps, 'pinMarker');
      }

 ---------------------------------------------*/

/**
 * Logs the event listeners on each Geometry object contained within the provided collection.
 *
 * @param {{ [key: string]: Geometry }} geometries - An object mapping keys to Geometry objects.
 * @param {typeof google.maps} gMaps - The Google Maps API reference.
 */

export function debugGeometryListeners(
  geometries: Record<string, Geometry | Geometry[]>,
  gMaps: typeof google.maps,
) {
  Object.values(geometries).forEach((entry) => {
    const items = Array.isArray(entry) ? entry : [entry];

    items.forEach((geometry) => {
      const name = geometry.location?.name || geometry.location_name;
      const id = geometry.location?.location_id || geometry.location_id;
      const label = name || id;

      console.group(`\nEvaluating geometry "${label}"`);

      instanceTypes.forEach((instanceKey) => {
        if (geometry[instanceKey]) {
          console.log(`- Instance: ${instanceKey}`);

          userEvents.forEach((eventName) => {
            const hasListener = gMaps.event.hasListeners(geometry[instanceKey]!, eventName);
            console.log(`   - ${eventName}: ${hasListener}`);
          });
        }
      });
      console.groupEnd();
    });
  });
}

/**
 * Logs the event listeners attached to a specific instance object
 *
 * @param {google.maps.MVCObject} mapInstance - The map instance for which to log listeners.
 * @param {typeof google.maps} gMaps - The Google Maps API reference.
 * @param {string} [label='map instance'] - An optional label for identifying the instance.
 */
export function debugInstanceListeners(
  mapInstance: google.maps.MVCObject,
  gMaps: typeof google.maps,
  label: string = 'map instance',
) {
  console.log(`\nEvaluating ${label} listeners:`);

  eventTypes.forEach((eventName) => {
    const hasListener = gMaps.event.hasListeners(mapInstance, eventName);
    console.log(`- ${eventName}: ${hasListener}`);
  });
}
