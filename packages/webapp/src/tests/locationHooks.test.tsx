import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useLocations from '../hooks/location/useLocations';
import useExternalLocations from '../hooks/location/useExternalLocations';
import { ExternalMapLocationType, GroupByOptions } from '../hooks/location/types';
import { FigureType, InternalMapLocationType } from '../store/api/types';

const queries = vi.hoisted(() => ({
  internal: { data: [] as unknown[], isLoading: false, isFetching: false },
  external: {
    data: { sensors: [] as unknown[], sensor_arrays: [] as unknown[] },
    isLoading: false,
    isFetching: false,
  },
}));
vi.mock('../store/api/locationApi', () => ({ useGetLocationsQuery: () => queries.internal }));
vi.mock('../store/api/apiSlice', () => ({ useGetSensorsQuery: () => queries.external }));

type InternalOptions = Parameters<typeof useLocations>[0];
type ExternalOptions = Parameters<typeof useExternalLocations>[0];

beforeEach(() => {
  queries.internal = {
    data: [
      {
        location_id: 'gate',
        deleted: false,
        figure: { type: InternalMapLocationType.GATE, point: { lat: 0, lng: 10 } },
      },
      {
        location_id: 'field',
        deleted: true,
        figure: { type: InternalMapLocationType.FIELD, area: { total_area: 10 } },
      },
    ],
    isLoading: false,
    isFetching: false,
  };
  queries.external = {
    data: {
      sensors: [
        { sensor_id: 'standalone', sensor_array_id: null },
        { sensor_id: 'member', sensor_array_id: 'array' },
      ],
      sensor_arrays: [{ sensor_array_id: 'array', label: 'Array' }],
    },
    isLoading: false,
    isFetching: false,
  };
});
afterEach(cleanup);

describe('memoized location results', () => {
  it.each([undefined, GroupByOptions.TYPE, GroupByOptions.FIGURE, GroupByOptions.FIGURE_AND_TYPE])(
    'keeps both location results stable for groupBy %s, including during refetch',
    (groupBy) => {
      const { result, rerender } = renderHook(() => ({
        internal: useLocations({ groupBy }),
        external: useExternalLocations({ groupBy }),
      }));
      const initial = result.current;
      queries.internal.isFetching = true;
      queries.external.isFetching = true;
      rerender();
      expect(result.current.internal.locations).toBe(initial.internal.locations);
      expect(result.current.external.locations).toBe(initial.external.locations);
      expect(result.current.internal.isFetching).toBe(true);
      expect(result.current.external.isFetching).toBe(true);
    },
  );

  it('updates internal results when deletion, filtering, grouping or raw data changes', () => {
    const originalData = structuredClone(queries.internal.data);
    const { result, rerender } = renderHook((options: InternalOptions) => useLocations(options), {
      initialProps: {} as InternalOptions,
    });
    expect(result.current.locations).toEqual([
      expect.objectContaining({ location_id: 'gate', lat: 0, lng: 10, figure_type: 'point' }),
    ]);
    rerender({ deleted: true });
    expect(result.current.locations).toHaveLength(2);
    rerender({ deleted: true, filterBy: [InternalMapLocationType.FIELD] });
    expect(result.current.locations).toEqual([expect.objectContaining({ location_id: 'field' })]);
    rerender({ filterBy: FigureType.POINT });
    expect(result.current.locations).toEqual([expect.objectContaining({ location_id: 'gate' })]);
    rerender({ groupBy: GroupByOptions.FIGURE_AND_TYPE });
    expect(result.current.locations).toEqual({
      point: { gate: [expect.objectContaining({ location_id: 'gate' })] },
    });
    expect(queries.internal.data).toEqual(originalData);
    queries.internal.data = [];
    rerender({ groupBy: GroupByOptions.FIGURE_AND_TYPE });
    expect(result.current.locations).toEqual([]);
    const empty = result.current.locations;
    rerender({ groupBy: GroupByOptions.FIGURE_AND_TYPE });
    expect(result.current.locations).toBe(empty);
  });

  it('updates external results when filtering, grouping or raw data changes', () => {
    const originalData = structuredClone(queries.external.data);
    const { result, rerender } = renderHook(
      (options: ExternalOptions) => useExternalLocations(options),
      { initialProps: {} as ExternalOptions },
    );
    expect(result.current.locations).toEqual([
      expect.objectContaining({ sensor_array_id: 'array', name: 'Array' }),
      expect.objectContaining({ sensor_id: 'standalone', isAddonSensor: true }),
    ]);
    const filterBy = [ExternalMapLocationType.SENSOR];
    rerender({ filterBy });
    expect(result.current.locations).toEqual([
      expect.objectContaining({ sensor_id: 'standalone' }),
    ]);
    const filtered = result.current.locations;
    rerender({ filterBy });
    expect(result.current.locations).toBe(filtered);
    rerender({ filterBy: ExternalMapLocationType.SENSOR_ARRAY });
    expect(result.current.locations).toEqual([expect.objectContaining({ name: 'Array' })]);
    rerender({ filterBy: FigureType.AREA });
    expect(result.current.locations).toEqual([]);
    rerender({ groupBy: GroupByOptions.FIGURE_AND_TYPE });
    expect(result.current.locations).toEqual({
      point: {
        sensor: [expect.objectContaining({ sensor_id: 'standalone' })],
        sensor_array: [expect.objectContaining({ name: 'Array' })],
      },
    });
    expect(queries.external.data).toEqual(originalData);
    queries.external.data = { sensors: [], sensor_arrays: [] };
    rerender({ groupBy: GroupByOptions.FIGURE_AND_TYPE });
    expect(result.current.locations).toEqual([]);
    const empty = result.current.locations;
    rerender({ groupBy: GroupByOptions.FIGURE_AND_TYPE });
    expect(result.current.locations).toBe(empty);
  });
});
