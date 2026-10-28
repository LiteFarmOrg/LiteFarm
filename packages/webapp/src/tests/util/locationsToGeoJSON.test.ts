import { describe, expect, it } from 'vitest';
import { buildLocationCollections } from '../../util/mapLibre/locationsToGeoJSON';

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
      point: { gate: [{ location_id: 'g', name: 'G', type: 'gate', point: { lat: 51.01, lng: -1.9 } }] },
    });
    expect(bounds).toEqual([
      [-2.0, 51.0],
      [-1.9, 51.01],
    ]);
  });
});
