import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
// Evaluate store/store first, see useAuthenticatedSession.test.tsx.
import '../store/store';
import rootReducer from '../store/reducer';
import { upsertFormData } from '../containers/hooks/useHookFormPersist/hookFormPersistSlice';

// A stand-in for Terra Draw: it keeps features in a map and lets the test fire its events.
const fake = vi.hoisted(() => ({ draws: [] as any[] }));
vi.mock('terra-draw', () => {
  class Mode {}
  class FakeTerraDraw {
    features = new Map<string, any>();
    listeners: Record<string, Function[]> = {};
    mode = '';
    selected?: string;
    modeOptions: Record<string, any> = {};
    n = 0;
    constructor() {
      fake.draws.push(this);
    }
    start = vi.fn();
    stop = vi.fn();
    on(event: string, cb: Function) {
      (this.listeners[event] ||= []).push(cb);
    }
    setMode(mode: string) {
      this.mode = mode;
    }
    clear() {
      this.features.clear();
      this.selected = undefined;
    }
    updateModeOptions(mode: string, options: any) {
      this.modeOptions[mode] = { ...this.modeOptions[mode], ...options };
    }
    getFeatureId() {
      return `id-${++this.n}`;
    }
    addFeatures(features: any[]) {
      features.forEach((f) => this.features.set(f.id, f));
      return features.map((f) => ({ id: f.id, valid: true }));
    }
    getSnapshotFeature(id: string) {
      return this.features.get(id);
    }
    selectFeature(id: string) {
      this.selected = id;
    }
    // Test helpers
    finishDrawing(id: string, geometry: any, context: any = { mode: 'polygon', action: 'draw' }) {
      this.features.set(id, { id, type: 'Feature', geometry, properties: {} });
      (this.listeners.finish || []).forEach((cb) => cb(id, context));
    }
  }
  return {
    TerraDraw: FakeTerraDraw,
    TerraDrawPolygonMode: Mode,
    TerraDrawLineStringMode: Mode,
    TerraDrawMarkerMode: Mode,
    TerraDrawSelectMode: Mode,
    TerraDrawRenderMode: Mode,
  };
});
vi.mock('terra-draw-maplibre-gl-adapter', () => ({ TerraDrawMapLibreGLAdapter: class {} }));

import useMapLibreDrawing from '../containers/MapLibre/useMapLibreDrawing';

const makeMap = () => {
  const sources: Record<string, { setData: ReturnType<typeof vi.fn> }> = {};
  const layers = new Set<string>();
  return {
    sources,
    getSource: (id: string) => sources[id],
    addSource: (id: string) => {
      sources[id] = { setData: vi.fn() };
    },
    addLayer: vi.fn(({ id }) => layers.add(id)),
    getLayer: (id: string) => layers.has(id),
    removeLayer: vi.fn(),
    removeSource: vi.fn(),
    setPaintProperty: vi.fn(),
    fitBounds: vi.fn(),
  };
};

const square = (d = 0.001) => ({
  type: 'Polygon',
  coordinates: [
    [
      [0, 0],
      [d, 0],
      [d, d],
      [0, d],
      [0, 0],
    ],
  ],
});

const setup = () => {
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefault) => getDefault({ immutableCheck: false, serializableCheck: false }),
  });
  const map = makeMap();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  const hook = renderHook(() => useMapLibreDrawing({ map }), { wrapper });
  // The hook is plain JS, so its tuple is inferred as an array of unions.
  const view = {
    result: {
      get current() {
        return hook.result.current as unknown as [any, any];
      },
    },
  };
  const draw = () => fake.draws[fake.draws.length - 1];
  return { store, map, view, draw, unmount: hook.unmount };
};

