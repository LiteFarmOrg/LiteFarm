import { describe, expect, it } from 'vitest';
import {
  areaToFeature,
  lineToFeature,
  pointToFeature,
  lineToBufferFeature,
  lineWidthMetres,
  boundsOf,
  toPosition,
  buildLocationCollections,
} from '../../util/mapLibre/locationsToGeoJSON';

const square = [
  { lat: 51.0, lng: -2.0 },
  { lat: 51.0, lng: -1.999 },
  { lat: 51.001, lng: -1.999 },
  { lat: 51.001, lng: -2.0 },
];

describe('buildLocationCollections', () => {
  it('converts an area to a closed [lng, lat] ring and labels it at the centroid', () => {
    const { areas, labels } = buildLocationCollections({
      area: { field: [{ location_id: 'a', name: 'Field 1', type: 'field', grid_points: square }] },
    });
    const ring = (areas.features[0].geometry as any).coordinates[0];
    expect(ring[0]).toEqual([-2.0, 51.0]);
    expect(ring[ring.length - 1]).toEqual(ring[0]);
    expect(labels[0].name).toBe('Field 1');
    expect(labels[0].lngLat[0]).toBeCloseTo(-1.9995, 3);
  });

  it('draws the farm site boundary as an outline-only line that still selects as an area', () => {
    const { areas, lines } = buildLocationCollections({
      area: {
        farm_site_boundary: [
          { location_id: 'b', name: 'Farm', type: 'farm_site_boundary', grid_points: square },
        ],
      },
    });
    expect(areas.features).toHaveLength(0);
    expect(lines.features[0].properties.asset).toBe('area');
  });

  it('buffers watercourses by buffer_width plus width', () => {
    const { lineBuffers } = buildLocationCollections({
      line: {
        watercourse: [
          {
            location_id: 'w',
            name: 'Stream',
            type: 'watercourse',
            width: 1,
            buffer_width: 15,
            line_points: [square[0], square[2]],
          },
        ],
      },
    });
    expect(lineBuffers.features).toHaveLength(1);
    expect(lineBuffers.features[0].geometry.type).toBe('Polygon');
  });

  it('skips degenerate geometry and returns null bounds when empty', () => {
    const result = buildLocationCollections({
      area: { field: [{ location_id: 'x', type: 'field', grid_points: square.slice(0, 2) }] },
      point: {},
    });
    expect(result.areas.features).toHaveLength(0);
    expect(result.bounds).toBeNull();
  });

  it('computes bounds across areas, lines and points', () => {
    const { bounds } = buildLocationCollections({
      area: { field: [{ location_id: 'a', name: 'F', type: 'field', grid_points: square }] },
      point: {
        gate: [{ location_id: 'g', name: 'G', type: 'gate', point: { lat: 51.01, lng: -1.9 } }],
      },
    });
    expect(bounds).toEqual([
      [-2.0, 51.0],
      [-1.9, 51.01],
    ]);
  });
});

