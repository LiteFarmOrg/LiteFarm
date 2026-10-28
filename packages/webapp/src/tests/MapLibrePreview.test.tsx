import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MapLibrePreview from '../containers/AddFarm/MapLibrePreview';

const { createMap } = vi.hoisted(() => ({ createMap: vi.fn() }));
vi.mock('maplibre-gl', () => ({
  default: {
    Map: function (options: unknown) {
      createMap(options);
      return {
        dragRotate: { disable: vi.fn() },
        touchZoomRotate: { disableRotation: vi.fn() },
        doubleClickZoom: { disable: vi.fn() },
        addControl: vi.fn(),
        jumpTo: vi.fn(),
        remove: vi.fn(),
      };
    },
    Marker: function () {
      return {
        setLngLat() {
          return this;
        },
        addTo() {
          return this;
        },
        remove: vi.fn(),
      };
    },
    NavigationControl: vi.fn(),
    ScaleControl: vi.fn(),
  },
}));

beforeEach(() => createMap.mockClear());
afterEach(cleanup);

describe('MapLibre farm preview coordinates', () => {
  it.each([
    { lat: 0, lng: 10 },
    { lat: 10, lng: 0 },
    { lat: 0, lng: 0 },
  ])('renders a map at valid zero coordinates %j', (gridPoints) => {
    const { container } = render(
      <MapLibrePreview gridPoints={gridPoints} errors={undefined} isGettingLocation={false} />,
    );
    expect(container.querySelector('[data-cy="addFarm-maplibre-preview"]')).toBeTruthy();
    expect(createMap).toHaveBeenCalledWith(
      expect.objectContaining({ center: [gridPoints.lng, gridPoints.lat] }),
    );
  });

  it.each([
    {},
    { lat: 10 },
    { lng: 10 },
    { lat: NaN, lng: 10 },
    { lat: 10, lng: Infinity },
    { lat: -Infinity, lng: 10 },
    { lat: '0', lng: 10 },
    { lat: 0, lng: null },
  ])('does not create a map with incomplete or non-finite coordinates %j', (gridPoints) => {
    render(
      <MapLibrePreview gridPoints={gridPoints} errors={undefined} isGettingLocation={false} />,
    );
    expect(createMap).not.toHaveBeenCalled();
  });

  it('waits for geolocation even when coordinates are valid', () => {
    const { rerender } = render(
      <MapLibrePreview gridPoints={{ lat: 0, lng: 0 }} errors={undefined} isGettingLocation />,
    );
    expect(createMap).not.toHaveBeenCalled();
    rerender(
      <MapLibrePreview
        gridPoints={{ lat: 0, lng: 0 }}
        errors={undefined}
        isGettingLocation={false}
      />,
    );
    expect(createMap).toHaveBeenCalledTimes(1);
  });
});
