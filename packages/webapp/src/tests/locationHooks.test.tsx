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

  it('recomputes internal locations when loading ends without a new data reference', () => {
    queries.internal.isLoading = true;
    const raw = queries.internal.data;
    const { result, rerender } = renderHook(() =>
      useLocations({ groupBy: GroupByOptions.FIGURE_AND_TYPE }),
    );
    expect(result.current.isLoading).toBe(true);
    expect(result.current.locations).toEqual(raw);
    expect(result.current.locations).not.toBe(raw);
    queries.internal.isLoading = false;
    rerender();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.locations).toEqual({
      point: { gate: [expect.objectContaining({ location_id: 'gate', lat: 0, lng: 10 })] },
    });
    expect(queries.internal.data).toBe(raw);
  });

  it('recomputes external locations when loading ends without a new data reference', () => {
    queries.external.isLoading = true;
    const raw = queries.external.data;
    const { result, rerender } = renderHook(() =>
      useExternalLocations({ groupBy: GroupByOptions.TYPE }),
    );
    expect(result.current.isLoading).toBe(true);
    expect(result.current.locations).toEqual(raw);
    expect(result.current.locations).not.toBe(raw);
    queries.external.isLoading = false;
    rerender();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.locations).toEqual({
      sensor_array: [expect.objectContaining({ name: 'Array', figure_type: FigureType.POINT })],
      sensor: [expect.objectContaining({ sensor_id: 'standalone', figure_type: FigureType.POINT })],
    });
    expect(queries.external.data).toBe(raw);
  });

  it('invalidates memoized data when nonempty query data is replaced', () => {
    const { result, rerender } = renderHook(() => ({
      internal: useLocations(),
      external: useExternalLocations(),
    }));
    const oldInternal = result.current.internal.locations;
    const oldExternal = result.current.external.locations;
    queries.internal.data = [
      {
        location_id: 'new-gate',
        deleted: false,
        figure: { type: InternalMapLocationType.GATE, point: { lat: 3, lng: 4 } },
      },
    ];
    queries.external.data = {
      sensors: [{ sensor_id: 'new-sensor', sensor_array_id: null }],
      sensor_arrays: [],
    };
    rerender();
    expect(result.current.internal.locations).not.toBe(oldInternal);
    expect(result.current.external.locations).not.toBe(oldExternal);
    expect(result.current.internal.locations).toEqual([
      expect.objectContaining({ location_id: 'new-gate', lat: 3, lng: 4 }),
    ]);
    expect(result.current.external.locations).toEqual([
      expect.objectContaining({ sensor_id: 'new-sensor' }),
    ]);
  });

  it('keeps memoized output isolated from nested RTK Query cache data', () => {
    queries.internal.data = [
      {
        location_id: 'f',
        deleted: false,
        figure: {
          type: InternalMapLocationType.FIELD,
          area: { grid_points: [{ lat: 1, lng: 2 }] },
        },
      },
    ];
    queries.external.data = {
      sensors: [{ sensor_id: 's', sensor_array_id: null, point: { lat: 3, lng: 4 } }],
      sensor_arrays: [],
    };
    const internalBefore = structuredClone(queries.internal.data);
    const externalBefore = structuredClone(queries.external.data);
    const { result } = renderHook(() => ({
      internal: useLocations(),
      external: useExternalLocations(),
    }));
    (result.current.internal.locations![0] as any).grid_points[0].lat = 99;
    (result.current.external.locations![0] as any).point.lng = 99;
    expect(queries.internal.data).toEqual(internalBefore);
    expect(queries.external.data).toEqual(externalBefore);
  });

  it('preserves result identity with a stable filter and invalidates it when the filter changes', () => {
    const filter = [InternalMapLocationType.GATE];
    const { result, rerender } = renderHook(
      (filterBy: InternalMapLocationType[]) => useLocations({ filterBy, deleted: true }),
      { initialProps: filter },
    );
    const initial = result.current.locations;
    rerender(filter);
    expect(result.current.locations).toBe(initial);
    rerender([InternalMapLocationType.FIELD]);
    expect(result.current.locations).toEqual([expect.objectContaining({ location_id: 'field' })]);
    rerender([]);
    expect(result.current.locations).toEqual([]);
  });
});
