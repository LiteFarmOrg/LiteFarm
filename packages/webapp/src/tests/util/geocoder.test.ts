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

describe('geocoder boundaries and request contracts', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it.each([
    ['90, 180', { lat: 90, lng: 180 }],
    ['-90 -180', { lat: -90, lng: -180 }],
    ['0, 0', { lat: 0, lng: 0 }],
    ['  -0.25,   0.5  ', { lat: -0.25, lng: 0.5 }],
  ])('accepts coordinate boundary %j', (input, expected) => {
    expect(parseLatLng(input)).toEqual(expected);
  });

  it.each([
    '',
    '1',
    '1, 2, 3',
    '1.2.3, 4',
    '1, 2 trailing',
    'NaN, 0',
    'Infinity, 0',
    '-90.001, 0',
    '0, -180.001',
  ])('rejects malformed or out-of-range coordinates %j', (input) =>
    expect(parseLatLng(input)).toBeNull(),
  );

  it('trims and deduplicates address parts while retaining their order', () => {
    expect(
      photonLabel({
        name: '  Farm ',
        street: 'Farm',
        district: ' ',
        city: ' Bristol ',
        state: 'Bristol',
        country: 'UK',
      }),
    ).toBe('Farm, Bristol, UK');
    expect(photonLabel({})).toBe('');
  });

  it.each(['photon', 'nominatim'] as const)(
    'encodes queries, limits and cancellation for %s',
    async (provider) => {
      const fetchFn = mockFetch(provider === 'photon' ? { features: [] } : []);
      const signal = new AbortController().signal;
      await searchAddress('  São Paulo & farm/field?  ', {
        provider,
        baseUrl: 'https://geo.example',
        limit: 2,
        signal,
      });
      expect(fetchFn).toHaveBeenCalledTimes(1);
      const [request, options] = fetchFn.mock.calls[0];
      const url = new URL(request);
      expect(url.origin).toBe('https://geo.example');
      expect(url.pathname).toBe(provider === 'photon' ? '/api/' : '/search');
      expect(url.searchParams.get('q')).toBe('São Paulo & farm/field?');
      expect(url.searchParams.get('limit')).toBe('2');
      expect(options).toEqual({ signal, headers: { Accept: 'application/json' } });
    },
  );

  it('filters unusable Photon features and preserves valid numeric strings and zero coordinates', async () => {
    mockFetch({
      features: [
        null,
        {},
        { geometry: { coordinates: [1] } },
        { geometry: { coordinates: [1, 2] }, properties: {} },
        { geometry: { coordinates: ['bad', 2] }, properties: { name: 'Bad' } },
        { geometry: { coordinates: [1, Infinity] }, properties: { name: 'Infinite' } },
        {
          geometry: { coordinates: ['0', '0'] },
          properties: { name: 'Origin', countrycode: 'gb' },
        },
        { geometry: { coordinates: [3, 4] }, properties: { name: 'No country' } },
      ],
    });
    expect(await searchAddress('farm', { provider: 'photon' })).toEqual([
      { label: 'Origin', lat: 0, lng: 0, country: 'GB' },
      { label: 'No country', lat: 4, lng: 3, country: undefined },
    ]);
  });

  it('filters unusable Nominatim results', async () => {
    mockFetch([
      null,
      {},
      { display_name: '', lat: 1, lon: 2 },
      { display_name: 'Bad', lat: 'bad', lon: '2' },
      { display_name: 'Infinite', lat: 1, lon: Infinity },
      { display_name: 'Origin', lat: '0', lon: '0' },
    ]);
    expect(await searchAddress('farm', { provider: 'nominatim' })).toEqual([
      { label: 'Origin', lat: 0, lng: 0, country: undefined },
    ]);
  });

  it.each(['photon', 'nominatim'] as const)(
    'treats absent %s result collections as empty',
    async (provider) => {
      mockFetch(null);
      expect(await searchAddress('farm', { provider })).toEqual([]);
      mockFetch({});
      expect(await searchAddress('farm', { provider })).toEqual([]);
    },
  );

  it.each(['photon', 'nominatim'] as const)(
    'requests country-level reverse lookup and forwards aborts for %s',
    async (provider) => {
      const fetchFn = mockFetch({});
      const signal = new AbortController().signal;
      expect(
        await reverseCountry(0, -30, { provider, baseUrl: 'https://geo.example', signal }),
      ).toBeUndefined();
      const [request, options] = fetchFn.mock.calls[0];
      const url = new URL(request);
      expect(url.pathname).toBe('/reverse');
      expect(url.searchParams.get('lat')).toBe('0');
      expect(url.searchParams.get('lon')).toBe('-30');
      if (provider === 'nominatim') {
        expect(url.searchParams.get('zoom')).toBe('3');
        expect(url.searchParams.get('format')).toBe('jsonv2');
        expect(url.searchParams.get('addressdetails')).toBe('1');
      }
      expect(options.signal).toBe(signal);
    },
  );

  it.each(['photon', 'nominatim'] as const)(
    'reports HTTP status and preserves network failures for %s',
    async (provider) => {
      mockFetch({}, false, 503);
      await expect(reverseCountry(1, 2, { provider })).rejects.toMatchObject({
        name: 'GeocoderError',
        message: 'Geocoder request failed with status 503',
      });
      const error = new DOMException('Cancelled', 'AbortError');
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error));
      await expect(searchAddress('farm', { provider })).rejects.toBe(error);
      await expect(reverseCountry(1, 2, { provider })).rejects.toBe(error);
    },
  );

  it.each([
    ['', 'photon', 'https://photon.komoot.io', true],
    ['nominatim', 'nominatim', 'https://nominatim.openstreetmap.org', false],
    ['unknown', 'photon', 'https://photon.komoot.io', true],
  ])('selects documented provider defaults for %j', async (value, provider, baseUrl, asYouType) => {
    vi.resetModules();
    vi.stubEnv('VITE_GEOCODER', value);
    vi.stubEnv('VITE_GEOCODER_URL', '');
    const config = await import('../../util/geocoding/geocoder');
    expect(config.GEOCODER_PROVIDER).toBe(provider);
    expect(config.GEOCODER_BASE_URL).toBe(baseUrl);
    expect(config.SEARCH_AS_YOU_TYPE).toBe(asYouType);
    const fetchFn = mockFetch({});
    await config.searchAddress('farm');
    expect(new URL(fetchFn.mock.calls[0][0]).origin).toBe(baseUrl);
  });

  it('removes trailing slashes from a configured geocoder URL', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_GEOCODER', 'photon');
    vi.stubEnv('VITE_GEOCODER_URL', 'https://geo.example/service///');
    const config = await import('../../util/geocoding/geocoder');
    const fetchFn = mockFetch({});
    await config.searchAddress('farm');
    expect(fetchFn.mock.calls[0][0]).toBe('https://geo.example/service/api/?q=farm&limit=5');
  });
});
