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

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Exercise React's data/event wiring without WebGL, tiles, or a backend.
const harness = vi.hoisted(() => ({
  maps: [] as any[],
  markers: [] as any[],
  state: {} as any,
  internal: {} as any,
  external: {} as any,
  route: { state: undefined as any },
  drawing: {} as any,
  drawingFunctions: {} as Record<string, ReturnType<typeof vi.fn>>,
  footer: {} as any,
  drawingManager: {} as any,
  exportModal: {} as any,
  capture: vi.fn(),
  saveAs: vi.fn(),
  navigate: vi.fn(),
  dispatch: vi.fn(),
}));

vi.mock('maplibre-gl', () => ({
    Map: class {
      sources: Record<string, any> = {};
      handlers: Record<string, Function> = {};
      canvas = document.createElement('canvas');
      dragRotate = { disable: vi.fn() };
      touchZoomRotate = { disableRotation: vi.fn(), disable: vi.fn() };
      dragPan = { disable: vi.fn() };
      scrollZoom = { disable: vi.fn() };
      doubleClickZoom = { disable: vi.fn() };
      keyboard = { disable: vi.fn() };
      addControl = vi.fn();
      addLayer = vi.fn();
      setFeatureState = vi.fn();
      setFilter = vi.fn();
      setLayoutProperty = vi.fn();
      queryRenderedFeatures = vi.fn().mockReturnValue([]);
      fitBounds = vi.fn();
      jumpTo = vi.fn();
      remove = vi.fn();
      constructor(public options: any) {
        harness.maps.push(this);
      }
      on(event: string, layerOrHandler: string | Function, handler?: Function) {
        this.handlers[typeof layerOrHandler === 'string' ? `${event}:${layerOrHandler}` : event] =
          handler ?? (layerOrHandler as Function);
      }
      emit(event: string, payload: any = {}) {
        this.handlers[event]?.(payload);
      }
      addSource(id: string, options: any) {
        this.sources[id] = { options, setData: vi.fn() };
      }
      getSource(id: string) {
        return this.sources[id];
      }
      getCanvas() {
        return this.canvas;
      }
      getCenter() {
        return { lat: 51, lng: -2 };
      }
      getZoom() {
        return 16;
      }
    },
    Marker: class {
      setLngLat = vi.fn().mockReturnThis();
      addTo = vi.fn().mockReturnThis();
      remove = vi.fn();
      constructor(public options: any) {
        harness.markers.push(this);
      }
      getElement() {
        return this.options.element as HTMLElement;
      }
    },
    LngLatBounds: class {
      positions: number[][] = [];
      extend(position: number[]) {
        this.positions.push(position);
        return this;
      }
    },
    NavigationControl: class {},
}));
vi.mock('../store/getFromReduxStore', () => ({
  getMeasurementFromStore: () => 'metric',
  getCurrencyFromStore: () => 'USD',
}));
vi.mock('html2canvas', () => ({ default: harness.capture }));
vi.mock('file-saver', () => ({ saveAs: harness.saveAs }));
vi.mock('react-redux', () => ({
  useSelector: (selector: Function) => selector(harness.state),
  useDispatch: () => harness.dispatch,
}));
vi.mock('react-router-dom', () => ({
  useNavigate: () => harness.navigate,
  useLocation: () => harness.route,
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}));
vi.mock('../hooks/location/useLocations', () => ({ default: () => harness.internal }));
vi.mock('../hooks/location/useExternalLocations', () => ({ default: () => harness.external }));
vi.mock('../containers/MapLibre/useMapLibreDrawing', () => ({
  default: () => [harness.drawing, harness.drawingFunctions],
}));
vi.mock('../containers/Map/useAvailableFilterSettings', () => ({ default: () => ({}) }));
vi.mock('../containers/hooks/useOfflineDetector/useIsOffline', () => ({
  useIsOffline: () => false,
}));
vi.mock('../containers/Map/saga', () => ({
  sendMapToEmail: (payload: string) => ({ type: 'test/email', payload }),
  setSpotlightToShown: vi.fn(),
}));
vi.mock('../components/Map/Header', () => ({ default: () => null }));
vi.mock('../components/Map/Footer', () => ({
  default: (props: any) => {
    harness.footer = props;
    return null;
  },
}));
vi.mock('../components/Map/DrawingManager', () => ({
  default: (props: any) => {
    harness.drawingManager = props;
    return null;
  },
}));
vi.mock('../components/Map/Modals/DrawArea', () => ({ default: () => null }));
vi.mock('../components/Map/Modals/DrawLine', () => ({ default: () => null }));
vi.mock('../components/Map/Modals/AdjustArea', () => ({ default: () => null }));
vi.mock('../components/Map/Modals/AdjustLine', () => ({ default: () => null }));
vi.mock('../components/PureSnackbar', () => ({ PureSnackbarWithoutBorder: () => null }));
vi.mock('../containers/Map/LocationSelectionModal', () => ({ default: () => null }));
vi.mock('../components/Modals/ExportMapModal', () => ({
  default: (props: any) => {
    harness.exportModal = props;
    return null;
  },
}));
vi.mock('../components/Loading/LoadingV2', () => ({ LoadingBackdrop: () => null }));
vi.mock('../components/LocationPicker/SingleLocationPicker/PureMapLocationSelectionModal', () => ({
  default: ({ locations, onSelect, dismissSelectionModal }: any) => (
    <div role="dialog">
      {locations.map((location: any) => (
        <button key={location.location_id} onClick={() => onSelect(location.location_id)}>
          {location.name}
        </button>
      ))}
      <button onClick={dismissSelectionModal}>Dismiss</button>
    </div>
  ),
}));

