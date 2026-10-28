import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  GeocoderError,
  parseLatLng,
  photonLabel,
  reverseCountry,
  searchAddress,
} from '../../util/geocoding/geocoder';

const mockFetch = (body: unknown, ok = true, status = 200) => {
  const fn = vi.fn().mockResolvedValue({ ok, status, json: async () => body });
  vi.stubGlobal('fetch', fn);
  return fn;
};

const photonBody = {
  features: [
    {
      geometry: { type: 'Point', coordinates: [-2.5879, 51.4545] },
      properties: {
        name: 'Bristol',
        city: 'Bristol',
        state: 'England',
        country: 'United Kingdom',
        countrycode: 'GB',
      },
    },
    { geometry: { type: 'Point', coordinates: [] }, properties: { name: 'Broken' } },
  ],
};

describe('parseLatLng', () => {
  it('parses comma and space separated coordinates', () => {
    expect(parseLatLng('49.250945, -123.238492')).toEqual({ lat: 49.250945, lng: -123.238492 });
    expect(parseLatLng(' 51.5 -2.5 ')).toEqual({ lat: 51.5, lng: -2.5 });
  });

  it('rejects text and out-of-range values', () => {
    expect(parseLatLng('Bristol')).toBeNull();
    expect(parseLatLng('91, 0')).toBeNull();
    expect(parseLatLng('0, 181')).toBeNull();
  });
});

describe('photonLabel', () => {
  it('joins address parts without repeating the same text', () => {
    expect(
      photonLabel({
        name: 'Bristol',
        city: 'Bristol',
        state: 'England',
        country: 'United Kingdom',
      }),
    ).toBe('Bristol, England, United Kingdom');
  });

  it('puts house number before street', () => {
    expect(photonLabel({ housenumber: '12', street: 'High Street', postcode: 'BS1 1AA' })).toBe(
      '12 High Street, BS1 1AA',
    );
  });
});

describe('geocoder', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('searches Photon and maps [lng, lat] features, skipping malformed ones', async () => {
    const fetchFn = mockFetch(photonBody);
    const results = await searchAddress('Bristol', {
      provider: 'photon',
      baseUrl: 'https://photon.example',
    });
    expect(fetchFn.mock.calls[0][0]).toBe('https://photon.example/api/?q=Bristol&limit=5');
    expect(results).toEqual([
      {
        label: 'Bristol, England, United Kingdom',
        lat: 51.4545,
        lng: -2.5879,
        country: 'GB',
      },
    ]);
  });

  it('searches Nominatim and upper-cases the country code', async () => {
    const fetchFn = mockFetch([
      {
        display_name: 'Bristol, England, UK',
        lat: '51.4545',
        lon: '-2.5879',
        address: { country_code: 'gb' },
      },
    ]);
    const results = await searchAddress('Bristol', {
      provider: 'nominatim',
      baseUrl: 'https://nominatim.example',
    });
    const url = new URL(fetchFn.mock.calls[0][0]);
    expect(url.pathname).toBe('/search');
    expect(url.searchParams.get('format')).toBe('jsonv2');
    expect(url.searchParams.get('addressdetails')).toBe('1');
    expect(results[0]).toEqual({
      label: 'Bristol, England, UK',
      lat: 51.4545,
      lng: -2.5879,
      country: 'GB',
    });
  });

  it('does not call the network for an empty query', async () => {
    const fetchFn = mockFetch({});
    expect(await searchAddress('   ')).toEqual([]);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('reverse geocodes the country with Photon and Nominatim', async () => {
    const photonFetch = mockFetch(photonBody);
    expect(
      await reverseCountry(51.45, -2.58, { provider: 'photon', baseUrl: 'https://photon.example' }),
    ).toBe('GB');
    const photonUrl = new URL(photonFetch.mock.calls[0][0]);
    expect(photonUrl.pathname).toBe('/reverse');
    expect(photonUrl.searchParams.get('lat')).toBe('51.45');
    expect(photonUrl.searchParams.get('lon')).toBe('-2.58');

    mockFetch({ address: { country_code: 'fr' } });
    expect(
      await reverseCountry(48, 3.66, {
        provider: 'nominatim',
        baseUrl: 'https://nominatim.example',
      }),
    ).toBe('FR');
  });

  it('returns undefined when there is no country at the point', async () => {
    mockFetch({ features: [] });
    expect(
      await reverseCountry(0, -30, { provider: 'photon', baseUrl: 'https://p.example' }),
    ).toBeUndefined();
  });

  it('throws GeocoderError on a failed response', async () => {
    mockFetch({}, false, 429);
    await expect(
      searchAddress('Bristol', { provider: 'photon', baseUrl: 'https://photon.example' }),
    ).rejects.toBeInstanceOf(GeocoderError);
  });
});
