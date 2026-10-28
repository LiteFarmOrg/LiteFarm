import { describe, expect, it } from 'vitest';
import {
  computeHeading,
  computeOffset,
  pathLength,
  ringArea,
  ringPerimeter,
} from '../../util/mapLibre/geodesy';

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
