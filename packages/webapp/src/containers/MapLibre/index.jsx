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

// Read-only MapLibre version of the farm map, used when VITE_MAP_PROVIDER=maplibre.
// Drawing, editing and marker clustering are not ported yet, so the Add menu does nothing here.

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import styles from '../Map/styles.module.scss';
import { defaultColour } from '../Map/styles.module.scss';
import { areaStyles, icons, lineStyles } from '../Map/mapStyles';
import { DEFAULT_ZOOM, locationEnum } from '../Map/constants';
import { userFarmSelector } from '../userFarmSlice';
import {
  canShowSelection,
  canShowSuccessHeader,
  locations as setSelectionLocations,
  setPosition,
  setZoomLevel,
} from '../mapSlice';
import {
  mapFilterSettingSelector,
  setMapFilterHideAll,
  setMapFilterSetting,
  setMapFilterShowAll,
  isMapFilterSettingActiveSelector,
} from '../Map/mapFilterSettingSlice';
import {
  mapAddDrawerSelector,
  setMapAddDrawerHide,
  setMapAddDrawerShow,
} from '../Map/mapAddDrawerSlice';
import { showedSpotlightSelector } from '../showedSpotlightSlice';
import { sendMapToEmail, setSpotlightToShown } from '../Map/saga';
import useAvailableFilterSettings from '../Map/useAvailableFilterSettings';
import LocationSelectionModal from '../Map/LocationSelectionModal';
import useLocations from '../../hooks/location/useLocations';
import useExternalLocations from '../../hooks/location/useExternalLocations';
import { GroupByOptions } from '../../hooks/location/types';
import { useIsOffline } from '../hooks/useOfflineDetector/useIsOffline';
import PureMapHeader from '../../components/Map/Header';
import PureMapFooter from '../../components/Map/Footer';
import ExportMapModal from '../../components/Modals/ExportMapModal';
import { LoadingBackdrop } from '../../components/Loading/LoadingV2';
import MapPin from '../../assets/images/map/map_pin.svg';
import { ADD_SENSORS_URL } from '../../util/siteMapConstants';
import {
  IMAGERY_ATTRIBUTION,
  IMAGERY_MAX_ZOOM,
  IMAGERY_TILE_URL,
} from '../../util/mapProvider';
import { buildLocationCollections } from '../../util/mapLibre/locationsToGeoJSON';

const FALLBACK_COLOUR = '#666666';
const AREA_TYPES_WITH_FILL = Object.keys(areaStyles);
const LINE_TYPES = Object.keys(lineStyles);
const POINT_TYPES = [
  locationEnum.gate,
  locationEnum.water_valve,
  locationEnum.soil_sample_location,
  locationEnum.sensor,
  locationEnum.sensor_array,
];
const AREA_LAYERS = ['areas-fill'];
const LINE_LAYERS = ['lines-hit', 'line-buffers-fill'];

const colourExpression = (stylesByType) => [
  'match',
  ['get', 'type'],
  ...Object.entries(stylesByType).flatMap(([type, style]) => [type, style.colour || FALLBACK_COLOUR]),
  FALLBACK_COLOUR,
];

const emptyCollection = { type: 'FeatureCollection', features: [] };

const buildStyle = () => ({
  version: 8,
  sources: {
    imagery: {
      type: 'raster',
      tiles: [IMAGERY_TILE_URL],
      tileSize: 256,
      maxzoom: IMAGERY_MAX_ZOOM,
      attribution: IMAGERY_ATTRIBUTION,
    },
  },
  layers: [
    { id: 'background', type: 'background', paint: { 'background-color': '#e8e8e8' } },
    { id: 'imagery', type: 'raster', source: 'imagery' },
  ],
});

const toSelectionItem = (properties) => ({
  id: properties.location_id,
  name: properties.name,
  asset: properties.asset,
  type: properties.type,
  isAddonSensor: properties.isAddonSensor === true || properties.isAddonSensor === 'true',
});

