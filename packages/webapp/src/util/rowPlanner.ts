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

// Row planning for the MapLibre farm map. The planner is the Sowbot/Feldfreund contour and swath planner
// (Agroecology-Lab/Sowbot), run in the browser by public/sowbot-planner/planner.worker.js. This file builds
// requests from LiteFarm locations, validates input, and turns results into GeoJSON.

import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import centroid from '@turf/centroid';
import { distanceBetween } from './mapLibre/geodesy';

export type Ring = [number, number][]; // [lat, lng]
export type PlanSettings = {
  toolWidth: number | string;
  angle: number | string;
  headland: number | string;
  snake: boolean;
  contour: boolean;
  gridResolution: number | string;
};
export type PlanRequest = {
  field: Ring;
  obs: Ring[];
  w: number;
  a: number;
  h: number;
  p: number;
  s: boolean;
  c: boolean;
  dr: number;
};
export type PlanResult = {
  rows: [number, number][][];
  tags: [number, number][];
  path?: [number, number][][];
  contour: boolean;
  asked: boolean;
};
export type PlannableArea = { id: string; name: string; type: string; ring: Ring };

export const PLANNABLE_AREA_TYPES = ['field', 'garden'];
// Areas inside a field that rows should go around.
export const OBSTACLE_AREA_TYPES = ['barn', 'greenhouse', 'residence', 'surface_water'];

export const DEFAULT_PLAN_SETTINGS: PlanSettings = {
  toolWidth: 5,
  angle: 0,
  headland: 0,
  snake: true,
  contour: false,
  gridResolution: 1,
};

const toNumber = (value: number | string): number => (value === '' ? NaN : Number(value));

const flatten = (byType: Record<string, any> = {}): any[] =>
  Object.values(byType).flatMap((value) => (Array.isArray(value) ? value : value ? [value] : []));

/** Ring of [lat, lng] without the closing duplicate, or null if there are fewer than 3 distinct points. */
export const areaToRing = (location: any): Ring | null => {
  const points = (location?.grid_points ?? [])
    .map((p: any) => [Number(p.lat), Number(p.lng)] as [number, number])
    .filter(([lat, lng]: [number, number]) => Number.isFinite(lat) && Number.isFinite(lng));
  const first = points[0];
  const last = points[points.length - 1];
  if (points.length > 1 && first[0] === last[0] && first[1] === last[1]) points.pop();
  return points.length >= 3 ? points : null;
};

const toLngLatPolygon = (ring: Ring) =>
  ({
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [[...ring, ring[0]].map(([lat, lng]) => [lng, lat])],
    },
  }) as any;

export const listPlannableAreas = (areas: Record<string, any> = {}): PlannableArea[] =>
  flatten(areas)
    .filter((location) => PLANNABLE_AREA_TYPES.includes(location?.type))
    .map((location) => ({ location, ring: areaToRing(location) }))
    .filter((entry): entry is { location: any; ring: Ring } => entry.ring !== null)
    .map(({ location, ring }) => ({
      id: location.location_id,
      name: location.name,
      type: location.type,
      ring,
    }));

/** Obstacle areas whose centre lies inside the field. */
export const findObstacles = (areas: Record<string, any> = {}, field: Ring): Ring[] => {
  const fieldPolygon = toLngLatPolygon(field);
  return flatten(areas)
    .filter((location) => OBSTACLE_AREA_TYPES.includes(location?.type))
    .map(areaToRing)
    .filter((ring): ring is Ring => ring !== null)
    .filter((ring) => booleanPointInPolygon(centroid(toLngLatPolygon(ring)), fieldPolygon));
};

/** Returns a key under FARM_MAP.ROW_PLANNER.ERRORS, or null when the settings are usable. */
export const validateSettings = (settings: PlanSettings, surveyCount: number): string | null => {
  if (!(toNumber(settings.toolWidth) >= 0.5)) return 'TOOL_WIDTH';
  if (!(toNumber(settings.headland) >= 0)) return 'NEGATIVE';
  if (settings.contour) {
    if (surveyCount < 3) return 'NEEDS_SURVEY';
    if (!(toNumber(settings.gridResolution) >= 0.25)) return 'GRID';
  } else if (!Number.isFinite(toNumber(settings.angle))) {
    return 'ANGLE';
  }
  return null;
};

