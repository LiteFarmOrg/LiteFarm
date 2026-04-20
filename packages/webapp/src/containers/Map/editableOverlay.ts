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

import { isArea, isLine, isPoint } from './constants';

export type OverlayMode = 'polygon' | 'polyline' | 'marker';

export interface LatLngLiteral {
  lat: number;
  lng: number;
}

export interface SavedAreaLocation {
  type: string;
  grid_points: LatLngLiteral[];
}

export interface SavedLineLocation {
  type: string;
  line_points: LatLngLiteral[];
  width: number;
}

export interface SavedPointLocation {
  type: string;
  point: LatLngLiteral;
}

export type SavedLocation = SavedAreaLocation | SavedLineLocation | SavedPointLocation;

export interface MountEditableOverlayOptions {
  polygonOptions?: google.maps.PolygonOptions;
  polylineOptions?: google.maps.PolylineOptions;
  markerOptions?: google.maps.MarkerOptions;
  onVertexChange: () => void;
}

export interface MountedEditableOverlay {
  type: OverlayMode;
  overlay: google.maps.Polygon | google.maps.Polyline | google.maps.Marker;
  dispose: () => void;
  bounds: google.maps.LatLngBounds;
}

/**
 * Attaches change-detection listeners for an editable overlay. For polygon /
 * polyline this hooks `set_at` and `insert_at` on the overlay's path so vertex
 * drags and midpoint insertions both fire. For markers it hooks `dragend` on
 * the marker itself. The returned array lets the caller detach cleanly.
 */
export function attachChangeListeners(
  maps: typeof google.maps,
  overlay: google.maps.Polygon | google.maps.Polyline | google.maps.Marker,
  mode: OverlayMode,
  onChange: () => void,
): google.maps.MapsEventListener[] {
  const listeners: google.maps.MapsEventListener[] = [];
  if (mode === 'polygon' || mode === 'polyline') {
    const path = (overlay as google.maps.Polygon | google.maps.Polyline).getPath();
    listeners.push(maps.event.addListener(path, 'set_at', onChange));
    listeners.push(maps.event.addListener(path, 'insert_at', onChange));
  } else if (mode === 'marker') {
    listeners.push(maps.event.addListener(overlay, 'dragend', onChange));
  }
  return listeners;
}

const computeBounds = (
  maps: typeof google.maps,
  coords: LatLngLiteral[],
): google.maps.LatLngBounds => {
  const bounds = new maps.LatLngBounds();
  coords.forEach(({ lat, lng }) => bounds.extend(new maps.LatLng(lat, lng)));
  return bounds;
};

/**
 * Reconstructs an editable overlay from a previously-saved location (the
 * shape the user clicks "back" from during create/edit). Also used as the
 * natural integration point for the future "edit saved location boundaries"
 * feature — once a UI entry point exists, calling `mountEditableOverlay` on
 * a saved record is how the overlay gets put back on the map for editing.
 *
 * Returns the mounted overlay plus a `dispose` that cleans up everything this
 * module attached (the overlay itself and its change listeners) and a
 * `bounds` the caller can feed to `map.fitBounds`. The caller is responsible
 * for wiring the overlay into downstream state (e.g. `setDrawingToCheck`).
 */
export function mountEditableOverlay(
  map: google.maps.Map,
  maps: typeof google.maps,
  saved: SavedLocation,
  opts: MountEditableOverlayOptions,
): MountedEditableOverlay | null {
  if (isArea(saved.type)) {
    const { grid_points } = saved as SavedAreaLocation;
    const polygon = new maps.Polygon({
      paths: grid_points,
      ...opts.polygonOptions,
    });
    polygon.setMap(map);
    const listeners = attachChangeListeners(maps, polygon, 'polygon', opts.onVertexChange);
    return {
      type: 'polygon',
      overlay: polygon,
      bounds: computeBounds(maps, grid_points),
      dispose: () => {
        listeners.forEach((listener) => listener.remove());
        polygon.setMap(null);
      },
    };
  }

  if (isLine(saved.type)) {
    const { line_points } = saved as SavedLineLocation;
    const polyline = new maps.Polyline({
      path: line_points,
      ...opts.polylineOptions,
    });
    polyline.setMap(map);
    const listeners = attachChangeListeners(maps, polyline, 'polyline', opts.onVertexChange);
    return {
      type: 'polyline',
      overlay: polyline,
      bounds: computeBounds(maps, line_points),
      dispose: () => {
        listeners.forEach((listener) => listener.remove());
        polyline.setMap(null);
      },
    };
  }

  if (isPoint(saved.type)) {
    const { point } = saved as SavedPointLocation;
    const marker = new maps.Marker({
      position: point,
      ...opts.markerOptions,
    });
    marker.setMap(map);
    const listeners = attachChangeListeners(maps, marker, 'marker', opts.onVertexChange);
    return {
      type: 'marker',
      overlay: marker,
      bounds: computeBounds(maps, [point]),
      dispose: () => {
        listeners.forEach((listener) => listener.remove());
        marker.setMap(null);
      },
    };
  }

  return null;
}
