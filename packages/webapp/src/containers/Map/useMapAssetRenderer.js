import { defaultColour } from './styles.module.scss';
import { areaStyles, hoverIcons, icons, lineStyles } from './mapStyles';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { mapFilterSettingSelector } from './mapFilterSettingSlice';
import { fieldsSelector } from '../fieldSlice';
import { locationEnum } from './constants';

const useMapAssetRenderer = () => {
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
      if (prevFilterState?.[key] !== filterSettings?.[key]) {
        for (const assetGeometry of assetGeometries?.[key] || []) {
          assetGeometry?.polygon?.setOptions({ visible: filterSettings?.[key] });
          assetGeometry?.polyline?.setOptions({ visible: filterSettings?.[key] });
          assetGeometry?.marker?.setOptions({ visible: filterSettings?.[key] });
        }
      }
    }
    setPrevFilterState(filterSettings);
  }, [filterSettings]);

  const fields = useSelector(fieldsSelector);
  const drawAssets = (map, maps, mapBounds) => {
    //TODO getLocationsSelector
    for (const field of fields) {
      const newState = { ...assetGeometries };
      newState[locationEnum.field]?.push(
        drawArea(map, maps, mapBounds, field, filterSettings?.[locationEnum.field]),
      );
      setAssetGeometries(newState);
    }
    map.fitBounds(mapBounds);
  };
  return { drawAssets };
};

// Area Drawing
const drawArea = (map, maps, mapBounds, area, isVisible) => {
  const { grid_points: points, name, type } = area;
  const { colour, dashScale, dashLength } = areaStyles[type];
  points.forEach((point) => {
    mapBounds.extend(point);
  });

  const polygon = new maps.Polygon({
    paths: points,
    strokeColor: defaultColour,
    // strokeOpacity: 0.8,
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
    position: polygon.getPolygonBounds().getCenter(),
    map: map,
    icon: lineSymbol,
    label: { text: name, color: 'white' },
  });
  marker.setMap(map);

  maps.event.addListener(polygon, 'click', function () {
    console.log('clicked area');
    this.setMap(null);
    polyline.setMap(null);
    marker.setMap(null);
  });
  marker.setOptions({ visible: isVisible });
  polygon.setOptions({ visible: isVisible });
  polyline.setOptions({ visible: isVisible });
  return { polygon, polyline, marker };
};

// Line Drawing
const drawLine = (map, maps, mapBounds, line, isVisible) => {
  const { grid_points: points, name, type } = line;
  const { colour, dashScale, dashLength } = lineStyles[type];
  points.forEach((point) => {
    mapBounds.extend(point);
  });

  var polyline = new maps.Polyline({
    path: points,
    strokeColor: defaultColour,
    strokeOpacity: 1.0,
    strokeWeight: 2,
    // fillColor: primaryColour,
    // fillOpacity: 0.35,
  });
  polyline.setMap(map);

  // draw dotted outline
  const lineSymbol = {
    path: 'M 0,0 0,1',
    strokeColor: colour,
    strokeOpacity: 1,
    strokeWeight: 2,
    scale: dashScale,
  };
  const dottedPolyline = new maps.Polyline({
    path: points,
    strokeOpacity: 0,
    icons: [
      {
        icon: lineSymbol,
        offset: '0',
        repeat: dashLength,
      },
    ],
  });
  dottedPolyline.setMap(map);

  maps.event.addListener(polyline, 'mouseover', function () {
    this.setOptions({ strokeColor: colour });
  });
  maps.event.addListener(polyline, 'mouseout', function () {
    this.setOptions({ strokeColor: defaultColour });
  });
  maps.event.addListener(polyline, 'click', function () {
    console.log('clicked line');
  });

  polyline.setOptions({ visible: isVisible });
  return { polyline };
};

// Point Drawing
const drawPoint = (map, maps, mapBounds, point, isVisible) => {
  const { grid_point, name, type } = point;
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

  marker.setOptions({ visible: isVisible });
  return { marker };
};

export default useMapAssetRenderer;
