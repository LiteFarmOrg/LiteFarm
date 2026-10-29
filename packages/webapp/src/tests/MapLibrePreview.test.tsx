import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MapLibrePreview from '../containers/AddFarm/MapLibrePreview';

const { createMap, maps, markers } = vi.hoisted(() => ({
  createMap: vi.fn(),
  maps: [] as any[],
  markers: [] as any[],
}));
vi.mock('maplibre-gl', () => ({
    Map: function (options: unknown) {
      createMap(options);
      const map = {
        dragRotate: { disable: vi.fn() },
        touchZoomRotate: { disableRotation: vi.fn() },
        doubleClickZoom: { disable: vi.fn() },
        addControl: vi.fn(),
        jumpTo: vi.fn(),
        remove: vi.fn(),
      };
      maps.push(map);
      return map;
    },
    Marker: function () {
      const marker = {
        setLngLat: vi.fn().mockReturnThis(),
        addTo() {
          return this;
        },
        remove: vi.fn(),
      };
      markers.push(marker);
      return marker;
    },
    NavigationControl: vi.fn(),
    ScaleControl: vi.fn(),
}));

beforeEach(() => {
  createMap.mockClear();
  maps.length = 0;
  markers.length = 0;
});
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

  it('moves the existing map and marker when the selected coordinate changes', () => {
    const { rerender } = render(
      <MapLibrePreview
        gridPoints={{ lat: 1, lng: 2 }}
        errors={undefined}
        isGettingLocation={false}
      />,
    );
    rerender(
      <MapLibrePreview
        gridPoints={{ lat: 3, lng: 4 }}
        errors={undefined}
        isGettingLocation={false}
      />,
    );
    expect(createMap).toHaveBeenCalledTimes(1);
    expect(maps[0].jumpTo).toHaveBeenLastCalledWith({ center: [4, 3], zoom: 17 });
    expect(markers[0].setLngLat).toHaveBeenLastCalledWith([4, 3]);
    expect(maps[0].remove).not.toHaveBeenCalled();
  });

  it('removes map and marker when the point is cleared and recreates them for a new point', () => {
    const { rerender, unmount } = render(
      <MapLibrePreview
        gridPoints={{ lat: 1, lng: 2 }}
        errors={undefined}
        isGettingLocation={false}
      />,
    );
    rerender(<MapLibrePreview gridPoints={{}} errors={undefined} isGettingLocation={false} />);
    expect(maps[0].remove).toHaveBeenCalledTimes(1);
    expect(markers[0].remove).toHaveBeenCalledTimes(1);
    rerender(
      <MapLibrePreview
        gridPoints={{ lat: 3, lng: 4 }}
        errors={undefined}
        isGettingLocation={false}
      />,
    );
    expect(createMap).toHaveBeenCalledTimes(2);
    unmount();
    expect(maps[0].remove).toHaveBeenCalledTimes(1);
    expect(maps[1].remove).toHaveBeenCalledTimes(1);
    expect(markers[1].remove).toHaveBeenCalledTimes(1);
  });

  it('removes the current preview while a new geolocation request is running', () => {
    const { rerender } = render(
      <MapLibrePreview
        gridPoints={{ lat: 1, lng: 2 }}
        errors={undefined}
        isGettingLocation={false}
      />,
    );
    rerender(
      <MapLibrePreview gridPoints={{ lat: 1, lng: 2 }} errors={undefined} isGettingLocation />,
    );
    expect(maps[0].remove).toHaveBeenCalledTimes(1);
    expect(markers[0].remove).toHaveBeenCalledTimes(1);
  });
});