/** Counts usable points in a survey CSV (lat, lon, alt columns). */
export const checkSurveyCsv = (text: string): { count: number; errorKey: string | null } => {
  const lines = text
    .replace(/^\uFEFF/, '')
    .trim()
    .split(/\r?\n/);
  const header = lines[0].split(',').map((h) => h.trim());
  const index = ['lat', 'lon', 'alt'].map((name) => header.indexOf(name));
  if (index.includes(-1)) return { count: 0, errorKey: 'SURVEY_COLUMNS' };
  const count = lines.slice(1).filter((line) => {
    const cells = line.split(',');
    return index.every((i) => cells[i]?.trim() !== '' && Number.isFinite(Number(cells[i])));
  }).length;
  return count < 3 ? { count, errorKey: 'SURVEY_POINTS' } : { count, errorKey: null };
};

export const buildPlanRequest = (
  field: Ring,
  obs: Ring[],
  settings: PlanSettings,
): PlanRequest => ({
  field,
  obs,
  w: toNumber(settings.toolWidth),
  a: settings.contour ? 0 : toNumber(settings.angle),
  h: toNumber(settings.headland),
  p: 0,
  s: settings.snake,
  c: settings.contour,
  dr: toNumber(settings.gridResolution),
});

const toLine = (points: [number, number][]) => ({
  type: 'LineString' as const,
  coordinates: points.map(([lat, lng]) => [lng, lat] as [number, number]),
});

/** Rows and connected path as GeoJSON for drawing on the map. */
export const planToFeatureCollection = (result: PlanResult | null) => ({
  type: 'FeatureCollection' as const,
  features: [
    ...(result?.rows ?? []).map((row, i) => ({
      type: 'Feature' as const,
      properties: { role: 'row', row: result!.tags[i]?.[0] ?? i, frag: result!.tags[i]?.[1] ?? 0 },
      geometry: toLine(row),
    })),
    ...(result?.path ?? []).map((path, i) => ({
      type: 'Feature' as const,
      properties: { role: 'path', pass: i },
      geometry: toLine(path),
    })),
  ],
});

const lengthMetres = (line: [number, number][]) =>
  line
    .slice(1)
    .reduce(
      (sum, [lat, lng], i) =>
        sum + distanceBetween({ lat: line[i][0], lng: line[i][1] }, { lat, lng }),
      0,
    );

export const summarisePlan = (result: PlanResult) => ({
  rows: result.rows.length,
  swathKm: result.rows.reduce((sum, row) => sum + lengthMetres(row), 0) / 1000,
  pathKm: (result.path ?? []).reduce((sum, path) => sum + lengthMetres(path), 0) / 1000,
  passes: result.path?.length ?? 0,
  contourUsed: result.contour,
  fellBack: result.asked && !result.contour,
});

const polygonFeature = (role: string, ring: Ring) => ({
  type: 'Feature' as const,
  properties: { role },
  geometry: {
    type: 'Polygon' as const,
    coordinates: [[...ring, ring[0]].map(([lat, lng]) => [lng, lat])],
  },
});

/** Same layout as the Sowbot web planner's swaths.geojson, so the file works with Sowbot tools. */
export const buildDownloadGeoJSON = (request: PlanRequest, result: PlanResult) => {
  const { features } = planToFeatureCollection(result);
  return {
    type: 'FeatureCollection' as const,
    properties: {
      version: 1,
      generator: 'litefarm-row-planner',
      origin: request.field[0],
      tool_width: request.w,
      angle: request.a,
      headland: request.h,
      snake: request.s,
      contour: result.contour,
    },
    features: [
      polygonFeature('field', request.field),
      ...request.obs.map((ring) => polygonFeature('obstacle', ring)),
      ...features,
    ],
  };
};

type PlannerStatus = 'LOADING_PYTHON' | 'LOADING_CONTOUR' | 'PLANNING';

export const PLANNER_WORKER_URL = `${import.meta.env.BASE_URL ?? '/'}sowbot-planner/planner.worker.js`;

/** One lazily created worker. Callers must not overlap plan() calls (the UI disables Plan while busy). */
export const createPlannerClient = (
  makeWorker: () => Worker = () => new Worker(PLANNER_WORKER_URL),
) => {
  let worker: Worker | null = null;
  let counter = 0;
  const get = () => (worker ??= makeWorker());

  return {
    plan(
      req: PlanRequest,
      csv: string,
      onStatus: (status: PlannerStatus) => void = () => {},
    ): Promise<PlanResult> {
      const id = ++counter;
      const w = get();
      return new Promise((resolve, reject) => {
        const handler = ({ data }: MessageEvent) => {
          if (data.id !== id) return;
          if (data.status) return onStatus(data.status);
          w.removeEventListener('message', handler);
          if (data.ok) resolve(data.result);
          else reject(new Error(data.error));
        };
        w.addEventListener('message', handler);
        w.postMessage({ id, req, csv });
      });
    },
    terminate() {
      worker?.terminate();
      worker = null;
    },
  };
};