describe('GeoJSON conversion boundaries', () => {
  it('converts numeric strings and zero coordinates to longitude-first positions', () => {
    expect(toPosition({ lat: '0', lng: '-2.5' } as any)).toEqual([-2.5, 0]);
  });

  it.each([null, {}, { grid_points: [] }, { grid_points: square.slice(0, 2) }])(
    'rejects incomplete areas %j',
    (location) => {
      expect(areaToFeature(location)).toBeNull();
    },
  );

  it.each([null, {}, { line_points: [] }, { line_points: square.slice(0, 1) }])(
    'rejects incomplete lines %j',
    (location) => {
      expect(lineToFeature(location)).toBeNull();
    },
  );

  it.each([null, {}, { point: null }])('rejects missing points %j', (location) => {
    expect(pointToFeature(location)).toBeNull();
  });

  it('does not append another closing vertex or mutate a closed input ring', () => {
    const points = [...square, square[0]];
    const original = structuredClone(points);
    const feature = areaToFeature({
      location_id: 'a',
      name: 'Field',
      type: 'field',
      grid_points: points,
    })!;
    expect(feature.geometry.type).toBe('Polygon');
    if (feature.geometry.type !== 'Polygon') throw new Error('Expected polygon');
    expect(feature.geometry.coordinates[0]).toHaveLength(5);
    feature.geometry.coordinates[0][0][0] = 99;
    expect(points).toEqual(original);
  });

  it('preserves selection metadata and excludes unrelated location data', () => {
    expect(
      pointToFeature({
        location_id: 's',
        name: 'Sensor',
        type: 'sensor',
        isAddonSensor: true,
        secret: 'irrelevant',
        point: { lat: 0, lng: 0 },
      }),
    ).toEqual({
      type: 'Feature',
      properties: {
        location_id: 's',
        name: 'Sensor',
        type: 'sensor',
        asset: 'point',
        isAddonSensor: true,
      },
      geometry: { type: 'Point', coordinates: [0, 0] },
    });
  });

  it.each([
    [{ type: 'watercourse', width: '2', buffer_width: '8' }, 10],
    [{ type: 'buffer_zone', width: '8', buffer_width: 50 }, 8],
    [{ type: 'fence', width: 1 }, 1],
  ])('computes numeric width for %j', (location, expected) => {
    expect(lineWidthMetres(location)).toBe(expected);
  });

  it.each([
    { type: 'fence', width: 5 },
    { type: 'buffer_zone', width: 0 },
    { type: 'buffer_zone', width: -1 },
    { type: 'buffer_zone', width: 'invalid' },
    { type: 'buffer_zone', width: Infinity },
    { type: 'watercourse', width: 2 },
  ])('does not buffer unsupported types or invalid widths %j', (props) => {
    expect(lineToBufferFeature({ ...props, line_points: square.slice(0, 2) })).toBeNull();
  });

  it('buffers by half the total width and includes that extent in map bounds', () => {
    const result = buildLocationCollections({
      line: {
        watercourse: [
          {
            location_id: 'stream',
            type: 'watercourse',
            width: '2',
            buffer_width: '18',
            line_points: [
              { lat: 0, lng: 0 },
              { lat: 0, lng: 0.001 },
            ],
          },
        ],
      },
    });
    const buffered = result.lineBuffers.features[0];
    expect(buffered.properties).toEqual(result.lines.features[0].properties);
    // Ten metres either side of the equator is roughly 0.00009 degrees.
    expect(result.bounds![0][1]).toBeCloseTo(-0.00009, 6);
    expect(result.bounds![1][1]).toBeCloseTo(0.00009, 6);
    expect(result.bounds![0][0]).toBeLessThan(0);
    expect(result.bounds![1][0]).toBeGreaterThan(0.001);
  });

  it('accepts singleton and array buckets and skips null buckets and incomplete geometry', () => {
    const result = buildLocationCollections({
      area: {
        field: { location_id: 'a', type: 'field', name: 'Field', grid_points: square },
        empty: null,
      },
      line: { fence: [{ type: 'fence', line_points: [] }] },
      point: {
        gate: { location_id: 'g', type: 'gate', point: { lat: -10, lng: -20 } },
        missing: {},
      },
    });
    expect(result.areas.features).toHaveLength(1);
    expect(result.lines.features).toEqual([]);
    expect(result.points.features).toHaveLength(1);
    expect(result.labels).toEqual([
      { id: 'a', name: 'Field', type: 'field', lngLat: [-1.9995, 51.0005] },
    ]);
    expect(result.bounds).toEqual([
      [-20, -10],
      [-1.999, 51.001],
    ]);
  });

  it('does not create filled shapes or labels for outline-only boundaries', () => {
    const result = buildLocationCollections({
      area: {
        farm_site_boundary: {
          location_id: 'b',
          type: 'farm_site_boundary',
          name: 'Boundary',
          grid_points: square,
        },
      },
    });
    expect(result.areas.features).toEqual([]);
    expect(result.labels).toEqual([]);
    expect(result.lines.features[0]).toMatchObject({
      properties: { asset: 'area', location_id: 'b' },
      geometry: {
        type: 'LineString',
        coordinates: [...square.map(toPosition), toPosition(square[0])],
      },
    });
    expect(result.bounds).toEqual([
      [-2, 51],
      [-1.999, 51.001],
    ]);
  });

  it('returns empty collections and null bounds for no assets', () => {
    const result = buildLocationCollections({});
    for (const key of ['areas', 'lines', 'lineBuffers', 'points'] as const) {
      expect(result[key]).toEqual({ type: 'FeatureCollection', features: [] });
    }
    expect(result.labels).toEqual([]);
    expect(result.bounds).toBeNull();
    expect(boundsOf([])).toBeNull();
  });
});
