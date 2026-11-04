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

/**
 * Soil overlay layers for the MapLibre farm map (VITE_MAP_PROVIDER=maplibre).
 *
 * Every layer is a WMS served as raster tiles through MapLibre's {bbox-epsg-3857} token, so each
 * server must offer EPSG:3857 and send CORS headers. The endpoints below come from the providers'
 * public documentation and have NOT been tested from this repo: check GetCapabilities for the
 * layer names and CRS before relying on them. Hutton's endpoint was only published as http://,
 * so its https URL is an assumption. Override any base URL with the VITE_SOIL_* variables.
 *
 * England and Wales (NATMAP, opened in 2026) is not included: no public WMS endpoint has been
 * confirmed yet.
 */

const env = import.meta.env;

export type SoilRegion = 'global' | 'us' | 'scotland';

export interface SoilLayer {
  id: string;
  /** Suffix of the translation key FARM_MAP.SOIL_LAYERS.<labelKey>. */
  labelKey: string;
  region: SoilRegion;
  /** WMS base URL, with any fixed query (SoilGrids needs ?map=...) already in it. */
  baseUrl: string;
  /** WMS layer name(s), comma separated. */
  wmsLayers: string;
  attribution: string;
  /** Highest zoom at which tiles are requested; coarse datasets only blur beyond it. */
  maxZoom: number;
}

const SOILGRIDS_BASE = env.VITE_SOIL_SOILGRIDS_WMS_URL || 'https://maps.isric.org/mapserv';
const SSURGO_BASE =
  env.VITE_SOIL_SSURGO_WMS_URL ||
  'https://sdmdataaccess.sc.egov.usda.gov/Spatial2/service.ows?SERVICE=WMS';
const HUTTON_WRB_BASE =
  env.VITE_SOIL_HUTTON_WRB_WMS_URL ||
  'https://druid.hutton.ac.uk/arcgis/services/GSSOIL_WRB/MapServer/WMSServer';
const HUTTON_LCA_BASE =
  env.VITE_SOIL_HUTTON_LCA_WMS_URL ||
  'https://druid.hutton.ac.uk/arcgis/services/Hutton_LCA/MapServer/WMSServer';

const SOILGRIDS_ATTRIBUTION = 'SoilGrids, ISRIC – World Soil Information (CC BY 4.0)';
const HUTTON_ATTRIBUTION = 'The James Hutton Institute (Hutton Open Data Licence)';

const soilGrids = (property: string, labelKey: string, wmsLayer: string): SoilLayer => {
  const url = new URL(SOILGRIDS_BASE);
  url.searchParams.set('map', `/map/${property}.map`);
  return {
    id: `soilgrids-${property}`,
    labelKey,
    region: 'global',
    baseUrl: url.toString(),
    wmsLayers: wmsLayer,
    attribution: SOILGRIDS_ATTRIBUTION,
    // SoilGrids is 250 m: tiles beyond this zoom only get blurrier.
    maxZoom: 12,
  };
};

export const SOIL_LAYERS: SoilLayer[] = [
  soilGrids('phh2o', 'PH', 'phh2o_0-5cm_mean'),
  soilGrids('clay', 'CLAY', 'clay_0-5cm_mean'),
  soilGrids('sand', 'SAND', 'sand_0-5cm_mean'),
  soilGrids('soc', 'ORGANIC_CARBON', 'soc_0-5cm_mean'),
  {
    id: 'ssurgo-mapunits',
    labelKey: 'SSURGO',
    region: 'us',
    baseUrl: SSURGO_BASE,
    wmsLayers: 'mapunitpoly',
    attribution: 'USDA NRCS Soil Survey Geographic Database (SSURGO)',
    maxZoom: 19,
  },
  {
    id: 'hutton-wrb',
    labelKey: 'HUTTON_WRB',
    region: 'scotland',
    baseUrl: HUTTON_WRB_BASE,
    // ArcGIS WMS layers are numbered; confirm in GetCapabilities.
    wmsLayers: '0',
    attribution: HUTTON_ATTRIBUTION,
    maxZoom: 15,
  },
  {
    id: 'hutton-lca',
    labelKey: 'HUTTON_LCA',
    region: 'scotland',
    baseUrl: HUTTON_LCA_BASE,
    wmsLayers: 'LCA_250K15295',
    attribution: HUTTON_ATTRIBUTION,
    maxZoom: 15,
  },
];

// Rough boxes, only used to decide which regional layers to offer. [west, south, east, north]
const US_BOXES: [number, number, number, number][] = [
  [-125, 24, -66.5, 49.5], // contiguous states
  [-170, 51, -129, 72], // Alaska
  [-161, 18.5, -154, 22.5], // Hawaii
];
const SCOTLAND_BOX: [number, number, number, number] = [-8.7, 54.6, -0.7, 60.9];

const inBox = (lat: number, lng: number, [w, s, e, n]: [number, number, number, number]) =>
  lng >= w && lng <= e && lat >= s && lat <= n;

export const getSoilRegions = (lat: number, lng: number): SoilRegion[] => {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return ['global'];
  const regions: SoilRegion[] = [];
  if (US_BOXES.some((box) => inBox(lat, lng, box))) regions.push('us');
  if (inBox(lat, lng, SCOTLAND_BOX)) regions.push('scotland');
  regions.push('global');
  return regions;
};

/** Layers to offer at a location: regional ones first, then the global fallback. */
export const getSoilLayersForLocation = (lat: number, lng: number): SoilLayer[] => {
  const regions = getSoilRegions(lat, lng);
  return regions.flatMap((region) => SOIL_LAYERS.filter((layer) => layer.region === region));
};

/**
 * WMS 1.3.0 GetMap tile URL for MapLibre. The bbox token is appended by hand because
 * URLSearchParams would percent-encode the braces and MapLibre would no longer substitute it.
 */
export const buildWmsTileUrl = (baseUrl: string, wmsLayers: string): string => {
  const params = [
    'SERVICE=WMS',
    'VERSION=1.3.0',
    'REQUEST=GetMap',
    `LAYERS=${encodeURIComponent(wmsLayers)}`,
    'STYLES=',
    'FORMAT=image/png',
    'TRANSPARENT=TRUE',
    'CRS=EPSG:3857',
    'WIDTH=256',
    'HEIGHT=256',
  ];
  // SSURGO's base already carries SERVICE=WMS: don't send it twice.
  const present = new Set(
    (baseUrl.split('?')[1] ?? '').split('&').map((p) => p.split('=')[0].toUpperCase()),
  );
  const extra = params.filter((p) => !present.has(p.split('=')[0]));
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}${extra.join('&')}&BBOX={bbox-epsg-3857}`;
};

export const SOIL_SOURCE_ID = 'soil-overlay';
export const SOIL_LAYER_ID = 'soil-overlay-raster';
export const DEFAULT_SOIL_OPACITY = 0.6;

export const buildSoilSource = (layer: SoilLayer) => ({
  type: 'raster' as const,
  tiles: [buildWmsTileUrl(layer.baseUrl, layer.wmsLayers)],
  tileSize: 256,
  maxzoom: layer.maxZoom,
  attribution: layer.attribution,
});
