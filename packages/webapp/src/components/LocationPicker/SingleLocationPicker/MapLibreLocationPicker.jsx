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

// MapLibre version of the location picker, used when VITE_MAP_PROVIDER=maplibre.
// Same props as ./index.jsx. Marker clustering and the max zoom lookup are not ported:
// points are plain markers and the zoom limit is the imagery limit.

import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import buffer from '@turf/buffer';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { DEFAULT_ZOOM, isArea, isCircle, isLine, isPoint } from '../../../containers/Map/constants';
import {
  areaStyles,
  circleStyles,
  hoverIcons,
  icons,
  lineStyles,
  selectedIcons,
} from '../../../containers/Map/mapStyles';
import { defaultColour } from '../../../containers/Map/styles.module.scss';
import MapPin from '../../../assets/images/map/map_pin.svg';
import { buildImageryStyle, IMAGERY_MAX_ZOOM } from '../../../util/mapProvider';
import { buildLocationCollections, toPosition } from '../../../util/mapLibre/locationsToGeoJSON';
import { usePropRef } from './usePropRef';
import PureSelectionHandler from './PureMapLocationSelectionModal';
import mapStyles from '../../../containers/Map/styles.module.scss';
import styles from './styles.module.scss';
import { GestureHandling } from './types';

const FALLBACK_COLOUR = '#666666';
const FIT_MAX_ZOOM = Math.min(18, IMAGERY_MAX_ZOOM);
const CLICKABLE_LAYERS = ['areas-fill', 'line-buffers-fill', 'lines-hit'];
const emptyCollection = { type: 'FeatureCollection', features: [] };

const areaColours = Object.fromEntries([
  ...Object.entries(areaStyles),
  ...Object.entries(circleStyles).map(([type, s]) => [
    type,
    { colour: s.fillColour, selectedColour: s.selectedColour ?? s.fillColour },
  ]),
]);

// ['match', type, ...] expression picking `key` from each type's style.
const byType = (stylesByType, key, fallback = FALLBACK_COLOUR) => [
  'match',
  ['get', 'type'],
  ...Object.entries(stylesByType).flatMap(([type, style]) => [type, style[key] || fallback]),
  fallback,
];

const selectedState = ['boolean', ['feature-state', 'selected'], false];
const hoverState = ['boolean', ['feature-state', 'hover'], false];

// The picker takes a flat list of locations. Pivots are drawn as a circle polygon.
const buildCollections = (locations = []) => {
  const area = [];
  const line = [];
  const point = [];
  locations.forEach((location) => {
    if (isCircle(location.type)) {
      const { center, radius } = location;
      if (!center || !(Number(radius) > 0)) return;
      const circle = buffer(
        {
          type: 'Feature',
          properties: {},
          geometry: { type: 'Point', coordinates: toPosition(center) },
        },
        Number(radius),
        { units: 'meters', steps: 48 },
      );
      area.push({
        ...location,
        grid_points: circle.geometry.coordinates[0].map(([lng, lat]) => ({ lat, lng })),
      });
    } else if (isLine(location.type)) {
      line.push(location);
    } else if (isPoint(location.type)) {
      point.push(location);
    } else if (isArea(location.type)) {
      area.push(location);
    }
  });
  return buildLocationCollections({
    area: { all: area },
    line: { all: line },
    point: { all: point },
  });
};

