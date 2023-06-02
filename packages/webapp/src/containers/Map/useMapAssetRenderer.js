/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
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

import styles, { defaultColour } from './styles.module.scss';
import { areaStyles, hoverIcons, icons, lineStyles } from './mapStyles';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { mapFilterSettingSelector } from './mapFilterSettingSlice';
import { areaSelector, lineSelector, pointSelector, sortedAreaSelector } from '../locationSlice';
import { setPosition, setZoomLevel } from '../mapSlice';
import {
  getAreaLocationTypes,
  isArea,
  isAreaLine,
  isLine,
  isNoFillArea,
  locationEnum,
  polygonPath,
  longPress,
  DEFAULT_MAX_ZOOM,
} from './constants';
import useSelectionHandler from './useSelectionHandler';
import { useMaxZoom } from './useMaxZoom';

import MapPin from '../../assets/images/map/map_pin.svg';
import { userFarmSelector } from '../userFarmSlice';
import CreateMarkerCluster from '../../components/Map/MarkerCluster';
import { usePropRef } from '../../components/LocationPicker/SingleLocationPicker/usePropRef';

/**
 *
 * Do not modify, copy or reuse
 */
const useMapAssetRenderer = ({ isClickable, showingConfirmButtons, drawingState }) => {
  const { handleSelection, dismissSelectionModal } = useSelectionHandler();
  const locationsRef = usePropRef([]);
  const dispatch = useDispatch();
  const filterSettings = useSelector(mapFilterSettingSelector);
  const initAssetGeometriesState = () => {
    const nextAssetGeometries = {};
    for (const key in filterSettings) {
      nextAssetGeometries[key] = [];
    }
    return nextAssetGeometries;
  };

  const [farmLocationMarker, setFarmLocationMarker] = useState(null);
  const [farmMap, setFarmMap] = useState();
  const [points, setPoints] = useState({});

  const [assetGeometries, setAssetGeometries] = useState(initAssetGeometriesState());
  //TODO get prev filter state from redux
  const [prevFilterState, setPrevFilterState] = useState(filterSettings);
  useEffect(() => {
    for (const key in filterSettings) {
      const isPointVisible = (locationType) => {
        if (isArea(locationType) && !filterSettings?.label) {
          return false;
        }
        return filterSettings?.[locationType];
      };
      if (prevFilterState?.[key] !== filterSettings?.[key]) {
        for (const assetGeometry of assetGeometries?.[key] || []) {
          assetGeometry?.polygon?.setOptions({ visible: filterSettings?.[key] });
          assetGeometry?.polyline?.setOptions({ visible: filterSettings?.[key] });
          assetGeometry?.marker?.setOptions({ visible: isPointVisible(key) });
        }
      }
    }
    setPrevFilterState(filterSettings);
  }, [filterSettings]);

  useEffect(() => {
    for (const areaLocationType of getAreaLocationTypes()) {
      for (const assetGeometry of assetGeometries?.[areaLocationType] || []) {
        filterSettings?.[areaLocationType] &&
          assetGeometry?.marker?.setOptions({ visible: filterSettings?.label });
      }
    }
  }, [filterSettings?.label]);

  useEffect(() => {
    for (const key in filterSettings) {
      for (const assetGeometry of assetGeometries?.[key] || []) {
        assetGeometry?.polygon?.setOptions({ clickable: isClickable });
        assetGeometry?.polyline?.setOptions({ clickable: isClickable });
        assetGeometry?.marker?.setOptions({ clickable: isClickable });
      }
    }
  }, [isClickable]);

  const areaAssets = useSelector(areaSelector);
  const lineAssets = useSelector(lineSelector);
  const pointAssets = useSelector(pointSelector);
  const { grid_points } = useSelector(userFarmSelector);

  useEffect(() => {
    markerClusterRef?.current?.clearMarkers();
    markerClusterRef?.current?.addMarkers(
      Object.keys(points).reduce((prev, curr) => {
        if (points[curr].isVisible) {
          prev.push(points[curr].marker);
        }
        return prev;
      }, []),
    );
  }, [Object.values(points)]);

  const assetFunctionMap = (assetType) => {
    return isArea(assetType)
      ? isNoFillArea(assetType)
        ? drawNoFillArea
        : drawArea
      : isLine(assetType)
      ? drawLine
      : drawPoint;
  };

  const { maxZoomRef } = useMaxZoom();
  const markerClusterRef = useRef();
  useEffect(() => {
    dismissSelectionModal();
  }, [filterSettings?.gate, filterSettings?.water_valve, filterSettings?.sensor]);
  useEffect(() => {
    markerClusterRef?.current?.setOptions({ zoomOnClick: isClickable });
  }, [isClickable]);
  const createMarkerClusters = (maps, map, points) => {
    const markers = [];

    points.forEach((point) => {
      point.marker.id = point.location_id;
      point.marker.name = point.location_name;
      point.marker.asset = point.asset;
      point.marker.type = point.type;
      markers.push(point.marker);
    });

    CreateMarkerCluster(map, maps, markers, [], markerClusterRef, null, maxZoomRef?.current);

    markerClusterRef.current.addMarkers(markers, true);
    maps.event.addListener(markerClusterRef.current, 'click', (cluster) => {
      if (
        map.getZoom() >= (maxZoomRef?.current || DEFAULT_MAX_ZOOM) &&
        cluster.markers.length > 1
      ) {
        const pointAssets = {
          gate: [],
          water_valve: [],
          sensor: [],
        };
        cluster.markers.map((point) => {
          pointAssets[point.type].push({
            asset: point.asset,
            location_id: point.id,
            location_name: point.name,
            marker: point,
            type: point.type,
          });
        });

        const getFirstMarkerPosition = (pointAssets) => {
          for (const type in pointAssets) {
            for (const marker of pointAssets[type]) {
              return marker.marker.position;
            }
          }
        };

        const latlng = map.getCenter().toJSON();
        dispatch(setPosition(latlng));
        dispatch(setZoomLevel(map.getZoom()));
        handleSelection(getFirstMarkerPosition(pointAssets), pointAssets, maps, true, true);
      }
    });
  };

  useEffect(() => {
    if (drawingState.isActive) {
      farmLocationMarker?.setMap(null);
    } else if (showingConfirmButtons) {
      farmLocationMarker?.setMap(null);
    } else {
      farmLocationMarker?.setMap(farmMap ?? null);
    }
  }, [drawingState.isActive, showingConfirmButtons, farmLocationMarker]);

  const drawAssets = (map, maps, mapBounds) => {
    maps.event.addListenerOnce(map, 'idle', function () {
      // markerClusterRef?.current?.repaint();
    });

    // Event listener for general map click
    maps.event.addListener(map, 'click', function (mapsMouseEvent) {
      handleSelection(mapsMouseEvent.latLng, assetGeometries, maps, false);
    });

    let hasLocation = false;
    const newState = { ...assetGeometries };
    const assets = { ...areaAssets, ...lineAssets, ...pointAssets };
    const assetsWithLocations = Object.keys(assets).filter(
      (type) =>
        (assets[type].type !== undefined && assets[type].type.length) > 0 ||
        assets[type].length > 0,
    );
    hasLocation = assetsWithLocations.length > 0;

    locationsRef.current = assetsWithLocations.reduce((prev, curr) => {
      return [...prev, ...assets[curr].map((l) => l.location_id)];
    }, []);

    if (!hasLocation) {
      setFarmMap(map);
      const locationMarker = new maps.Marker({
        icon: MapPin,
        position: grid_points,
        map: map,
        clickable: false,
        crossOnDrag: false,
      });
      setFarmLocationMarker(locationMarker);
      mapBounds.extend(grid_points);
    } else if (farmLocationMarker) {
      farmLocationMarker?.setMap(null);
    }

    assetsWithLocations.forEach((idx) => {
      const locationType = assets[idx].type !== undefined ? assets[idx].type : idx;
      assets[idx].type === undefined
        ? assets[locationType].forEach((location) => {
            !newState[locationType].find((l) => l.location_id === location.location_id) &&
              newState[locationType]?.push(
                assetFunctionMap(locationType)(
                  map,
                  maps,
                  mapBounds,
                  location,
                  filterSettings?.[locationType],
                ),
              );
          })
        : newState[locationType]?.push(
            assetFunctionMap(locationType)(
              map,
              maps,
              mapBounds,
              assets[idx].type !== undefined ? assets[idx] : assets['buffer_zone'][0],
              filterSettings?.[locationType],
            ),
          );
    });
    setAssetGeometries(newState);
    // Create marker clusters
    const pointsArray = [
      ...assetGeometries.gate,
      ...assetGeometries.water_valve,
      ...assetGeometries.sensor,
    ];

    createMarkerClusters(maps, map, pointsArray);
    // TODO: only fitBounds if there is at least one location in the farm
    hasLocation && map.fitBounds(mapBounds);
    return mapBounds;
  };

  // Draw an area
  const drawArea = (map, maps, mapBounds, area, isVisible) => {
    const { grid_points: points, name, type } = area;
    const { colour, dashScale, dashLength } = areaStyles[type];
    points.forEach((point) => {
      mapBounds.extend(point);
    });

    const polygon = new maps.Polygon({
      paths: points,
      strokeColor: defaultColour,
      strokeWeight: 2,
      fillColor: colour,
      fillOpacity: 0.5,
    });
    polygon.setMap(map);

    maps.event.addListener(polygon, 'mouseover', function () {
      this.setOptions({ fillOpacity: 0.8 });
    });
    maps.event.addListener(polygon, 'mouseout', function () {
      this.setOptions({ fillOpacity: 0.5 });
    });

    // draw dotted outline
    let borderPoints = points.map((point) => ({
      ...point,
    }));
    borderPoints.push(points[0]);

    const lineSymbol = {
      path: 'M 0,0 0,1',
      strokeColor: colour,
      strokeOpacity: 1,
      strokeWeight: 2,
      scale: dashScale,
    };
    const polyline = new maps.Polyline({
      path: borderPoints,
      strokeOpacity: 0,
      icons: [
        {
          icon: lineSymbol,
          offset: '0',
          repeat: dashLength,
        },
      ],
    });
    polyline.setMap(map);

    // add area name label
    const marker = new maps.Marker({
      position: polygon.getAveragePoint(),
      map: map,
      icon: {
        path: 'M 0,0 0,0',
        strokeColor: colour,
        strokeOpacity: 0,
        strokeWeight: 0,
      },
      clickable: false,
      crossOnDrag: false,
      label: {
        text: name,
        color: 'white',
        fontSize: '16px',
        className: styles.mapLabel,
      },
    });
    marker.setMap(map);
    // Event listener for area click
    maps.event.addListener(polygon, 'click', function (mapsMouseEvent) {
      const latlng = map.getCenter().toJSON();

      dispatch(setPosition(latlng));
      dispatch(setZoomLevel(map.getZoom()));

      handleSelection(mapsMouseEvent.latLng, assetGeometries, maps, true);
    });

    marker.setOptions({ visible: filterSettings?.label && isVisible });
    polygon.setOptions({ visible: isVisible });
    polyline.setOptions({ visible: isVisible });

    return {
      polygon,
      polyline,
      marker,
      location_id: area.location_id,
      location_name: area.name,
      asset: 'area',
      type: area.type,
    };
  };

  // Draw a line
  const drawLine = (map, maps, mapBounds, line, isVisible) => {
    const { line_points: points, name, type, width } = line;
    let linePolygon;
    const realWidth =
      type === locationEnum.watercourse ? Number(line.buffer_width) + Number(width) : Number(width);
    const { colour, dashScale, dashLength } = lineStyles[type];
    points.forEach((point) => {
      mapBounds.extend(point);
    });

    // draw dotted outline
    const lineSymbol = (c) => ({
      path: 'M 0,0 0,1',
      strokeColor: c,
      strokeOpacity: 1,
      strokeWeight: 2,
      scale: dashScale,
    });
    let polyline = new maps.Polyline({
      path: points,
      strokeColor: defaultColour,
      strokeOpacity: 1.0,
      strokeWeight: 2,
      icons: [
        {
          icon: lineSymbol(colour),
          offset: '0',
          repeat: dashLength,
        },
      ],
    });
    polyline.setMap(map);
    if (isAreaLine(type)) {
      const polyPath = polygonPath(polyline.getPath().getArray(), realWidth, maps);
      linePolygon = new maps.Polygon({
        paths: polyPath,
        ...lineStyles[type].polyStyles,
      });
      linePolygon.setMap(map);
    }
    maps.event.addListener(polyline, 'mouseover', function () {
      this.setOptions({
        strokeColor: colour,
        icons: [
          {
            icon: lineSymbol(defaultColour),
            offset: '0',
            repeat: dashLength,
          },
        ],
      });
    });
    maps.event.addListener(polyline, 'mouseout', function () {
      this.setOptions({
        strokeColor: defaultColour,
        icons: [
          {
            icon: lineSymbol(colour),
            offset: '0',
            repeat: dashLength,
          },
        ],
      });
    });

    // Event listener for line click
    maps.event.addListener(polyline, 'click', function (mapsMouseEvent) {
      const latlng = map.getCenter().toJSON();
      dispatch(setPosition(latlng));
      dispatch(setZoomLevel(map.getZoom()));
      handleSelection(mapsMouseEvent.latLng, assetGeometries, maps, true);
    });

    let asset;
    if (isAreaLine(type)) {
      linePolygon.setOptions({ visible: isVisible });
      asset = { polygon: linePolygon, polyline };
    } else {
      asset = { polyline };
    }
    polyline.setOptions({ visible: isVisible });
    maps.event.addListener(
      isAreaLine(type) ? linePolygon : polyline,
      'click',
      function (mapsMouseEvent) {
        handleSelection(mapsMouseEvent.latLng, assetGeometries, maps, true);
      },
    );

    return {
      ...asset,
      location_id: line.location_id,
      location_name: line.name,
      asset: 'line',
      type: line.type,
    };
  };

  const drawNoFillArea = (map, maps, mapBounds, area, isVisible) => {
    const { grid_points } = area;
    const line = { ...area, line_points: [...grid_points, grid_points[0]], width: 1 };
    return drawLine(map, maps, mapBounds, line, isVisible);
  };

  // Draw a point
  const drawPoint = (map, maps, mapBounds, point, isVisible) => {
    const { point: grid_point, name, type } = point;
    mapBounds.extend(grid_point);

    var marker = new maps.Marker({
      position: grid_point,
      icon: icons[type],
    });
    marker.setMap(map);

    maps.event.addListener(marker, 'mouseover', function () {
      this.setOptions({ icon: hoverIcons[type] });
    });
    maps.event.addListener(marker, 'mouseout', function () {
      this.setOptions({ icon: icons[type] });
    });

    let longPressed, longPressTimeout;

    maps.event.addListener(marker, 'mousedown', function (mapsMouseEvent) {
      longPressed = false;
      longPressTimeout = setTimeout(function () {
        longPressed = true;
        if (point.type === 'sensor') {
          map.panTo(grid_point);
          const index = assetGeometries.sensor.findIndex(
            (sensor) => sensor.location_id === point.location_id,
          );
          setTimeout(function () {
            handleSelection(
              MouseEvent.latLng,
              { sensor: [assetGeometries.sensor[index]] },
              maps,
              true,
              false,
              true,
            );
          }, longPress / 2);
        }
      }, longPress);
    });

    maps.event.addListener(marker, 'mouseup', function (mapsMouseEvent) {
      clearTimeout(longPressTimeout);
      const latlng = map.getCenter().toJSON();
      if (!longPressed) {
        dispatch(setPosition(latlng));
        dispatch(setZoomLevel(map.getZoom()));
        handleSelection(mapsMouseEvent.latLng, assetGeometries, maps, true);
      }
    });

    marker.setOptions({ visible: isVisible });

    maps.event.addListener(marker, 'visible_changed', function () {
      setPoints((prev) => {
        prev[point.location_id].isVisible = !prev[point.location_id].isVisible;
        return prev;
      });
    });

    setPoints((prev) => {
      prev[point.location_id] = { marker, isVisible };
      return prev;
    });
    return {
      marker,
      location_id: point.location_id,
      location_name: point.name,
      asset: 'point',
      type: point.type,
    };
  };

  return { drawAssets, drawArea, drawPoint, drawLine };
};

export default useMapAssetRenderer;
