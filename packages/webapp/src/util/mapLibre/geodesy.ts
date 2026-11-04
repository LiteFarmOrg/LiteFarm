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

// Spherical geometry for drawn shapes. Uses the same earth radius as google.maps.geometry.spherical
// so areas and lengths stored from the MapLibre map are comparable with those from the Google map.

export type LatLng = { lat: number; lng: number };

export const EARTH_RADIUS_M = 6378137;

const rad = (degrees: number) => (degrees * Math.PI) / 180;
const deg = (radians: number) => (radians * 180) / Math.PI;

export const distanceBetween = (a: LatLng, b: LatLng): number => {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
};

/** Length of an open path in metres. */
export const pathLength = (path: LatLng[]): number =>
  path.slice(1).reduce((sum, point, i) => sum + distanceBetween(path[i], point), 0);

/** Perimeter of a ring given without the repeated closing vertex. */
export const ringPerimeter = (ring: LatLng[]): number =>
  ring.length < 2 ? 0 : pathLength(ring) + distanceBetween(ring[ring.length - 1], ring[0]);

/** Area of a ring in square metres, given without the repeated closing vertex. */
export const ringArea = (ring: LatLng[]): number => {
  if (ring.length < 3) return 0;
  let total = 0;
  for (let i = 0; i < ring.length; i++) {
    const p1 = ring[i];
    const p2 = ring[(i + 1) % ring.length];
    total += (rad(p2.lng) - rad(p1.lng)) * (2 + Math.sin(rad(p1.lat)) + Math.sin(rad(p2.lat)));
  }
  return Math.abs((total * EARTH_RADIUS_M ** 2) / 2);
};

/** Initial bearing from a to b in degrees, in the range [-180, 180). */
export const computeHeading = (a: LatLng, b: LatLng): number => {
  const dLng = rad(b.lng - a.lng);
  const y = Math.sin(dLng) * Math.cos(rad(b.lat));
  const x =
    Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) -
    Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(dLng);
  const heading = deg(Math.atan2(y, x));
  return ((((heading + 180) % 360) + 360) % 360) - 180;
};

/** Point reached from `from` after travelling `distance` metres on `heading` degrees. */
export const computeOffset = (from: LatLng, distance: number, heading: number): LatLng => {
  const d = distance / EARTH_RADIUS_M;
  const h = rad(heading);
  const lat1 = rad(from.lat);
  const lng1 = rad(from.lng);
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(h));
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(h) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(lat2),
    );
  return { lat: deg(lat2), lng: ((deg(lng2) + 540) % 360) - 180 };
};

/**
 * Adapter so the existing `polygonPath` helper (written against google.maps) can run without Google:
 * it only needs `maps.geometry.spherical` and points that expose lat() and lng().
 */
export class PointLike {
  constructor(
    private latitude: number,
    private longitude: number,
  ) {}
  lat() {
    return this.latitude;
  }
  lng() {
    return this.longitude;
  }
}

export const sphericalShim = {
  geometry: {
    spherical: {
      computeHeading: (a: PointLike, b: PointLike) =>
        computeHeading({ lat: a.lat(), lng: a.lng() }, { lat: b.lat(), lng: b.lng() }),
      computeOffset: (from: PointLike, distance: number, heading: number) => {
        const p = computeOffset({ lat: from.lat(), lng: from.lng() }, distance, heading);
        return new PointLike(p.lat, p.lng);
      },
    },
  },
};

/** Closed-polygon ring around a line of the given width in metres, matching the Google map's width polygon. */
export const widthRing = (
  line: LatLng[],
  width: number,
  polygonPath: (path: PointLike[], width: number, maps: unknown) => PointLike[],
): LatLng[] =>
  polygonPath(
    line.map((p) => new PointLike(p.lat, p.lng)),
    width,
    sphericalShim,
  ).map((p) => ({ lat: p.lat(), lng: p.lng() }));
