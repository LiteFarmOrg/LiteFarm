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

import {
  RowPlanError,
  parseRowPlanGeoJSON,
  parseRowSpec,
  canonicalRowsText,
  computeMapHash,
  formatCoordinate,
  rowsOutsideField,
  buildRowPlanGeoJSON,
} from '../../src/util/rowPlan.js';

const rowFeature = (row, frag, coordinates) => ({
  type: 'Feature',
  properties: { role: 'row', row, frag },
  geometry: { type: 'LineString', coordinates },
});

const baseDoc = (properties = {}, features) => ({
  type: 'FeatureCollection',
  properties: { version: 1, origin: [51.5396, -2.4121], ...properties },
  features: features ?? [
    rowFeature(12, 0, [
      [-2.41201, 51.53941],
      [-2.41188, 51.53978],
    ]),
    rowFeature(13, 0, [
      [-2.4118, 51.53978],
      [-2.41193, 51.53941],
    ]),
  ],
});

// Shared with the station and robot tests. The same rows must give the same hash in Python.
const vectorRows = [
  {
    row_number: 12,
    frag: 0,
    position: 0,
    line_points: [
      { lat: 51.53941, lng: -2.41201 },
      { lat: 51.53978, lng: -2.41188 },
    ],
  },
  {
    row_number: 13,
    frag: 0,
    position: 1,
    line_points: [
      { lat: 51.53978, lng: -2.4118 },
      { lat: 51.53941, lng: -2.41193 },
    ],
  },
  {
    row_number: 13,
    frag: 1,
    position: 2,
    line_points: [
      { lat: 0.00390625, lng: -0.00390625 },
      { lat: -1e-9, lng: 1.2345678901 },
    ],
  },
];
const VECTOR_TEXT =
  '[[12,0,[[-2.4120100,51.5394100],[-2.4118800,51.5397800]]],[13,0,[[-2.4118000,51.5397800],[-2.4119300,51.5394100]]],[13,1,[[-0.0039063,0.0039063],[1.2345679,0.0000000]]]]';
const VECTOR_HASH = '91e75dec1e1f5165254ea0dd498f92d18931bd1659b6e93d014694a2cf19f4ed';

describe('map hash', () => {
  test('canonical text and hash match the cross-language vector', () => {
    expect(canonicalRowsText(vectorRows)).toBe(VECTOR_TEXT);
    expect(computeMapHash(vectorRows)).toBe(VECTOR_HASH);
  });

  test('order comes from position, not array order', () => {
    expect(computeMapHash([...vectorRows].reverse())).toBe(VECTOR_HASH);
  });

  test('negative zero is written as zero', () => {
    expect(formatCoordinate(-1e-9)).toBe('0.0000000');
  });

  test('round trip through parse keeps the hash', () => {
    const doc = baseDoc({}, [
      rowFeature(12, 0, [
        [-2.41201, 51.53941],
        [-2.41188, 51.53978],
      ]),
    ]);
    const { rows } = parseRowPlanGeoJSON(JSON.stringify(doc));
    const exported = buildRowPlanGeoJSON(
      {
        source: 'in_app',
        location_id: 'l',
        row_plan_id: 'p',
        origin: { lat: 51.5396, lng: -2.4121 },
      },
      rows.map((r, i) => ({ ...r, row_id: `r${i}`, length: r.length })),
    );
    const again = parseRowPlanGeoJSON(exported);
    expect(computeMapHash(again.rows)).toBe(computeMapHash(rows));
  });
});

