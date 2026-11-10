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

// Non-Google address search and reverse geocoding, used by the MapLibre Add Farm page.
// Language is not sent: both services fall back to the browser's Accept-Language header.

export type GeocoderProvider = 'photon' | 'nominatim';

export type GeocodeResult = {
  label: string;
  lat: number;
  lng: number;
  /** Upper-case ISO 3166-1 alpha-2, the same form Google's `short_name` gave. */
  country?: string;
};

export type GeocoderOptions = {
  provider?: GeocoderProvider;
  baseUrl?: string;
  signal?: AbortSignal;
  limit?: number;
};

const env = import.meta.env;

export const GEOCODER_PROVIDER: GeocoderProvider =
  env.VITE_GEOCODER === 'nominatim' ? 'nominatim' : 'photon';

const DEFAULT_BASE_URLS: Record<GeocoderProvider, string> = {
  photon: 'https://photon.komoot.io',
  nominatim: 'https://nominatim.openstreetmap.org',
};

export const GEOCODER_BASE_URL: string = (
  env.VITE_GEOCODER_URL || DEFAULT_BASE_URLS[GEOCODER_PROVIDER]
).replace(/\/+$/, '');

/**
 * Photon is queried as the user types. The public Nominatim instance is not meant for
 * search-as-you-type, so with Nominatim the search runs when the user presses Enter.
 */
export const SEARCH_AS_YOU_TYPE = GEOCODER_PROVIDER === 'photon';

export class GeocoderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeocoderError';
  }
}

const COORDINATE_REGEX = /^(-?\d+(?:\.\d+)?)[,\s]\s*(-?\d+(\.\d+)?)$/;

/** Parses "lat, lng" (comma or space separated). Returns null if malformed or out of range. */
export const parseLatLng = (value: string): { lat: number; lng: number } | null => {
  const matches = COORDINATE_REGEX.exec(value.trim());
  if (!matches) return null;
  const lat = parseFloat(matches[1]);
  const lng = parseFloat(matches[2]);
  if (Number.isNaN(lat) || Number.isNaN(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return null;
  }
  return { lat, lng };
};

const fetchJson = async (url: string, signal?: AbortSignal) => {
  const response = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new GeocoderError(`Geocoder request failed with status ${response.status}`);
  }
  return response.json();
};

const normaliseCountry = (code?: string | null) => (code ? code.toUpperCase() : undefined);

const unique = (parts: (string | undefined | null)[]) =>
  parts
    .map((part) => (part ? String(part).trim() : ''))
    .filter((part, index, all) => part && all.indexOf(part) === index);

type PhotonProperties = {
  name?: string;
  housenumber?: string;
  street?: string;
  postcode?: string;
  district?: string;
  city?: string;
  state?: string;
  country?: string;
  countrycode?: string;
};

export const photonLabel = (p: PhotonProperties): string => {
  const streetLine = [p.housenumber, p.street].filter(Boolean).join(' ');
  return unique([p.name, streetLine, p.postcode, p.district, p.city, p.state, p.country]).join(
    ', ',
  );
};

const photonFeatures = (json: any): GeocodeResult[] =>
  (json?.features ?? [])
    .filter(
      (f: any) => Array.isArray(f?.geometry?.coordinates) && f.geometry.coordinates.length >= 2,
    )
    .map((f: any) => ({
      label: photonLabel(f.properties ?? {}),
      lng: Number(f.geometry.coordinates[0]),
      lat: Number(f.geometry.coordinates[1]),
      country: normaliseCountry(f.properties?.countrycode),
    }))
    .filter((r: GeocodeResult) => r.label && Number.isFinite(r.lat) && Number.isFinite(r.lng));

const nominatimResults = (json: any): GeocodeResult[] =>
  (Array.isArray(json) ? json : [])
    .map((r: any) => ({
      label: r?.display_name ?? '',
      lat: Number(r?.lat),
      lng: Number(r?.lon),
      country: normaliseCountry(r?.address?.country_code),
    }))
    .filter((r: GeocodeResult) => r.label && Number.isFinite(r.lat) && Number.isFinite(r.lng));

export const searchAddress = async (
  query: string,
  {
    provider = GEOCODER_PROVIDER,
    baseUrl = GEOCODER_BASE_URL,
    signal,
    limit = 5,
  }: GeocoderOptions = {},
): Promise<GeocodeResult[]> => {
  const q = query.trim();
  if (!q) return [];
  if (provider === 'nominatim') {
    const params = new URLSearchParams({
      q,
      format: 'jsonv2',
      addressdetails: '1',
      limit: String(limit),
    });
    return nominatimResults(await fetchJson(`${baseUrl}/search?${params}`, signal));
  }
  const params = new URLSearchParams({ q, limit: String(limit) });
  return photonFeatures(await fetchJson(`${baseUrl}/api/?${params}`, signal));
};

/** Returns the ISO 3166-1 alpha-2 country code at a coordinate, or undefined if there is none. */
export const reverseCountry = async (
  lat: number,
  lng: number,
  { provider = GEOCODER_PROVIDER, baseUrl = GEOCODER_BASE_URL, signal }: GeocoderOptions = {},
): Promise<string | undefined> => {
  if (provider === 'nominatim') {
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lng),
      format: 'jsonv2',
      zoom: '3',
      addressdetails: '1',
    });
    const json = await fetchJson(`${baseUrl}/reverse?${params}`, signal);
    return normaliseCountry(json?.address?.country_code);
  }
  const params = new URLSearchParams({ lat: String(lat), lon: String(lng) });
  const json = await fetchJson(`${baseUrl}/reverse?${params}`, signal);
  return normaliseCountry(json?.features?.[0]?.properties?.countrycode);
};