describe('useMapLibreDrawing', () => {
  beforeEach(() => {
    fake.draws.length = 0;
  });
  afterEach(cleanup);

  it('draws an area, goes to editing and reports area, perimeter and vertices', async () => {
    const { view, draw } = setup();
    await waitFor(() => expect(draw()).toBeDefined());

    act(() => view.result.current[1].startDrawing('field'));
    expect(view.result.current[0]).toMatchObject({ type: 'field', isActive: true });
    expect(draw().mode).toBe('polygon');

    act(() => draw().finishDrawing('a', square()));
    expect(view.result.current[0].isActive).toBe(false);
    expect(draw().mode).toBe('select');
    expect(draw().selected).toBe('a');

    const info = view.result.current[1].getOverlayInfo();
    const side = (Math.PI / 180) * 6378137 * 0.001;
    expect(info.type).toBe('field');
    expect(info.grid_points).toHaveLength(4);
    expect(info.grid_points[1]).toEqual({ lat: 0, lng: 0.001 });
    expect(info.total_area).toBe(Math.round(side * side));
    expect(info.perimeter).toBe(Math.round(4 * side));
  });

  it('flags a zero-area shape and flags a change made while editing', async () => {
    const { view, draw } = setup();
    await waitFor(() => expect(draw()).toBeDefined());
    act(() => view.result.current[1].startDrawing('field'));
    act(() => draw().finishDrawing('a', square(0)));
    expect(view.result.current[0].showZeroAreaWarning).toBe(true);

    act(() =>
      draw().finishDrawing('a', square(0.001), { mode: 'select', action: 'dragCoordinate' }),
    );
    expect(view.result.current[0].showZeroAreaWarning).toBe(false);
    expect(view.result.current[0].pointChanged).toBe(true);
  });

  it('measures a line and its width polygon for a watercourse', async () => {
    const { view, draw, map } = setup();
    await waitFor(() => expect(draw()).toBeDefined());
    act(() => view.result.current[1].startDrawing('watercourse'));
    expect(draw().mode).toBe('linestring');
    act(() => view.result.current[1].setLineWidth(10));
    act(() =>
      draw().finishDrawing(
        'l',
        {
          type: 'LineString',
          coordinates: [
            [0, 0],
            [0.001, 0],
            [0.001, 0.001],
          ],
        },
        { mode: 'linestring', action: 'draw' },
      ),
    );
    const info = view.result.current[1].getOverlayInfo();
    expect(info.line_points).toHaveLength(3);
    expect(info.length).toBeGreaterThan(200);
    expect(info.length).toBeLessThan(230);
    // About length x width, within the corner geometry.
    expect(info.total_area).toBeGreaterThan(2000);
    expect(info.total_area).toBeLessThan(2400);
    const lastCall = map.sources['draw-width'].setData.mock.calls.at(-1)![0];
    expect(lastCall.geometry.type).toBe('Polygon');
  });

  it('uses the marker mode for a point and reports its position', async () => {
    const { view, draw } = setup();
    await waitFor(() => expect(draw()).toBeDefined());
    act(() => view.result.current[1].startDrawing('gate'));
    expect(draw().mode).toBe('marker');
    act(() =>
      draw().finishDrawing(
        'p',
        { type: 'Point', coordinates: [-2.58, 51.45] },
        { mode: 'marker', action: 'draw' },
      ),
    );
    expect(view.result.current[1].getOverlayInfo()).toEqual({
      type: 'gate',
      point: { lat: 51.45, lng: -2.58 },
    });
  });

  it('restores a persisted shape for editing when stepping back from the form', async () => {
    const { view, draw, store, map } = setup();
    await waitFor(() => expect(draw()).toBeDefined());
    act(() => {
      store.dispatch(
        upsertFormData({
          type: 'field',
          grid_points: [
            { lat: 0, lng: 0 },
            { lat: 0, lng: 0.001 },
            { lat: 0.001, lng: 0.001 },
          ],
        }),
      );
    });
    act(() => view.result.current[1].reconstructOverlay());
    await waitFor(() => expect(view.result.current[0].drawingToCheck).not.toBeNull());
    expect(view.result.current[0].type).toBe('field');
    expect(view.result.current[0].isActive).toBe(false);
    expect(draw().mode).toBe('select');
    expect(map.fitBounds).toHaveBeenCalled();
  });

  it('clears everything when the drawing is abandoned', async () => {
    const { view, draw } = setup();
    await waitFor(() => expect(draw()).toBeDefined());
    act(() => view.result.current[1].startDrawing('field'));
    act(() => draw().finishDrawing('a', square()));
    act(() => view.result.current[1].resetDrawing(true));
    act(() => view.result.current[1].closeDrawer());
    expect(view.result.current[0]).toMatchObject({ type: null, drawingToCheck: null });
    expect(draw().features.size).toBe(0);
  });

  it('reports an ordinary line without a width polygon', () => {
    const { view, draw, map } = setup();
    expect(view.result.current[1].getOverlayInfo()).toBeUndefined();
    act(() => view.result.current[1].startDrawing('fence'));
    act(() => view.result.current[1].setLineWidth(10));
    act(() =>
      draw().finishDrawing(
        'f',
        {
          type: 'LineString',
          coordinates: [
            [0, 0],
            [0.001, 0],
          ],
        },
        { mode: 'linestring', action: 'draw' },
      ),
    );
    expect(view.result.current[1].getOverlayInfo()).toEqual({
      type: 'fence',
      line_points: [
        { lat: 0, lng: 0 },
        { lat: 0, lng: 0.001 },
      ],
      length: 111,
      total_area: null,
    });
    expect(map.sources['draw-width'].setData).toHaveBeenLastCalledWith({
      type: 'FeatureCollection',
      features: [],
    });
  });

  it('recomputes a buffer-zone width preview when the width changes and clears it on reset', () => {
    const { view, draw, map } = setup();
    act(() => view.result.current[1].startDrawing('buffer_zone'));
    act(() =>
      draw().finishDrawing('b', {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [0.001, 0],
        ],
      }),
    );
    expect(view.result.current[1].getOverlayInfo().total_area).toBeNull();
    act(() => view.result.current[1].setLineWidth('10'));
    expect(view.result.current[1].getOverlayInfo().total_area).toBe(1113);
    act(() => view.result.current[1].setLineWidth(20));
    expect(view.result.current[1].getOverlayInfo().total_area).toBe(2226);
    expect(map.sources['draw-width'].setData.mock.calls.at(-1)![0].geometry.type).toBe('Polygon');
    act(() => view.result.current[1].resetDrawing());
    expect(view.result.current[1].getOverlayInfo()).toBeUndefined();
    expect(map.sources['draw-width'].setData).toHaveBeenLastCalledWith({
      type: 'FeatureCollection',
      features: [],
    });
  });

  it('warns for a zero-length line, suppresses adjustment help, and recovers after editing', () => {
    const { view, draw } = setup();
    act(() => view.result.current[1].startDrawing('fence'));
    act(() =>
      draw().finishDrawing('f', {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [0, 0],
        ],
      }),
    );
    expect(view.result.current[0]).toMatchObject({
      showZeroLengthWarning: true,
      showAdjustLineSpotlightModal: false,
    });
    act(() =>
      draw().finishDrawing(
        'f',
        {
          type: 'LineString',
          coordinates: [
            [0, 0],
            [0.001, 0],
          ],
        },
        { mode: 'select', action: 'dragCoordinate' },
      ),
    );
    expect(view.result.current[0]).toMatchObject({
      showZeroLengthWarning: false,
      pointChanged: true,
    });
    expect(view.result.current[1].getOverlayInfo().length).toBe(111);
  });

  it('starts a fresh drawing after editing an earlier shape', () => {
    const { view, draw } = setup();
    act(() => view.result.current[1].startDrawing('field'));
    act(() => draw().finishDrawing('a', square(), { mode: 'select' }));
    expect(view.result.current[0].pointChanged).toBe(true);
    act(() => view.result.current[1].startDrawing('gate'));
    expect(view.result.current[0]).toMatchObject({
      type: 'gate',
      isActive: true,
      drawingToCheck: null,
      pointChanged: false,
    });
    expect(draw().features.size).toBe(0);
    expect(draw().mode).toBe('marker');
  });

  it.each([
    { type: 'gate', point: { lat: 51, lng: -2 } },
    {
      type: 'buffer_zone',
      width: 8,
      line_points: [
        { lat: 51, lng: -2 },
        { lat: 51.001, lng: -1.999 },
      ],
    },
  ])('restores a persisted $type with its coordinates, measurement, and camera', (data) => {
    const { view, draw, store, map } = setup();
    act(() => store.dispatch(upsertFormData(data)));
    act(() => view.result.current[1].reconstructOverlay());
    expect(draw().mode).toBe('select');
    expect(draw().selected).toBeDefined();
    expect(view.result.current[1].getOverlayInfo()).toMatchObject(
      data.type === 'gate'
        ? data
        : { type: data.type, line_points: data.line_points, total_area: expect.any(Number) },
    );
    expect(map.fitBounds).toHaveBeenCalledWith(
      data.type === 'gate'
        ? [
            [-2, 51],
            [-2, 51],
          ]
        : [
            [-2, 51],
            [-1.999, 51.001],
          ],
      { padding: 60, maxZoom: 19, duration: 0 },
    );
  });

  it('does not restore an absent or invalid persisted feature', () => {
    const { view, draw, store, map } = setup();
    act(() => view.result.current[1].reconstructOverlay());
    expect(view.result.current[0].drawingToCheck).toBeNull();
    expect(map.fitBounds).not.toHaveBeenCalled();
    act(() => store.dispatch(upsertFormData({ type: 'gate', point: { lat: 1, lng: 2 } })));
    vi.spyOn(draw(), 'addFeatures').mockReturnValue([{ valid: false }]);
    act(() => view.result.current[1].reconstructOverlay());
    expect(view.result.current[0].drawingToCheck).toBeNull();
    expect(map.fitBounds).not.toHaveBeenCalled();
  });

  it('stops Terra Draw and removes its width layers and source on unmount', () => {
    const { draw, map, unmount } = setup();
    const instance = draw();
    unmount();
    expect(instance.stop).toHaveBeenCalledTimes(1);
    expect(map.removeLayer.mock.calls).toEqual([['draw-width-fill'], ['draw-width-outline']]);
    expect(map.removeSource).toHaveBeenCalledWith('draw-width');
  });
});