import MapLibreMap from '../containers/MapLibre';
import MapLibreLocationPicker from '../components/LocationPicker/SingleLocationPicker/MapLibreLocationPicker';
import { GestureHandling } from '../components/LocationPicker/SingleLocationPicker/types';
import { icons, hoverIcons, selectedIcons } from '../containers/Map/mapStyles';
import {
  canShowSelection,
  locations as selectionLocations,
  setPosition,
  setZoomLevel,
} from '../containers/mapSlice';
import {
  upsertFormData,
  setIsRedrawing,
  setPersistedPaths,
} from '../containers/hooks/useHookFormPersist/hookFormPersistSlice';

const field = {
  location_id: 'field',
  name: 'Field',
  type: 'field',
  grid_points: [
    { lat: 51, lng: -2 },
    { lat: 51, lng: -1.999 },
    { lat: 51.001, lng: -1.999 },
  ],
};
const gate = { location_id: 'gate', name: 'Gate', type: 'gate', point: { lat: 51, lng: -2 } };
const hit = (location = field, asset = 'area') => ({ properties: { ...location, asset } });
const lastMap = () => harness.maps[harness.maps.length - 1];
const loadMap = () => act(() => lastMap().emit('load'));
const clickMap = () =>
  act(() => lastMap().emit('click', { point: { x: 10, y: 10 }, lngLat: { lat: 52, lng: -3 } }));

