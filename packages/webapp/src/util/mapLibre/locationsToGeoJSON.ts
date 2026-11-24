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

import buffer from '@turf/buffer';
import centroid from '@turf/centroid';

export type LatLng = { lat: number; lng: number };
export type Position = [number, number];

export type MapFeature = {
  type: 'Feature';
  properties: Record<string, any>;
  geometry:
    | { type: 'Polygon'; coordinates: Position[][] }
    | { type: 'LineString'; coordinates: Position[] }
    | { type: 'Point'; coordinates: Position };
};
export type MapFeatureCollection = { type: 'FeatureCollection'; features: MapFeature[] };

export type MapLabel = { id: string; name: string; type: string; lngLat: Position };
export type Bounds = [Position, Position];

type LocationsByFigureAndType = Record<string, any[] | any>;
export type LocationAssets = {
  area?: LocationsByFigureAndType;
  line?: LocationsByFigureAndType;
  point?: LocationsByFigureAndType;
};

// Area types drawn as an outline only (see isNoFillArea in containers/Map/constants).
const NO_FILL_AREA_TYPES = ['farm_site_boundary'];
// Line types drawn with a real-world width around the centre line.
const WIDTH_LINE_TYPES = ['watercourse', 'buffer_zone'];

export const toPosition = ({ lat, lng }: LatLng): Position => [Number(lng), Number(lat)];

const flatten = (byType: LocationsByFigureAndType = {}): any[] =>
  Object.values(byType).flatMap((value) => (Array.isArray(value) ? value : value ? [value] : []));

const baseProperties = (location: any, figure: string) => ({
  location_id: location.location_id,
  name: location.name,
  type: location.type,
  asset: figure,
  isAddonSensor: !!location.isAddonSensor,
});

const closedRing = (points: LatLng[]): Position[] => {
  const ring = points.map(toPosition);
  const [first, last] = [ring[0], ring[ring.length - 1]];
  if (first && last && (first[0] !== last[0] || first[1] !== last[1])) ring.push([...first]);
  return ring;
};

export const areaToFeature = (location: any): MapFeature | null => {
  if (!location?.grid_points || location.grid_points.length < 3) return null;
  return {
    type: 'Feature',
    properties: baseProperties(location, 'area'),
    geometry: { type: 'Polygon', coordinates: [closedRing(location.grid_points)] },
  };
};

export const lineToFeature = (location: any): MapFeature | null => {
  if (!location?.line_points || location.line_points.length < 2) return null;
  return {
    type: 'Feature',
    properties: baseProperties(location, 'line'),
    geometry: { type: 'LineString', coordinates: location.line_points.map(toPosition) },
  };
};

/** Watercourses add their buffer width to the line width, matching drawLine in useMapAssetRenderer. */
export const lineWidthMetres = (location: any): number =>
  location.type === 'watercourse'
    ? Number(location.buffer_width) + Number(location.width)
    : Number(location.width);

export const lineToBufferFeature = (location: any): MapFeature | null => {
  if (!WIDTH_LINE_TYPES.includes(location?.type)) return null;
  const line = lineToFeature(location);
  const width = lineWidthMetres(location);
  if (!line || !Number.isFinite(width) || width <= 0) return null;
  const buffered = buffer(line as any, width / 2, { units: 'meters' }) as any;
  if (!buffered?.geometry) return null;
  return { type: 'Feature', properties: line.properties, geometry: buffered.geometry };
};

export const pointToFeature = (location: any): MapFeature | null => {
  if (!location?.point) return null;
  return {
    type: 'Feature',
    properties: baseProperties(location, 'point'),
    geometry: { type: 'Point', coordinates: toPosition(location.point) },
  };
};

const collection = (features: (MapFeature | null)[]): MapFeatureCollection => ({
  type: 'FeatureCollection',
  features: features.filter((f): f is MapFeature => f !== null),
});

const extend = (bounds: Bounds | null, [lng, lat]: Position): Bounds =>
  bounds
    ? [
        [Math.min(bounds[0][0], lng), Math.min(bounds[0][1], lat)],
        [Math.max(bounds[1][0], lng), Math.max(bounds[1][1], lat)],
      ]
    : [
        [lng, lat],
        [lng, lat],
      ];

export const boundsOf = (collections: MapFeatureCollection[]): Bounds | null => {
  let bounds: Bounds | null = null;
  const visit = (coords: any) => {
    if (typeof coords[0] === 'number') bounds = extend(bounds, coords as Position);
    else coords.forEach(visit);
  };
  collections.forEach((c) => c.features.forEach((f) => visit(f.geometry.coordinates)));
  return bounds;
};

export type LocationCollections = {
  areas: MapFeatureCollection; // filled polygons
  lines: MapFeatureCollection; // centre lines, plus outline-only areas as closed lines
  lineBuffers: MapFeatureCollection; // width polygons for watercourses and buffer zones
  points: MapFeatureCollection;
  labels: MapLabel[]; // area name labels at the polygon centroid
  bounds: Bounds | null;
};

export const buildLocationCollections = (assets: LocationAssets): LocationCollections => {
  const areaLocations = flatten(assets.area);
  const lineLocations = flatten(assets.line);
  const pointLocations = flatten(assets.point);

  const filledAreas = areaLocations.filter((l) => !NO_FILL_AREA_TYPES.includes(l.type));
  const outlineAreas = areaLocations.filter((l) => NO_FILL_AREA_TYPES.includes(l.type));

  const areas = collection(filledAreas.map(areaToFeature));
  const lines = collection([
    ...lineLocations.map(lineToFeature),
    ...outlineAreas.map((l) =>
      l.grid_points?.length > 1
        ? lineToFeature({ ...l, line_points: [...l.grid_points, l.grid_points[0]] })
        : null,
    ),
  ]);
  // Outline-only areas are still area assets for selection, so keep that on the feature.
  lines.features.forEach((f) => {
    if (NO_FILL_AREA_TYPES.includes(f.properties.type)) f.properties.asset = 'area';
  });
  const lineBuffers = collection(lineLocations.map(lineToBufferFeature));
  const points = collection(pointLocations.map(pointToFeature));

  const labels: MapLabel[] = areas.features.map((f) => ({
    id: f.properties.location_id,
    name: f.properties.name,
    type: f.properties.type,
    lngLat: centroid(f as any).geometry.coordinates as Position,
  }));

  return {
    areas,
    lines,
    lineBuffers,
    points,
    labels,
    bounds: boundsOf([areas, lines, lineBuffers, points]),
  };
};