export default function MapLibreMap({ isCompactSideMenu }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { farm_name, grid_points, is_admin, farm_id } = useSelector(userFarmSelector);
  const filterSettings = useSelector(mapFilterSettingSelector);
  const isMapFilterSettingActive = useSelector(isMapFilterSettingActiveSelector);
  const mapAddDrawer = useSelector(mapAddDrawerSelector);
  const showedSpotlight = useSelector(showedSpotlightSelector);
  const availableFilterSettings = useAvailableFilterSettings();
  const isOffline = useIsOffline();

  const [showMapFilter, setShowMapFilter] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const mapWrapperRef = useRef(null);
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const domMarkersRef = useRef([]);
  const hasFittedRef = useRef(false);
  const hoveredIdRef = useRef(null);

  const {
    locations: internalLocations,
    isFetching: isFetchingInternalLocations,
  } = useLocations({ groupBy: GroupByOptions.FIGURE_AND_TYPE });
  const {
    locations: externalLocations,
    isLoading: isLoadingExternalLocations,
  } = useExternalLocations({ groupBy: GroupByOptions.FIGURE_AND_TYPE });

  const collections = useMemo(
    () =>
      buildLocationCollections({
        area: { ...internalLocations?.area, ...externalLocations?.area },
        line: { ...internalLocations?.line, ...externalLocations?.line },
        point: { ...internalLocations?.point, ...externalLocations?.point },
      }),
    [internalLocations, externalLocations],
  );

  // Create the map once.
  useEffect(() => {
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: buildStyle(),
      center: [grid_points.lng, grid_points.lat],
      zoom: DEFAULT_ZOOM,
      minZoom: 1,
      maxZoom: IMAGERY_MAX_ZOOM,
      attributionControl: { compact: true },
      // Needed so html2canvas can read the canvas for map export.
      canvasContextAttributes: { preserveDrawingBuffer: true },
    });
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), 'bottom-right');
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();
    mapRef.current = map;

    map.on('load', () => {
      map.addSource('areas', { type: 'geojson', data: emptyCollection, promoteId: 'location_id' });
      map.addSource('lines', { type: 'geojson', data: emptyCollection });
      map.addSource('line-buffers', { type: 'geojson', data: emptyCollection });

      map.addLayer({
        id: 'areas-fill',
        type: 'fill',
        source: 'areas',
        paint: {
          'fill-color': colourExpression(areaStyles),
          'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.8, 0.5],
        },
      });
      map.addLayer({
        id: 'areas-outline',
        type: 'line',
        source: 'areas',
        paint: { 'line-color': defaultColour, 'line-width': 2 },
      });
      map.addLayer({
        id: 'line-buffers-fill',
        type: 'fill',
        source: 'line-buffers',
        paint: {
          'fill-color': colourExpression(lineStyles),
          'fill-opacity': 0.3,
          'fill-outline-color': colourExpression(lineStyles),
        },
      });
      map.addLayer({
        id: 'lines-visible',
        type: 'line',
        source: 'lines',
        paint: { 'line-color': colourExpression(lineStyles), 'line-width': 2 },
      });
      // Wider invisible line so thin lines are easy to click or tap.
      map.addLayer({
        id: 'lines-hit',
        type: 'line',
        source: 'lines',
        paint: { 'line-color': '#000000', 'line-opacity': 0, 'line-width': 14 },
      });

      const clickable = [...AREA_LAYERS, ...LINE_LAYERS];
      map.on('click', (e) => {
        if (e.defaultPrevented) return;
        const hits = map
          .queryRenderedFeatures(e.point, { layers: clickable })
          .map((f) => f.properties);
        const unique = [];
        hits.forEach((p) => {
          if (!unique.some((u) => u.location_id === p.location_id)) unique.push(p);
        });
        selectLocations(unique.map(toSelectionItem), map);
      });
      map.on('mousemove', 'areas-fill', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        const id = e.features?.[0]?.id;
        if (id === undefined || id === hoveredIdRef.current) return;
        if (hoveredIdRef.current !== null) {
          map.setFeatureState({ source: 'areas', id: hoveredIdRef.current }, { hover: false });
        }
        hoveredIdRef.current = id;
        map.setFeatureState({ source: 'areas', id }, { hover: true });
      });
      map.on('mouseleave', 'areas-fill', () => {
        map.getCanvas().style.cursor = '';
        if (hoveredIdRef.current !== null) {
          map.setFeatureState({ source: 'areas', id: hoveredIdRef.current }, { hover: false });
          hoveredIdRef.current = null;
        }
      });
      setMapReady(true);
    });

    return () => {
      domMarkersRef.current.forEach((m) => m.remove());
      domMarkersRef.current = [];
      map.remove();
      mapRef.current = null;
      dispatch(canShowSuccessHeader(false));
      dispatch(setMapAddDrawerHide(farm_id));
    };
  }, []);

  const selectLocations = (items, map) => {
    if (!items.length) {
      dispatch(canShowSelection(false));
      return;
    }
    const centre = map.getCenter();
    dispatch(setPosition({ lat: centre.lat, lng: centre.lng }));
    dispatch(setZoomLevel(map.getZoom()));
    if (items.length === 1) {
      const [item] = items;
      const isAddonSensor =
        item.isAddonSensor && [locationEnum.sensor_array, locationEnum.sensor].includes(item.type);
      navigate(isAddonSensor ? `/${item.type}/${item.id}` : `/${item.type}/${item.id}/details`);
      return;
    }
    dispatch(canShowSelection(true));
    dispatch(setSelectionLocations(items));
  };

  // Push data into the sources and (re)build the DOM markers for points, labels and the farm pin.
  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map) return;
    map.getSource('areas').setData(collections.areas);
    map.getSource('lines').setData(collections.lines);
    map.getSource('line-buffers').setData(collections.lineBuffers);

    domMarkersRef.current.forEach((m) => m.remove());
    domMarkersRef.current = [];
    const addMarker = (element, lngLat, extra = {}) => {
      const marker = new maplibregl.Marker({ element, ...extra }).setLngLat(lngLat).addTo(map);
      domMarkersRef.current.push(marker);
      return marker;
    };

    collections.points.features.forEach((feature) => {
      const { type, name } = feature.properties;
      const img = document.createElement('img');
      img.src = icons[type];
      img.alt = name ?? type;
      img.dataset.type = type;
      img.dataset.kind = 'point';
      img.style.cursor = 'pointer';
      img.addEventListener('click', (e) => {
        e.stopPropagation();
        selectLocations([toSelectionItem(feature.properties)], map);
      });
      addMarker(img, feature.geometry.coordinates);
    });

    collections.labels.forEach(({ name, type, lngLat }) => {
      const el = document.createElement('div');
      el.className = styles.mapLabel;
      el.textContent = name;
      el.dataset.type = type;
      el.dataset.kind = 'label';
      el.style.color = 'white';
      el.style.fontSize = '16px';
      el.style.pointerEvents = 'none';
      addMarker(el, lngLat);
    });

    if (!collections.bounds) {
      const pin = document.createElement('img');
      pin.src = MapPin;
      pin.alt = '';
      pin.style.pointerEvents = 'none';
      addMarker(pin, [grid_points.lng, grid_points.lat], { anchor: 'bottom' });
    }

    if (!hasFittedRef.current && !isFetchingInternalLocations && !isLoadingExternalLocations) {
      hasFittedRef.current = true;
      const cameraInfo = location.state?.cameraInfo;
      if (cameraInfo?.zoom && cameraInfo?.location) {
        map.jumpTo({
          zoom: cameraInfo.zoom,
          center: [cameraInfo.location.lng, cameraInfo.location.lat],
        });
      } else if (collections.bounds) {
        map.fitBounds(collections.bounds, { padding: 40, maxZoom: IMAGERY_MAX_ZOOM, duration: 0 });
      }
    }
  }, [mapReady, collections, isFetchingInternalLocations, isLoadingExternalLocations]);

  // Filters: per-type visibility, labels, and the imagery / plain background toggle.
  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map) return;
    const visible = (types) => types.filter((type) => filterSettings?.[type]);
    const typeFilter = (types) => ['in', ['get', 'type'], ['literal', visible(types)]];
    map.setFilter('areas-fill', typeFilter(AREA_TYPES_WITH_FILL));
    map.setFilter('areas-outline', typeFilter(AREA_TYPES_WITH_FILL));
    map.setFilter('line-buffers-fill', typeFilter(LINE_TYPES));
    map.setFilter('lines-visible', typeFilter([...LINE_TYPES, locationEnum.farm_site_boundary]));
    map.setFilter('lines-hit', typeFilter([...LINE_TYPES, locationEnum.farm_site_boundary]));
    map.setLayoutProperty(
      'imagery',
      'visibility',
      filterSettings?.map_background === false ? 'none' : 'visible',
    );
    domMarkersRef.current.forEach((marker) => {
      const el = marker.getElement();
      const { kind, type } = el.dataset;
      if (kind === 'point') el.style.display = filterSettings?.[type] ? '' : 'none';
      if (kind === 'label') {
        el.style.display = filterSettings?.label && filterSettings?.[type] ? '' : 'none';
      }
    });
  }, [mapReady, filterSettings, collections]);

  const showAddDrawer = mapAddDrawer.addDrawer && !isOffline;

  const handleClickAdd = () => {
    setShowExportModal(false);
    setShowMapFilter(false);
    dispatch(showAddDrawer ? setMapAddDrawerHide(farm_id) : setMapAddDrawerShow(farm_id));
  };
  const handleClickExport = () => {
    setShowExportModal(!showExportModal);
    setShowMapFilter(false);
    dispatch(setMapAddDrawerHide(farm_id));
  };
  const handleClickFilter = () => {
    setShowExportModal(false);
    dispatch(setMapAddDrawerHide(farm_id));
    setShowMapFilter(!showMapFilter);
  };
  const handleFilterMenuClick = (locationType) => {
    if (locationType === 'show_all') dispatch(setMapFilterShowAll(farm_id));
    else if (locationType === 'hide_all') dispatch(setMapFilterHideAll(farm_id));
    else {
      dispatch(
        setMapFilterSetting({ [locationType]: !filterSettings[locationType], farm_id }),
      );
    }
  };
  const handleAddMenuClick = (locationType) => {
    if (locationType === locationEnum.sensor) {
      dispatch(setMapAddDrawerHide(farm_id));
      navigate(ADD_SENSORS_URL);
    }
    // Drawing other location types is not ported to MapLibre yet.
  };

  const handleDownload = () => {
    html2canvas(mapWrapperRef.current, { useCORS: true }).then((canvas) => {
      canvas.toBlob((blob) => {
        saveAs(blob, `${farm_name}-export-${new Date().toISOString()}.png`);
      });
    });
  };
  const handleShare = () => {
    html2canvas(mapWrapperRef.current, { useCORS: true }).then((canvas) => {
      dispatch(sendMapToEmail(canvas.toDataURL()));
    });
  };

  return (
    <>
      <PureMapHeader farmName={farm_name} />
      <div data-cy="map-selection" className={styles.pageWrapper}>
        <div className={styles.mapContainer}>
          <div data-cy="map-mapContainer" ref={mapWrapperRef} className={styles.mapContainer}>
            <div data-cy="maplibre-map" ref={containerRef} style={{ flexGrow: 1, height: '100%' }} />
          </div>
        </div>
        <LocationSelectionModal />
        <PureMapFooter
          isAdmin={is_admin}
          showSpotlight={!showedSpotlight.map}
          resetSpotlight={() => dispatch(setSpotlightToShown('map'))}
          onClickAdd={handleClickAdd}
          showModal={showExportModal}
          onClickExport={handleClickExport}
          setShowMapFilter={setShowMapFilter}
          showMapFilter={showMapFilter}
          setShowAddDrawer={(show) =>
            dispatch(show ? setMapAddDrawerShow(farm_id) : setMapAddDrawerHide(farm_id))
          }
          showAddDrawer={showAddDrawer}
          handleClickFilter={handleClickFilter}
          filterSettings={filterSettings}
          onFilterMenuClick={handleFilterMenuClick}
          onAddMenuClick={handleAddMenuClick}
          availableFilterSettings={availableFilterSettings}
          isMapFilterSettingActive={isMapFilterSettingActive}
          isCompactSideMenu={isCompactSideMenu}
          isOffline={isOffline}
        />
        {showExportModal && (
          <ExportMapModal
            onClickDownload={handleDownload}
            onClickShare={handleShare}
            dismissModal={() => setShowExportModal(false)}
          />
        )}
      </div>
      <LoadingBackdrop
        isOpen={!mapReady || isFetchingInternalLocations || isLoadingExternalLocations}
        showDelay={400}
        isCompactSideMenu={isCompactSideMenu}
        dataName={t('MENU.MAP').toLocaleLowerCase()}
      />
    </>
  );
}
