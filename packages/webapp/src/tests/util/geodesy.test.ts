import { describe, expect, it } from 'vitest';
import {
  distanceBetween,
  EARTH_RADIUS_M,
  PointLike,
  sphericalShim,
  widthRing,
  computeHeading,
  computeOffset,
  pathLength,
  ringArea,
  ringPerimeter,
} from '../../util/mapLibre/geodesy';
import { polygonPath } from '../../containers/Map/constants';

describe('geodesy', () => {
  it('measures a degree of latitude with the Google earth radius', () => {
    const length = pathLength([
      { lat: 0, lng: 0 },
      { lat: 1, lng: 0 },
    ]);
    expect(length).toBeCloseTo(111319.49, 1);
  });

  it('computes the area and perimeter of a small square near the equator', () => {
    const d = 0.001;
    const square = [
      { lat: 0, lng: 0 },
      { lat: 0, lng: d },
      { lat: d, lng: d },
      { lat: d, lng: 0 },
    ];
    const side = (Math.PI / 180) * 6378137 * d;
    expect(ringArea(square)).toBeCloseTo(side * side, 0);
    expect(ringPerimeter(square)).toBeCloseTo(4 * side, 1);
  });

  it('gives zero area for fewer than three points or collinear points', () => {
    expect(
      ringArea([
        { lat: 1, lng: 1 },
        { lat: 2, lng: 2 },
      ]),
    ).toBe(0);
    expect(
      Math.round(
        ringArea([
          { lat: 0, lng: 0 },
          { lat: 0, lng: 1 },
          { lat: 0, lng: 2 },
        ]),
      ),
    ).toBe(0);
  });

  it('round-trips heading and offset', () => {
    const start = { lat: 51.45, lng: -2.58 };
    const end = computeOffset(start, 1000, 90);
    expect(computeHeading(start, end)).toBeCloseTo(90, 0);
    const back = computeOffset(start, 1000, 0);
    expect(back.lat).toBeCloseTo(start.lat + 1000 / 111319.49, 4);
  });
});

describe('geodesy boundary cases and Google adapter', () => {
  it('handles coincident and antipodal points without NaN', () => {
    const origin = { lat: 0, lng: 0 };
    expect(distanceBetween(origin, origin)).toBe(0);
    expect(distanceBetween(origin, { lat: 0, lng: 180 })).toBeCloseTo(Math.PI * EARTH_RADIUS_M, 5);
    expect(distanceBetween({ lat: 45, lng: 12 }, { lat: -45, lng: -168 })).toBeCloseTo(
      Math.PI * EARTH_RADIUS_M,
      0,
    );
  });

  it('takes the short path across the antimeridian and is symmetric', () => {
    const a = { lat: 0, lng: 179.9 };
    const b = { lat: 0, lng: -179.9 };
    expect(distanceBetween(a, b)).toBeCloseTo(22263.898, 2);
    expect(distanceBetween(a, b)).toBeCloseTo(distanceBetween(b, a), 8);
  });

  it.each([{ path: [] }, { path: [{ lat: 1, lng: 2 }] }])(
    'has zero length and perimeter for a trivial path %j',
    ({ path }) => {
      expect(pathLength(path)).toBe(0);
      expect(ringPerimeter(path)).toBe(0);
      expect(ringArea(path)).toBe(0);
    },
  );

  it('counts open segments and closes the perimeter exactly once', () => {
    const path = [
      { lat: 0, lng: 0 },
      { lat: 0, lng: 1 },
      { lat: 0, lng: 2 },
    ];
    expect(pathLength(path)).toBeCloseTo(222638.982, 2);
    expect(ringPerimeter(path)).toBeCloseTo(445277.963, 2);
    expect(ringPerimeter([...path, path[0]])).toBeCloseTo(ringPerimeter(path), 5);
  });

  it('keeps area independent of winding and an explicit closing vertex', () => {
    const ring = [
      { lat: -1, lng: -1 },
      { lat: -1, lng: 0 },
      { lat: 0, lng: 0 },
      { lat: 0, lng: -1 },
    ];
    const original = structuredClone(ring);
    expect(ringArea(ring)).toBeGreaterThan(0);
    expect(ringArea([...ring].reverse())).toBeCloseTo(ringArea(ring), 3);
    expect(ringArea([...ring, ring[0]])).toBeCloseTo(ringArea(ring), 3);
    expect(ring).toEqual(original);
  });

  it.each([
    [{ lat: 1, lng: 0 }, 0],
    [{ lat: 0, lng: 1 }, 90],
    [{ lat: -1, lng: 0 }, -180],
    [{ lat: 0, lng: -1 }, -90],
  ])('reports cardinal heading to %j in [-180, 180)', (point, heading) => {
    expect(computeHeading({ lat: 0, lng: 0 }, point)).toBeCloseTo(heading, 8);
  });

  it('normalizes offsets across the dateline and preserves zero-distance origins', () => {
    const start = { lat: 0, lng: 179.999 };
    const end = computeOffset(start, 1000, 90);
    expect(end.lng).toBeLessThan(-179.9);
    expect(end.lng).toBeGreaterThanOrEqual(-180);
    expect(distanceBetween(start, end)).toBeCloseTo(1000, 5);
    const unchanged = computeOffset(start, 0, -90);
    expect(unchanged.lat).toBeCloseTo(start.lat, 8);
    expect(unchanged.lng).toBeCloseTo(start.lng, 8);
  });

  it('adapts method-based Google points to spherical operations', () => {
    const origin = new PointLike(0, 0);
    const east = new PointLike(0, 1);
    expect(sphericalShim.geometry.spherical.computeHeading(origin, east)).toBeCloseTo(90, 8);
    const offset = sphericalShim.geometry.spherical.computeOffset(origin, 1000, 0);
    expect(offset).toBeInstanceOf(PointLike);
    expect(offset.lat()).toBeCloseTo(0.00898315, 7);
    expect(offset.lng()).toBeCloseTo(0, 8);
  });

  it('builds the existing line-width polygon without Google or input mutation', () => {
    const line = [
      { lat: 0, lng: 0 },
      { lat: 0, lng: 0.001 },
    ];
    const before = structuredClone(line);
    const ring = widthRing(line, 10, polygonPath);
    expect(ring).toHaveLength(4);
    expect(ring.every(({ lat, lng }) => Number.isFinite(lat) && Number.isFinite(lng))).toBe(true);
    expect(distanceBetween(ring[0], ring[3])).toBeCloseTo(10, 4);
    expect(ringArea(ring)).toBeCloseTo(1113.1949, 1);
    expect(line).toEqual(before);
  });
});