beforeEach(() => {
  vi.clearAllMocks();
  harness.maps.length = 0;
  harness.markers.length = 0;
  harness.internal = { locations: {}, isFetching: false };
  harness.external = { locations: {}, isLoading: false };
  harness.route = { state: undefined };
  harness.drawing = { type: null, pointChanged: false };
  harness.drawingFunctions = Object.fromEntries(
    [
      'startDrawing',
      'resetDrawing',
      'closeDrawer',
      'getOverlayInfo',
      'reconstructOverlay',
      'setLineWidth',
      'setShowAdjustAreaSpotlightModal',
      'setShowAdjustLineSpotlightModal',
      'setZeroAreaWarning',
      'setShowZeroLengthWarning',
    ].map((name) => [name, vi.fn()]),
  );
  harness.state = {
    entitiesReducer: {
      userFarmReducer: {
        farm_id: 'farm',
        user_id: 'user',
        byFarmIdUserId: {
          farm: {
            user: {
              farm_id: 'farm',
              farm_name: 'Test farm',
              role_id: 1,
              grid_points: { lat: 51, lng: -2 },
              units: { measurement: 'metric' },
            },
          },
        },
      },
      showedSpotlightReducer: { map: true, draw_area: true, draw_line: true },
      mapAddDrawerReducer: { ids: [], entities: {} },
    },
    persistedStateReducer: { mapFilterSettingReducer: { ids: [], entities: {} } },
    tempStateReducer: {
      mapLocationReducer: { canShowSuccessHeader: false, successMessage: null },
      hookFormPersistReducer: { formData: {}, persistedPaths: [], isRedrawing: false },
    },
  };
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('MapLibre farm map', () => {
  it('clears a completed plan when settings or the survey file change', async () => {
    class FakeWorker {
      listeners = new Set<(event: any) => void>();
      addEventListener(type: string, listener: (event: any) => void) {
        if (type === 'message') this.listeners.add(listener);
      }
      removeEventListener(type: string, listener: (event: any) => void) {
        if (type === 'message') this.listeners.delete(listener);
      }
      postMessage({ id, req }: any) {
        queueMicrotask(() =>
          this.listeners.forEach((listener) =>
            listener({
              data: { id, ok: true, result: { rows: [], tags: [], contour: req.c, asked: req.c } },
            }),
          ),
        );
      }
      terminate() {}
    }
    vi.stubGlobal('Worker', FakeWorker);
    harness.internal.locations = { area: { field: [field] } };
    render(<MapLibreMap isCompactSideMenu={false} />);
    loadMap();
    fireEvent.click(screen.getByText('FARM_MAP.ROW_PLANNER.TITLE'));
    const plan = () => fireEvent.click(screen.getByText('FARM_MAP.ROW_PLANNER.PLAN'));
    const download = () => screen.getByText('FARM_MAP.ROW_PLANNER.DOWNLOAD') as HTMLButtonElement;
    plan();
    await waitFor(() => expect(download().disabled).toBe(false));
    fireEvent.change(screen.getByDisplayValue('5'), { target: { value: '3' } });
    expect(download().disabled).toBe(true);

    fireEvent.click(screen.getByLabelText('FARM_MAP.ROW_PLANNER.CONTOUR'));
    const csv = 'x,y,lat,lon,alt\n0,0,51,-2,1\n1,0,51,-2,2\n0,1,51,-2,3';
    const survey = screen.getByLabelText('FARM_MAP.ROW_PLANNER.SURVEY');
    fireEvent.change(survey, { target: { files: [new File([csv], 'survey.csv')] } });
    await waitFor(() =>
      expect(screen.getByText('FARM_MAP.ROW_PLANNER.SURVEY_LOADED')).toBeTruthy(),
    );
    plan();
    await waitFor(() => expect(download().disabled).toBe(false));
    fireEvent.change(survey, { target: { files: [new File(['invalid'], 'invalid.csv')] } });
    expect(download().disabled).toBe(true);
    await waitFor(() =>
      expect(screen.getByText('FARM_MAP.ROW_PLANNER.ERRORS.SURVEY_COLUMNS')).toBeTruthy(),
    );
  });

  it('pushes internal and external assets into map sources, fits once, and cleans up all markers', () => {
    harness.internal.locations = { area: { field: [field] }, point: { gate: [gate] } };
    harness.external.locations = {
      point: { sensor: [{ ...gate, location_id: 'sensor', type: 'sensor', isAddonSensor: true }] },
    };
    const { rerender, unmount } = render(<MapLibreMap isCompactSideMenu={false} />);
    loadMap();
    const map = lastMap();
    expect(map.options.center).toEqual([-2, 51]);
    expect(map.options.canvasContextAttributes.preserveDrawingBuffer).toBe(true);
    expect(map.sources.areas.setData.mock.calls.at(-1)[0].features).toHaveLength(1);
    expect(harness.markers.map((m) => m.getElement().textContent || m.getElement().alt)).toEqual([
      'Gate',
      'Gate',
      'Field',
    ]);
    expect(map.fitBounds).toHaveBeenCalledTimes(1);
    const oldMarkers = [...harness.markers];
    harness.internal = { ...harness.internal, locations: { area: { field: [field] } } };
    rerender(<MapLibreMap isCompactSideMenu={false} />);
    expect(oldMarkers.every((m) => m.remove.mock.calls.length === 1)).toBe(true);
    expect(map.fitBounds).toHaveBeenCalledTimes(1);
    const currentMarkers = harness.markers.slice(oldMarkers.length);
    unmount();
    expect(map.remove).toHaveBeenCalledTimes(1);
    expect(currentMarkers.every((m) => m.remove.mock.calls.length === 1)).toBe(true);
  });

  it('shows a farm pin when there are no location bounds', () => {
    render(<MapLibreMap isCompactSideMenu={false} />);
    loadMap();
    expect(harness.markers).toHaveLength(1);
    expect(harness.markers[0].options.anchor).toBe('bottom');
    expect(harness.markers[0].setLngLat).toHaveBeenCalledWith([-2, 51]);
    expect(lastMap().fitBounds).not.toHaveBeenCalled();
  });

  it('adds and removes a soil overlay from the soil layer control, below the locations', () => {
    render(<MapLibreMap isCompactSideMenu={false} />);
    loadMap();
    const map = lastMap();
    fireEvent.click(screen.getByRole('button', { name: 'FARM_MAP.SOIL_LAYERS.TITLE' }));
    // Farm at 51, -2 is outside the regional datasets, so only SoilGrids layers are offered.
    expect(screen.getAllByRole('radio')).toHaveLength(5);
    expect(map.sources['soil-overlay']).toBeUndefined();
    fireEvent.click(screen.getByLabelText('FARM_MAP.SOIL_LAYERS.PH'));
    expect(map.sources['soil-overlay'].options.tiles[0]).toContain('phh2o_0-5cm_mean');
    expect(map.addLayer).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'soil-overlay-raster', type: 'raster' }),
      undefined,
    );
  });

  it('deduplicates hits from line and buffer layers before navigating and preserves the camera', () => {
    render(<MapLibreMap isCompactSideMenu={false} />);
    loadMap();
    lastMap().queryRenderedFeatures.mockReturnValue([hit(), hit()]);
    clickMap();
    expect(harness.navigate).toHaveBeenCalledTimes(1);
    expect(harness.navigate).toHaveBeenCalledWith('/field/field/details');
    expect(harness.dispatch).toHaveBeenCalledWith(setPosition({ lat: 51, lng: -2 }));
    expect(harness.dispatch).toHaveBeenCalledWith(setZoomLevel(16));
  });

  it.each([true, 'true', false, 'false'])(
    'routes add-on sensors according to the serialized flag %j',
    (isAddonSensor) => {
      render(<MapLibreMap isCompactSideMenu={false} />);
      loadMap();
      lastMap().queryRenderedFeatures.mockReturnValue([
        { properties: { location_id: 's', type: 'sensor', asset: 'point', isAddonSensor } },
      ]);
      clickMap();
      expect(harness.navigate).toHaveBeenCalledWith(
        isAddonSensor === true || isAddonSensor === 'true' ? '/sensor/s' : '/sensor/s/details',
      );
    },
  );

  it('opens selection for distinct overlapping locations and hides it on empty clicks', () => {
    render(<MapLibreMap isCompactSideMenu={false} />);
    loadMap();
    lastMap().queryRenderedFeatures.mockReturnValue([hit(), hit(gate as any, 'point'), hit()]);
    clickMap();
    expect(harness.navigate).not.toHaveBeenCalled();
    expect(harness.dispatch).toHaveBeenCalledWith(canShowSelection(true));
    expect(harness.dispatch).toHaveBeenCalledWith(
      selectionLocations([
        { id: 'field', name: 'Field', type: 'field', asset: 'area', isAddonSensor: false },
        { id: 'gate', name: 'Gate', type: 'gate', asset: 'point', isAddonSensor: false },
      ]),
    );
    lastMap().queryRenderedFeatures.mockReturnValue([]);
    clickMap();
    expect(harness.dispatch).toHaveBeenLastCalledWith(canShowSelection(false));
  });

  it('ignores prevented clicks and location selection while drawing', () => {
    const { rerender } = render(<MapLibreMap isCompactSideMenu={false} />);
    loadMap();
    act(() => lastMap().emit('click', { defaultPrevented: true }));
    harness.drawing = { type: 'field' };
    rerender(<MapLibreMap isCompactSideMenu={false} />);
    clickMap();
    expect(lastMap().queryRenderedFeatures).not.toHaveBeenCalled();
    expect(harness.navigate).not.toHaveBeenCalled();
  });

  it('updates imagery, labels and point visibility when filters change', () => {
    harness.internal.locations = { area: { field: [field] }, point: { gate: [gate] } };
    const { rerender } = render(<MapLibreMap isCompactSideMenu={false} />);
    loadMap();
    const map = lastMap();
    harness.state = {
      ...harness.state,
      persistedStateReducer: {
        mapFilterSettingReducer: {
          ids: ['farm'],
          entities: { farm: { field: false, gate: false, label: false, map_background: false } },
        },
      },
    };
    rerender(<MapLibreMap isCompactSideMenu={false} />);
    expect(map.setLayoutProperty).toHaveBeenLastCalledWith('imagery', 'visibility', 'none');
    expect(map.setFilter).toHaveBeenCalledWith('areas-fill', [
      'in',
      ['get', 'type'],
      ['literal', []],
    ]);
    expect(harness.markers.every((marker) => marker.getElement().style.display === 'none')).toBe(
      true,
    );
  });

  it('restores a stepped-back drawing and camera without fitting to current locations', () => {
    harness.route = {
      state: { isStepBack: true, cameraInfo: { zoom: 14, location: { lat: 5, lng: 6 } } },
    };
    harness.internal.locations = { area: { field: [field] } };
    render(<MapLibreMap isCompactSideMenu={false} />);
    loadMap();
    expect(harness.drawingFunctions.reconstructOverlay).toHaveBeenCalledTimes(1);
    expect(lastMap().jumpTo).toHaveBeenCalledWith({ zoom: 14, center: [6, 5] });
    expect(lastMap().fitBounds).not.toHaveBeenCalled();
  });

  it('initializes a watercourse drawing and persists confirmed line data', () => {
    const { rerender } = render(<MapLibreMap isCompactSideMenu={false} />);
    loadMap();
    act(() => harness.footer.onAddMenuClick('watercourse'));
    expect(harness.dispatch).toHaveBeenCalledWith(upsertFormData({ width: 1, buffer_width: 15 }));
    expect(harness.dispatch).toHaveBeenCalledWith(
      setPersistedPaths(['/create_location/watercourse', '/map']),
    );
    expect(harness.drawingFunctions.startDrawing).toHaveBeenCalledWith('watercourse');
    harness.drawing = { type: 'watercourse', isActive: false };
    harness.drawingFunctions.getOverlayInfo.mockReturnValue({
      type: 'watercourse',
      line_points: [
        { lat: 1, lng: 2 },
        { lat: 3, lng: 4 },
      ],
      length: 10,
    });
    rerender(<MapLibreMap isCompactSideMenu={false} />);
    act(() => harness.drawingManager.confirmLine({ width: 3, buffer_width: 4 }));
    expect(harness.dispatch).toHaveBeenCalledWith(
      upsertFormData({
        width: 3,
        buffer_width: 4,
        type: 'watercourse',
        line_points: [
          { lat: 1, lng: 2 },
          { lat: 3, lng: 4 },
        ],
        length: 10,
      }),
    );
    expect(harness.dispatch).toHaveBeenCalledWith(setIsRedrawing(false));
    expect(harness.navigate).toHaveBeenCalledWith('/create_location/watercourse');
  });
  it('waits for location fetching before fitting once', () => {
    harness.internal = { locations: { area: { field: [field] } }, isFetching: true };
    const { rerender } = render(<MapLibreMap isCompactSideMenu={false} />);
    loadMap();
    expect(lastMap().fitBounds).not.toHaveBeenCalled();
    harness.internal = { ...harness.internal, isFetching: false };
    rerender(<MapLibreMap isCompactSideMenu={false} />);
    expect(lastMap().fitBounds).toHaveBeenCalledTimes(1);
    expect(harness.maps).toHaveLength(1);
  });

  it.each([false, true])(
    'preserves persisted geometry unless the user redraws (redrawing: %s)',
    (isRedrawing) => {
      const original = { type: 'field', name: 'Original field', grid_points: [{ lat: 0, lng: 0 }] };
      harness.route = { state: { isStepBack: true } };
      harness.state.tempStateReducer.hookFormPersistReducer = {
        formData: original,
        isRedrawing,
        persistedPaths: ['/map', '/create_location/field'],
      };
      harness.drawing = { type: 'field', isActive: false };
      const updated = { type: 'field', grid_points: field.grid_points, total_area: 100 };
      harness.drawingFunctions.getOverlayInfo.mockReturnValue(updated);
      render(<MapLibreMap isCompactSideMenu={false} />);
      loadMap();
      harness.dispatch.mockClear();
      act(() => harness.drawingManager.onClickConfirm());
      if (isRedrawing) {
        expect(harness.dispatch).toHaveBeenCalledWith(upsertFormData(updated));
        expect(harness.dispatch).toHaveBeenCalledWith(setIsRedrawing(false));
      } else {
        expect(harness.dispatch).not.toHaveBeenCalled();
      }
      expect(harness.navigate).toHaveBeenCalledWith('/create_location/field');
    },
  );

  it('exports the rendered map to a PNG and shares the captured image', async () => {
    const blob = new Blob(['synthetic map'], { type: 'image/png' });
    const canvas = {
      toBlob: (callback: (blob: Blob) => void) => callback(blob),
      toDataURL: () => 'data:image/png;base64,c3ludGhldGlj',
    };
    harness.capture.mockResolvedValue(canvas);
    render(<MapLibreMap isCompactSideMenu={false} />);
    loadMap();
    act(() => harness.footer.onClickExport());
    await act(async () => harness.exportModal.onClickDownload());
    expect(harness.capture).toHaveBeenCalledWith(expect.any(HTMLElement), { useCORS: true });
    expect(harness.saveAs).toHaveBeenCalledWith(
      blob,
      expect.stringMatching(/^Test farm-export-.*\.png$/),
    );
    await act(async () => harness.exportModal.onClickShare());
    expect(harness.dispatch).toHaveBeenCalledWith({
      type: 'test/email',
      payload: 'data:image/png;base64,c3ludGhldGlj',
    });
  });
});

