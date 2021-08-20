import { isArea, locationEnum, polygonPath } from '../../../containers/Map/constants';
import {
  areaStyles,
  hoverIcons,
  icons,
  lineStyles,
  selectedIcons,
} from '../../../containers/Map/mapStyles';
import { defaultColour } from '../../../containers/Map/styles.module.scss';

export const SELECTED_POLYGON_OPACITY = 1.0;
export const DEFAULT_POLYGON_OPACITY = 0.5;
export const HOVER_POLYGON_OPACITY = 0.8;

export const drawCropLocation = (map, maps, mapBounds, location) => {
  return !!isArea(location.type)
    ? drawArea(map, maps, mapBounds, location)
    : drawLine(map, maps, mapBounds, location);
};

const drawArea = (map, maps, mapBounds, location) => {
  const { grid_points: points, name, type } = location;
  const styles = areaStyles[type];
  const { colour, selectedColour, dashScale, dashLength } = styles;
  points.forEach((point) => {
    mapBounds.extend(point);
  });

  const polygon = new maps.Polygon({
    paths: points,
    strokeColor: defaultColour,
    strokeWeight: 2,
    fillColor: colour,
    fillOpacity: DEFAULT_POLYGON_OPACITY,
  });

  maps.event.addListener(polygon, 'mouseover', function () {
    this.fillOpacity !== SELECTED_POLYGON_OPACITY &&
      this.setOptions({ fillOpacity: HOVER_POLYGON_OPACITY });
  });
  maps.event.addListener(polygon, 'mouseout', function () {
    this.fillOpacity !== SELECTED_POLYGON_OPACITY &&
      this.setOptions({ fillOpacity: DEFAULT_POLYGON_OPACITY });
  });

  const lineSymbol = {
    path: 'M 0,0 0,1',
    strokeColor: colour,
    strokeOpacity: 1,
    strokeWeight: 2,
    scale: dashScale,
  };
  const polyline = new maps.Polyline({
    path: [...points, points[0]],
    strokeOpacity: 0,
    icons: [
      {
        icon: lineSymbol,
        offset: '0',
        repeat: dashLength,
      },
    ],
  });

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
  polygon.setMap(map);
  polyline.setMap(map);
  marker.setMap(map);
  return {
    location,
    polygon,
    polyline,
    marker,
    styles,
  };
};

const drawLine = (map, maps, mapBounds, location) => {
  const { line_points: points, type, width } = location;
  const realWidth =
    type === locationEnum.watercourse
      ? Number(location.buffer_width) + Number(width)
      : Number(width);
  const styles = lineStyles[type];
  const { colour, dashScale, dashLength, selectedColour } = styles;
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
  const polyline = new maps.Polyline({
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

  const polyPath = polygonPath(polyline.getPath().getArray(), realWidth, maps);
  const linePolygon = new maps.Polygon({
    paths: polyPath,
    ...lineStyles[type].polyStyles,
  });
  maps.event.addListener(linePolygon, 'mouseover', function () {
    this.clickable &&
      this.fillOpacity !== SELECTED_POLYGON_OPACITY &&
      this.setOptions({ fillOpacity: HOVER_POLYGON_OPACITY });
  });
  maps.event.addListener(linePolygon, 'mouseout', function () {
    this.clickable &&
      this.fillOpacity !== SELECTED_POLYGON_OPACITY &&
      this.setOptions({ fillOpacity: DEFAULT_POLYGON_OPACITY });
  });

  linePolygon.setMap(map);
  polyline.setMap(map);
  return {
    location,
    polygon: linePolygon,
    polyline,
    styles,
  };
};

const drawPoint = (map, maps, mapBounds, location) => {
  const { point: grid_point, name, type } = location;
  mapBounds.extend(grid_point);

  const marker = new maps.Marker({
    position: grid_point,
    icon: icons[type],
  });

  maps.event.addListener(marker, 'mouseover', function () {
    this.clickable &&
      marker.icon !== selectedIcons[type] &&
      this.setOptions({ icon: hoverIcons[type] });
  });
  maps.event.addListener(marker, 'mouseout', function () {
    this.clickable && marker.icon !== selectedIcons[type] && this.setOptions({ icon: icons[type] });
  });

  marker.setMap(map);
  return {
    marker,
    location,
  };
};