const MapLibreLocationPicker = ({
  onSelectLocation,
  clearLocations = onSelectLocation,
  selectedLocationIds = [],
  isPinMode,
  setPinCoordinate,
  pinCoordinate,
  locations,
  farmCenterCoordinate,
  style,
  readOnlyPinCoordinates,
  disabled = false,
  className = '',
  showControls = true,
  disableHover = false,
  showOverlappingAreasModal = true,
  gestureHandling = GestureHandling.GREEDY,
}) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const pinMarkerRef = useRef(null);
  const pointMarkersRef = useRef({});
  const domMarkersRef = useRef([]);
  const hoveredRef = useRef(null);
  const hasFittedRef = useRef(false);
  const [mapReady, setMapReady] = useState(false);
  const [overlappedPositions, setOverlappedPositions] = useState([]);

  const onSelectLocationRef = usePropRef(onSelectLocation);
  const setPinCoordinateRef = usePropRef(setPinCoordinate);
  const clearLocationsRef = usePropRef(clearLocations);
  const isPinModeRef = usePropRef(isPinMode);
  const disableHoverRef = usePropRef(disableHover);
  const selectedLocationIdsRef = usePropRef(selectedLocationIds);

  const collections = useMemo(() => buildCollections(locations), [locations]);
  const dismissSelectionModal = () => setOverlappedPositions([]);

  // Create the map once.
  useEffect(() => {
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: buildImageryStyle(),
      center: [farmCenterCoordinate.lng, farmCenterCoordinate.lat],
      zoom: DEFAULT_ZOOM,
      minZoom: 1,
      maxZoom: IMAGERY_MAX_ZOOM,
      attributionControl: { compact: true },
      cooperativeGestures: gestureHandling === GestureHandling.COOPERATIVE,
    });
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();
    if (gestureHandling === GestureHandling.NONE) {
      ['dragPan', 'scrollZoom', 'doubleClickZoom', 'touchZoomRotate', 'keyboard'].forEach((h) =>
        map[h].disable(),
      );
    }
    if (showControls) {
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
    }
    mapRef.current = map;

    map.on('load', () => {
      map.addSource('areas', { type: 'geojson', data: emptyCollection, promoteId: 'location_id' });
      map.addSource('lines', { type: 'geojson', data: emptyCollection, promoteId: 'location_id' });
      map.addSource('line-buffers', {
        type: 'geojson',
        data: emptyCollection,
        promoteId: 'location_id',
      });

      const opacity = (rest) => ['case', selectedState, 1, hoverState, 0.8, rest];
      map.addLayer({
        id: 'areas-fill',
        type: 'fill',
        source: 'areas',
        paint: {
          'fill-color': [
            'case',
            selectedState,
            byType(areaColours, 'selectedColour', 'white'),
            byType(areaColours, 'colour'),
          ],
          'fill-opacity': opacity(0.5),
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
          'fill-color': [
            'case',
            selectedState,
            byType(lineStyles, 'selectedColour', 'white'),
            byType(lineStyles, 'colour'),
          ],
          'fill-opacity': opacity(0.3),
        },
      });
      map.addLayer({
        id: 'lines-visible',
        type: 'line',
        source: 'lines',
        paint: {
          'line-color': [
            'case',
            selectedState,
            byType(lineStyles, 'selectedColour', 'white'),
            byType(lineStyles, 'colour'),
          ],
          'line-width': ['case', selectedState, 4, 2],
        },
      });
      // Wider invisible line so thin lines are easy to click or tap.
      map.addLayer({
        id: 'lines-hit',
        type: 'line',
        source: 'lines',
        paint: { 'line-color': '#000000', 'line-opacity': 0, 'line-width': 14 },
      });

      map.on('click', (e) => {
        if (e.defaultPrevented) return;
        if (isPinModeRef.current) {
          const { lat, lng } = e.lngLat;
          setPinCoordinateRef.current?.({ lat, lng });
          clearLocationsRef.current();
          return;
        }
        const hits = [];
        map
          .queryRenderedFeatures(e.point, { layers: CLICKABLE_LAYERS })
          .forEach(({ properties }) => {
            if (!hits.some((h) => h.location_id === properties.location_id)) {
              hits.push({
                location_id: properties.location_id,
                name: properties.name,
                type: properties.type,
              });
            }
          });
        if (hits.length > 1) setOverlappedPositions(hits);
        else if (hits.length === 1) onSelectLocationRef.current(hits[0].location_id);
      });

      const clearHover = () => {
        if (!hoveredRef.current) return;
        map.setFeatureState(hoveredRef.current, { hover: false });
        hoveredRef.current = null;
      };
      [
        ['areas-fill', 'areas'],
        ['line-buffers-fill', 'line-buffers'],
      ].forEach(([layer, source]) => {
        map.on('mousemove', layer, (e) => {
          if (disableHoverRef.current) return;
          const id = e.features?.[0]?.id;
          if (id === undefined) return;
          if (hoveredRef.current?.id !== id || hoveredRef.current?.source !== source) {
            clearHover();
            hoveredRef.current = { source, id };
            map.setFeatureState(hoveredRef.current, { hover: true });
          }
          if (!isPinModeRef.current) map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', layer, () => {
          clearHover();
          map.getCanvas().style.cursor = isPinModeRef.current ? 'crosshair' : '';
        });
      });
      setMapReady(true);
    });

    return () => {
      domMarkersRef.current.forEach((m) => m.remove());
      domMarkersRef.current = [];
      pointMarkersRef.current = {};
      pinMarkerRef.current?.remove();
      pinMarkerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Push data into the sources and rebuild the DOM markers for points, labels and read-only pins.
  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map) return;
    map.getSource('areas').setData(collections.areas);
    map.getSource('lines').setData(collections.lines);
    map.getSource('line-buffers').setData(collections.lineBuffers);

    domMarkersRef.current.forEach((m) => m.remove());
    domMarkersRef.current = [];
    pointMarkersRef.current = {};
    const addMarker = (element, lngLat, extra = {}) => {
      const marker = new maplibregl.Marker({ element, ...extra }).setLngLat(lngLat).addTo(map);
      domMarkersRef.current.push(marker);
      return marker;
    };

    collections.points.features.forEach(({ properties, geometry }) => {
      const { type, name, location_id } = properties;
      const img = document.createElement('img');
      const isSelected = () => selectedLocationIdsRef.current?.includes(location_id);
      img.src = isSelected() ? selectedIcons[type] : icons[type];
      img.alt = name ?? type;
      img.style.cursor = 'pointer';
      img.addEventListener('mouseenter', () => {
        if (!disableHoverRef.current && !isSelected() && !isPinModeRef.current) {
          img.src = hoverIcons[type];
        }
      });
      img.addEventListener('mouseleave', () => {
        if (!isSelected()) img.src = icons[type];
      });
      img.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!isPinModeRef.current) onSelectLocationRef.current(location_id);
      });
      pointMarkersRef.current[location_id] = { img, type };
      addMarker(img, geometry.coordinates);
    });

    collections.labels.forEach(({ name, lngLat }) => {
      if (!name) return;
      const el = document.createElement('div');
      el.className = mapStyles.mapLabel;
      el.textContent = name;
      el.style.color = 'white';
      el.style.fontSize = '16px';
      el.style.pointerEvents = 'none';
      addMarker(el, lngLat);
    });

    (readOnlyPinCoordinates || []).forEach((coordinate) => {
      const pin = document.createElement('img');
      pin.src = MapPin;
      pin.alt = '';
      pin.style.pointerEvents = 'none';
      addMarker(pin, toPosition(coordinate), { anchor: 'bottom' });
    });

    if (!hasFittedRef.current) {
      const bounds = new maplibregl.LngLatBounds();
      const extendBy = (position) => bounds.extend(position);
      extendBy(toPosition(farmCenterCoordinate));
      if (pinCoordinate) extendBy(toPosition(pinCoordinate));
      (readOnlyPinCoordinates || []).forEach((c) => extendBy(toPosition(c)));
      if (collections.bounds) {
        extendBy(collections.bounds[0]);
        extendBy(collections.bounds[1]);
        hasFittedRef.current = true;
      }
      map.fitBounds(bounds, { padding: 40, maxZoom: FIT_MAX_ZOOM, duration: 0 });
    }
  }, [mapReady, collections, readOnlyPinCoordinates]);

  // Selection styling. Feature state follows the ids of the locations currently selected.
  const prevSelectedRef = useRef([]);
  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map) return;
    const ids = (selectedLocationIds || []).filter(Boolean);
    const setSelected = (id, selected) => {
      ['areas', 'lines', 'line-buffers'].forEach((source) =>
        map.setFeatureState({ source, id }, { selected }),
      );
    };
    prevSelectedRef.current.forEach((id) => !ids.includes(id) && setSelected(id, false));
    ids.forEach((id) => setSelected(id, true));
    prevSelectedRef.current = ids;
    Object.entries(pointMarkersRef.current).forEach(([id, { img, type }]) => {
      img.src = ids.includes(id) ? selectedIcons[type] : icons[type];
    });
  }, [mapReady, collections, selectedLocationIds]);

  // Pin mode: crosshair cursor, a single pin at the clicked coordinate.
  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map) return;
    map.getCanvas().style.cursor = isPinMode ? 'crosshair' : '';
    if (!pinMarkerRef.current) {
      const pin = document.createElement('img');
      pin.src = MapPin;
      pin.alt = '';
      pin.style.pointerEvents = 'none';
      pinMarkerRef.current = new maplibregl.Marker({ element: pin, anchor: 'bottom' });
    }
    const marker = pinMarkerRef.current;
    if (isPinMode && pinCoordinate) {
      marker.setLngLat(toPosition(pinCoordinate)).addTo(map);
    } else {
      marker.remove();
    }
    if (!isPinMode) setPinCoordinate?.(null);
    if (overlappedPositions.length) dismissSelectionModal();
  }, [mapReady, isPinMode, pinCoordinate?.lat, pinCoordinate?.lng]);

  const onSelectionModalClick = (location_id) => {
    onSelectLocationRef.current(location_id);
    dismissSelectionModal();
  };

  return (
    <div
      data-cy="map-selectLocation"
      className={clsx(styles.mapContainer, className)}
      style={style}
    >
      <div
        data-cy="maplibre-map"
        ref={containerRef}
        style={{ flexGrow: 1, width: '100%', height: '100%' }}
      />
      {showOverlappingAreasModal && overlappedPositions.length > 1 && !isPinMode && (
        <PureSelectionHandler
          locations={overlappedPositions}
          onSelect={onSelectionModalClick}
          dismissSelectionModal={dismissSelectionModal}
          selectedLocationIds={selectedLocationIds}
        />
      )}
      {disabled && <div className={styles.layerMask} />}
    </div>
  );
};

MapLibreLocationPicker.propTypes = {
  className: PropTypes.string,
  selectedLocationIds: PropTypes.arrayOf(PropTypes.string),
  farmCenterCoordinate: PropTypes.object,
  readOnlyPinCoordinates: PropTypes.arrayOf(
    PropTypes.shape({ lat: PropTypes.number, lng: PropTypes.number }),
  ),
  disabled: PropTypes.bool,
};

export default MapLibreLocationPicker;
