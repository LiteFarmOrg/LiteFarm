import styles, { defaultColour } from './styles.module.scss';
import { areaStyles, hoverIcons, icons, lineStyles } from './mapStyles';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { mapFilterSettingSelector } from './mapFilterSettingSlice';
import { lineSelector, pointSelector, sortedAreaSelector } from '../locationSlice';
import { setPosition, setZoomLevel } from '../mapSlice';
import {
  getAreaLocationTypes,
  isArea,
  isAreaLine,
  isLine,
  isNoFillArea,
  locationEnum,
  polygonPath,
} from './constants';
import useSelectionHandler from './useSelectionHandler';
import MarkerClusterer from '@googlemaps/markerclustererplus';

/**
 *
 * Do not modify, copy or reuse
 */
const useMapAssetRenderer = ({ isClickable }) => {
  const { handleSelection, dismissSelectionModal } = useSelectionHandler();
  const dispatch = useDispatch();
  const filterSettings = useSelector(mapFilterSettingSelector);
  const initAssetGeometriesState = () => {
    const nextAssetGeometries = {};
    for (const key in filterSettings) {
      nextAssetGeometries[key] = [];
    }
    return nextAssetGeometries;
  };

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

  const areaAssets = useSelector(sortedAreaSelector);
  const lineAssets = useSelector(lineSelector);
  const pointAssets = useSelector(pointSelector);

  const assetFunctionMap = (assetType) => {
    return !!isArea(assetType)
      ? isNoFillArea(assetType)
        ? drawNoFillArea
        : drawArea
      : !!isLine(assetType)
      ? drawLine
      : drawPoint;
  };

  const markerClusterRef = useRef();
  useEffect(() => {
    dismissSelectionModal();
    markerClusterRef?.current?.repaint();
  }, [filterSettings?.gate, filterSettings?.water_valve]);
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

    const clusterStyle = {
      textColor: 'white',
      textSize: 20,
      textLineHeight: 20,
      height: 28,
      width: 28,
      className: styles.selectedClusterIcon,
    };
    const clusterStyles = [clusterStyle, clusterStyle, clusterStyle, clusterStyle, clusterStyle];

    const markerCluster = new MarkerClusterer(map, markers, {
      ignoreHidden: true,
      styles: clusterStyles,
    });

    markerCluster.addMarkers(markers, true);
    maps.event.addListener(markerCluster, 'click', (cluster) => {
      if (map.getZoom() >= 20 && cluster.markers_.length > 1) {
        const pointAssets = {
          gate: [],
          water_valve: [],
        };
        cluster.markers_.map((point) => {
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
    markerClusterRef.current = markerCluster;
  };

  const drawAssets = (map, maps, mapBounds) => {
    maps.event.addListenerOnce(map, 'idle', function () {
      markerClusterRef?.current?.repaint();
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

    assetsWithLocations.forEach((idx) => {
      const locationType = assets[idx].type !== undefined ? assets[idx].type : idx;
      assets[idx].type === undefined
        ? assets[locationType].forEach((location) => {
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
    const pointsArray = [...assetGeometries.gate, ...assetGeometries.water_valve];

    createMarkerClusters(maps, map, pointsArray);
    // TODO: only fitBounds if there is at least one location in the farm
    hasLocation && map.fitBounds(mapBounds);
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

    // Event listener for point click
    maps.event.addListener(marker, 'click', function (mapsMouseEvent) {
      const latlng = map.getCenter().toJSON();
      dispatch(setPosition(latlng));
      dispatch(setZoomLevel(map.getZoom()));
      handleSelection(mapsMouseEvent.latLng, assetGeometries, maps, true);
    });

    marker.setOptions({ visible: isVisible });
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