describe('parseRowPlanGeoJSON', () => {
  test('reads an in-app plan with the existing web planner shape', () => {
    const { properties, rows } = parseRowPlanGeoJSON(baseDoc({ tool_width: 0.75, snake: true }));
    expect(properties.source).toBe('in_app');
    expect(properties.map_id).toBeNull();
    expect(properties.params.tool_width).toBe(0.75);
    expect(rows.map((r) => [r.row_number, r.frag, r.position])).toEqual([
      [12, 0, 0],
      [13, 0, 1],
    ]);
    expect(rows[0].line_points[0]).toEqual({ lat: 51.53941, lng: -2.41201 });
    expect(rows[0].length).toBeGreaterThan(0);
  });

  test('ignores field and obstacle features', () => {
    const doc = baseDoc();
    doc.features.unshift({
      type: 'Feature',
      properties: { role: 'field' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 0],
          ],
        ],
      },
    });
    expect(parseRowPlanGeoJSON(doc).rows).toHaveLength(2);
  });

  test('infers robot source from map_id and map_hash', () => {
    const { properties } = parseRowPlanGeoJSON(
      baseDoc({ map_id: 'north-2026', map_hash: 'a'.repeat(64) }),
    );
    expect(properties.source).toBe('robot');
  });

  test.each([
    ['wrong version', baseDoc({ version: 2 }), /unsupported plan version/],
    ['bad origin', baseDoc({ origin: [51] }), /origin/],
    ['map_id without hash', baseDoc({ map_id: 'a' }), /together/],
    ['hash without map_id', baseDoc({ map_hash: 'a'.repeat(64) }), /together/],
    ['bad hash', baseDoc({ map_id: 'a', map_hash: 'xyz' }), /64 lower-case/],
    ['bad map_id', baseDoc({ map_id: 'a b', map_hash: 'a'.repeat(64) }), /map_id may only/],
    ['robot without ids', baseDoc({ source: 'robot' }), /needs map_id/],
    [
      'in_app with ids',
      baseDoc({ source: 'in_app', map_id: 'a', map_hash: 'a'.repeat(64) }),
      /must not have/,
    ],
    ['unknown source', baseDoc({ source: 'drone' }), /source must be/],
    ['no rows', baseDoc({}, []), /no rows/],
  ])('rejects %s', (_name, doc, message) => {
    expect(() => parseRowPlanGeoJSON(doc)).toThrow(message);
  });

  test('rejects duplicate row and fragment', () => {
    const line = [
      [0, 0],
      [0, 0.001],
    ];
    expect(() =>
      parseRowPlanGeoJSON(baseDoc({}, [rowFeature(1, 0, line), rowFeature(1, 0, line)])),
    ).toThrow(/appears twice/);
  });

  test('accepts the same row with different fragments', () => {
    const line = [
      [0, 0],
      [0, 0.001],
    ];
    expect(
      parseRowPlanGeoJSON(baseDoc({}, [rowFeature(1, 0, line), rowFeature(1, 1, line)])).rows,
    ).toHaveLength(2);
  });

  test.each([
    [
      'out of range',
      [
        [0, 0],
        [200, 0],
      ],
    ],
    [
      'not finite',
      [
        [0, 0],
        [null, 0],
      ],
    ],
    ['single point', [[0, 0]]],
  ])('rejects row geometry: %s', (_name, coordinates) => {
    expect(() => parseRowPlanGeoJSON(baseDoc({}, [rowFeature(1, 0, coordinates)]))).toThrow(
      RowPlanError,
    );
  });

  test('rejects invalid JSON text and non-collections', () => {
    expect(() => parseRowPlanGeoJSON('{')).toThrow(/not valid JSON/);
    expect(() => parseRowPlanGeoJSON({ type: 'Feature' })).toThrow(/FeatureCollection/);
  });
});

describe('rowsOutsideField', () => {
  const ring = [
    { lat: 51.0, lng: -2.0 },
    { lat: 51.0, lng: -1.99 },
    { lat: 51.01, lng: -1.99 },
    { lat: 51.01, lng: -2.0 },
  ];
  const row = (row_number, lat, lng) => ({
    row_number,
    line_points: [
      { lat: 51.005, lng: -1.995 },
      { lat, lng },
    ],
  });

  test('accepts rows inside and within tolerance, flags rows beyond it', () => {
    // 0.00002 degrees of latitude is about 2.2 m.
    const rows = [row(1, 51.005, -1.996), row(2, 51.01002, -1.995), row(3, 51.012, -1.995)];
    expect(rowsOutsideField(rows, ring)).toEqual([3]);
  });

  test('no ring means no check', () => {
    expect(rowsOutsideField([row(1, 60, 10)], null)).toEqual([]);
  });
});

describe('parseRowSpec', () => {
  test('reads numbers and ranges', () => {
    expect(parseRowSpec('12-14, 21,12')).toEqual([12, 13, 14, 21]);
  });

  test.each(['', '  ', 'a', '5-', '9-3', '1,,2', '-4'])('rejects %j', (text) => {
    expect(() => parseRowSpec(text)).toThrow(RowPlanError);
  });
});

describe('buildRowPlanGeoJSON', () => {
  const plan = {
    row_plan_id: 'plan-1',
    location_id: 'loc-1',
    source: 'robot',
    map_id: 'north-2026',
    map_hash: VECTOR_HASH,
    inputs_hash: 'b'.repeat(64),
    supersedes_map_id: 'north-2025',
    generator: 'feldfreund-web-planner',
    origin: { lat: 51.5396, lng: -2.4121 },
    params: { tool_width: 0.75, angle: 12, headland: 3, snake: true, contour: false },
  };
  const rows = vectorRows.map((r, i) => ({ ...r, row_id: `row-${i}`, length: '10.50' }));

  test('writes robot ids verbatim and rows in position order', () => {
    const doc = buildRowPlanGeoJSON(plan, [...rows].reverse());
    expect(doc.properties).toMatchObject({
      version: 1,
      source: 'robot',
      origin: [51.5396, -2.4121],
      map_id: 'north-2026',
      map_hash: VECTOR_HASH,
      supersedes: 'north-2025',
      field_location_id: 'loc-1',
      tool_width: 0.75,
      contour: false,
    });
    expect(doc.features.map((f) => f.properties.row_id)).toEqual(['row-0', 'row-1', 'row-2']);
    expect(doc.features[0].geometry.coordinates[0]).toEqual([-2.41201, 51.53941]);
  });

  test('in-app export carries no map ids', () => {
    const doc = buildRowPlanGeoJSON(
      { ...plan, source: 'in_app', map_id: null, map_hash: null },
      rows,
    );
    expect(doc.properties.map_id).toBeUndefined();
    expect(doc.properties.map_hash).toBeUndefined();
  });

  test('exported robot plan re-imports with the same hash', () => {
    const { properties, rows: parsed } = parseRowPlanGeoJSON(buildRowPlanGeoJSON(plan, rows));
    expect(properties.map_hash).toBe(VECTOR_HASH);
    expect(computeMapHash(parsed)).toBe(VECTOR_HASH);
  });
});