const renderPicker = (overrides: Record<string, any> = {}) => {
  const props = {
    isPinMode: false,
    pinCoordinate: undefined,
    style: undefined,
    readOnlyPinCoordinates: undefined,
    locations: [field, gate],
    farmCenterCoordinate: { lat: 51, lng: -2 },
    onSelectLocation: vi.fn(),
    setPinCoordinate: vi.fn(),
    clearLocations: vi.fn(),
    ...overrides,
  };
  const view = render(<MapLibreLocationPicker {...props} />);
  loadMap();
  return { ...view, props, map: lastMap() };
};

describe('MapLibre location picker', () => {
  it('deduplicates hits, selects a single location, and uses the latest callback after rerender', () => {
    const { map, props, rerender } = renderPicker();
    map.queryRenderedFeatures.mockReturnValue([hit(), hit()]);
    clickMap();
    expect(props.onSelectLocation).toHaveBeenCalledTimes(1);
    expect(props.onSelectLocation).toHaveBeenCalledWith('field');
    const nextSelect = vi.fn();
    rerender(<MapLibreLocationPicker {...props} onSelectLocation={nextSelect} />);
    clickMap();
    expect(nextSelect).toHaveBeenCalledTimes(1);
    expect(nextSelect).toHaveBeenCalledWith('field');
    expect(harness.maps).toHaveLength(1);
  });

  it('lets the user resolve overlapping locations and dismisses the modal after selection', () => {
    const { map, props } = renderPicker();
    map.queryRenderedFeatures.mockReturnValue([
      hit(),
      hit({ ...field, location_id: 'garden', name: 'Garden', type: 'garden' }),
      hit(),
    ]);
    clickMap();
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getAllByRole('button')).toHaveLength(3);
    expect(props.onSelectLocation).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Garden' }));
    expect(props.onSelectLocation).toHaveBeenCalledWith('garden');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('ignores empty and prevented clicks without changing the selection', () => {
    const { map, props } = renderPicker();
    clickMap();
    map.queryRenderedFeatures.mockClear();
    act(() => map.emit('click', { defaultPrevented: true }));
    expect(map.queryRenderedFeatures).not.toHaveBeenCalled();
    expect(props.onSelectLocation).not.toHaveBeenCalled();
  });

  it('sets pin coordinates, clears selected locations, and uses a crosshair in pin mode', () => {
    const { map, props } = renderPicker({ isPinMode: true, pinCoordinate: { lat: 0, lng: 0 } });
    clickMap();
    expect(props.setPinCoordinate).toHaveBeenCalledWith({ lat: 52, lng: -3 });
    expect(props.clearLocations).toHaveBeenCalledTimes(1);
    expect(props.onSelectLocation).not.toHaveBeenCalled();
    expect(map.queryRenderedFeatures).not.toHaveBeenCalled();
    expect(map.getCanvas().style.cursor).toBe('crosshair');
    const pin = harness.markers.find((m) => m.options.anchor === 'bottom');
    expect(pin.setLngLat).toHaveBeenCalledWith([0, 0]);
  });

  it('restyles selected point icons and feature state when selection changes', () => {
    const { map, props, rerender } = renderPicker({ selectedLocationIds: ['gate', 'field'] });
    const point = harness.markers
      .find((m) => m.getElement().alt === 'Gate')
      .getElement() as HTMLImageElement;
    expect(point.getAttribute('src')).toBe(selectedIcons.gate);
    rerender(<MapLibreLocationPicker {...props} selectedLocationIds={[]} />);
    expect(point.getAttribute('src')).toBe(icons.gate);
    for (const source of ['areas', 'lines', 'line-buffers']) {
      expect(map.setFeatureState).toHaveBeenCalledWith(
        { source, id: 'field' },
        { selected: false },
      );
    }
    fireEvent.mouseEnter(point);
    expect(point.getAttribute('src')).toBe(hoverIcons.gate);
    fireEvent.mouseLeave(point);
    expect(point.getAttribute('src')).toBe(icons.gate);
    fireEvent.click(point);
    expect(props.onSelectLocation).toHaveBeenCalledWith('gate');
  });

  it('suppresses point hover and selection in pin mode', () => {
    const { props } = renderPicker({ isPinMode: true });
    const point = harness.markers.find((m) => m.getElement().alt === 'Gate').getElement();
    fireEvent.mouseEnter(point);
    fireEvent.click(point);
    expect(point.getAttribute('src')).toBe(icons.gate);
    expect(props.onSelectLocation).not.toHaveBeenCalled();
  });

  it('clears hover on the previous source when a different feature is hovered', () => {
    const { map } = renderPicker();
    act(() => map.emit('mousemove:areas-fill', { features: [{ id: 'field' }] }));
    act(() => map.emit('mousemove:line-buffers-fill', { features: [{ id: 'stream' }] }));
    expect(map.setFeatureState.mock.calls).toEqual([
      [{ source: 'areas', id: 'field' }, { hover: true }],
      [{ source: 'areas', id: 'field' }, { hover: false }],
      [{ source: 'line-buffers', id: 'stream' }, { hover: true }],
    ]);
    act(() => map.emit('mouseleave:line-buffers-fill'));
    expect(map.setFeatureState).toHaveBeenLastCalledWith(
      { source: 'line-buffers', id: 'stream' },
      { hover: false },
    );
    expect(map.getCanvas().style.cursor).toBe('');
  });

  it('honors disabled hover, controls and gesture settings', () => {
    const { map } = renderPicker({
      disableHover: true,
      showControls: false,
      gestureHandling: GestureHandling.NONE,
    });
    act(() => map.emit('mousemove:areas-fill', { features: [{ id: 'field' }] }));
    expect(map.setFeatureState).not.toHaveBeenCalled();
    expect(map.addControl).not.toHaveBeenCalled();
    for (const key of ['dragPan', 'scrollZoom', 'doubleClickZoom', 'touchZoomRotate', 'keyboard']) {
      expect(map[key].disable).toHaveBeenCalledTimes(1);
    }
  });

  it('enables cooperative gestures when requested', () => {
    const { map } = renderPicker({ gestureHandling: GestureHandling.COOPERATIVE });
    expect(map.options.cooperativeGestures).toBe(true);
  });

  it('converts pivot circles to polygons and skips invalid pivots and unknown types', () => {
    const { map } = renderPicker({
      locations: [
        {
          location_id: 'pivot',
          name: 'Pivot',
          type: 'pivot',
          center: { lat: 0, lng: 0 },
          radius: 100,
        },
        { location_id: 'invalid', type: 'pivot', radius: 0 },
        { location_id: 'unknown', type: 'unknown' },
      ],
    });
    const features = map.sources.areas.setData.mock.calls.at(-1)[0].features;
    expect(features).toHaveLength(1);
    expect(features[0]).toMatchObject({
      properties: { location_id: 'pivot' },
      geometry: { type: 'Polygon' },
    });
    const ring = features[0].geometry.coordinates[0];
    expect(ring[0]).toEqual(ring.at(-1));
    expect(Math.max(...ring.map((p: number[]) => p[1]))).toBeCloseTo(0.0009, 5);
  });

  it('includes pins in the initial bounds, preserves the camera on updates, and cleans up on unmount', () => {
    const { map, props, rerender, unmount } = renderPicker({
      readOnlyPinCoordinates: [{ lat: 52, lng: -3 }],
    });
    expect(map.fitBounds.mock.calls[0][0].positions).toContainEqual([-3, 52]);
    const oldMarkers = [...harness.markers];
    rerender(<MapLibreLocationPicker {...props} locations={[gate]} />);
    expect(map.fitBounds).toHaveBeenCalledTimes(1);
    // The pin marker is managed separately and is removed when pin mode is inactive.
    const contentMarkers = oldMarkers.filter(
      (m) => m.options.anchor !== 'bottom' || m.addTo.mock.calls.length,
    );
    expect(contentMarkers.every((m) => m.remove.mock.calls.length === 1)).toBe(true);
    unmount();
    expect(map.remove).toHaveBeenCalledTimes(1);
    expect(harness.markers.every((m) => m.remove.mock.calls.length >= 1)).toBe(true);
  });
});
