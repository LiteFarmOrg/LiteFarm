import {
  isArea,
  isCircle,
  isLine,
  isNoFillArea,
  isPoint,
  locationEnum,
  polygonPath,
} from '../../../containers/Map/constants';
import {
  areaStyles,
  circleStyles,
  hoverIcons,
  icons,
  lineStyles,
  selectedIcons,
} from '../../../containers/Map/mapStyles';
import { defaultColour } from '../../../containers/Map/styles.module.scss';
import CreateMarkerCluster, { markerSVG } from '../../Map/MarkerCluster';

export const SELECTED_POLYGON_OPACITY = 1.0;
export const DEFAULT_POLYGON_OPACITY = 0.5;
export const HOVER_POLYGON_OPACITY = 0.8;

export const drawLocation = (map, maps, mapBounds, location, disableHover = false) => {
  if (isCircle(location.type)) return drawCircle(map, maps, mapBounds, location, disableHover);
  if (isNoFillArea(location.type))
    return drawNoFillArea(map, maps, mapBounds, location, disableHover);
  if (isLine(location.type)) return drawLine(map, maps, mapBounds, location, disableHover);
  if (isArea(location.type)) return drawArea(map, maps, mapBounds, location, disableHover);
  if (isPoint(location.type)) return drawPoint(map, maps, mapBounds, location, disableHover);
};

const drawArea = (map, maps, mapBounds, location, disableHover) => {
  const { grid_points: points, name, type } = location;
  const styles = areaStyles[type];
  const { colour, selectedColour, dashScale, dashLength } = styles;

  points.forEach((point) => {
    mapBounds.extend(point);
  });

  const polygon = new maps.Polygon({
    paths: points,
    strokeColor: location.strokeColour || defaultColour,
    strokeWeight: 2,
    fillColor: location.colour || colour,
    fillOpacity: location.fillOpacity ?? DEFAULT_POLYGON_OPACITY,
  });

  if (!disableHover) {
    maps.event.addListener(polygon, 'mouseover', function () {
      this.fillOpacity !== SELECTED_POLYGON_OPACITY &&
        this.setOptions({ fillOpacity: HOVER_POLYGON_OPACITY });
    });
    maps.event.addListener(polygon, 'mouseout', function () {
      this.fillOpacity !== SELECTED_POLYGON_OPACITY &&
        this.setOptions({ fillOpacity: DEFAULT_POLYGON_OPACITY });
    });
  }

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
    label: name && {
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

const drawCircle = (map, maps, mapBounds, location, disableHover) => {
  const { center, radius, name, type } = location;
  const styles = circleStyles[type];

  const { strokeColour, fillColour, markerColour } = styles;

  mapBounds.extend(center);
  const circle = new maps.Circle({
    center,
    radius, // in meters
    strokeColor: location.lineColour ?? strokeColour,
    strokeOpacity: 1,
    strokeWeight: 2,
    fillColor: fillColour,
    fillOpacity: location.fillOpacity ?? DEFAULT_POLYGON_OPACITY,
    map,
  });

  if (!disableHover) {
    maps.event.addListener(circle, 'mouseover', function () {
      if (this.fillOpacity !== SELECTED_POLYGON_OPACITY) {
        this.setOptions({ fillOpacity: HOVER_POLYGON_OPACITY });
      }
    });
    maps.event.addListener(circle, 'mouseout', function () {
      if (this.fillOpacity !== SELECTED_POLYGON_OPACITY) {
        this.setOptions({ fillOpacity: DEFAULT_POLYGON_OPACITY });
      }
    });
  }

  const label = new maps.Marker({
    position: center,
    map,
    icon: {
      path: maps.SymbolPath.CIRCLE,
      fillColor: location.markerColour ?? markerColour,
      fillOpacity: 1,
      strokeWeight: 0,
      scale: 2,
    },
    clickable: false,
    label: name && {
      text: name,
      color: location.markerColour ?? markerColour,
      fontSize: '10px',
      className: styles.circleLabel,
    },
  });

  return {
    location,
    circle,
    label,
    styles,
  };
};

const drawLine = (map, maps, mapBounds, location, disableHover) => {
  const { line_points: points, type, width } = location;
  const realWidth =
    type === locationEnum.watercourse
      ? Number(location.buffer_width) + Number(width)
      : Number(width > 5 ? width : 5);
  const styles = lineStyles[type];
  const { colour, dashScale, dashLength, defaultDashColour } = styles;
  points.forEach((point) => {
    mapBounds.extend(point);
  });

  // draw dotted outline
  const lineSymbol = (c) => ({
    path: 'M 0,0 0,1',
    strokeColor: location.lineColour ?? c,
    strokeOpacity: 1,
    strokeWeight: 2,
    scale: dashScale,
  });
  const polyline = new maps.Polyline({
    path: points,
    strokeColor: defaultDashColour || defaultColour,
    strokeOpacity: 1.0,
    strokeWeight: 2,
    icons: [
      {
        icon: lineSymbol(colour),
        offset: '0',
        repeat: dashLength,
      },
    ],
    zIndex: location.zIndex ?? 0,
  });

  if (!disableHover) {
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
  }

  const polyPath = polygonPath(polyline.getPath().getArray(), realWidth, maps);
  const linePolygon = new maps.Polygon({
    paths: polyPath,
    ...lineStyles[type].polyStyles,
    strokeColor: colour,
    fillColor: colour,
  });

  if (!disableHover) {
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
  }

  linePolygon.setMap(map);
  polyline.setMap(map);
  return {
    location,
    polygon: linePolygon,
    polyline,
    styles,
  };
};

const drawNoFillArea = (map, maps, mapBounds, area, disableHover) => {
  const { grid_points } = area;
  const line = { ...area, line_points: [...grid_points, grid_points[0]], width: 1 };
  return drawLine(map, maps, mapBounds, line, disableHover);
};

const drawPoint = (map, maps, mapBounds, location, disableHover) => {
  const { point: grid_point, name, type } = location;
  mapBounds.extend(grid_point);

  const marker = new maps.Marker({
    position: grid_point,
    icon: icons[type],
  });

  if (!disableHover) {
    maps.event.addListener(marker, 'mouseover', function () {
      this.clickable &&
        marker.icon !== selectedIcons[type] &&
        this.setOptions({ icon: hoverIcons[type] });
    });
    maps.event.addListener(marker, 'mouseout', function () {
      this.clickable &&
        marker.icon !== selectedIcons[type] &&
        this.setOptions({ icon: icons[type] });
    });
  }

  marker.setMap(map);
  return {
    marker,
    location,
  };
};

export const createMarkerClusters = (
  maps,
  map,
  points,
  selectedLocationsRef,
  markerClusterRef,
  maxZoom,
) => {
  const markers = points.map((point) => {
    point.marker.location_id = point.location.location_id;
    point.marker.name = point.location.name;
    point.marker.type = point.location.type;
    return point.marker;
  });

  return CreateMarkerCluster(
    map,
    maps,
    markers,
    [
      {
        event: 'mouseover',
        callbackFunction: (marker) => () => {
          const svg = markerSVG('#028577', '#E3F8EC');
          marker.setIcon({ url: `data:image/svg+xml;base64,${svg}` });
        },
      },
      {
        event: 'mouseout',
        callbackFunction: (marker) => () => {
          const svg = markerSVG('#028577', '#ffffff');
          marker.setIcon({ url: `data:image/svg+xml;base64,${svg}` });
        },
      },
    ],
    markerClusterRef,
    selectedLocationsRef,
    maxZoom,
  );
};
