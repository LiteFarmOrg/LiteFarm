import { defaultColour } from './styles.module.scss';
import { areaStyles, lineStyles, icons, hoverIcons } from './mapStyles';

// Area Drawing
const drawArea = (map, maps, mapBounds, area) => {
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

  maps.event.addListener(polygon, "mouseover", function() {
    this.setOptions({ fillOpacity: 0.8 });
  });
  maps.event.addListener(polygon, "mouseout", function() {
    this.setOptions({ fillOpacity: 0.5 });
  });

  // draw dotted outline
  let borderPoints = points.map((point) => ({
    ...point    
  }));
  borderPoints.push(points[0]);

  const lineSymbol = {
    path: "M 0,0 0,1",
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
        offset: "0",
        repeat: dashLength,
      },
    ],
  });
  polyline.setMap(map);

  // add area name label
  const fieldMarker = new maps.Marker({
    position: polygon.getPolygonBounds().getCenter(),
    map: map,
    icon: lineSymbol,
    label: { text: name, color: 'white' },
  });
  fieldMarker.setMap(map);

  maps.event.addListener(polygon, "click", function() {
    console.log("clicked area");
    // this.setMap(null);
    // polyline.setMap(null);
    // fieldMarker.setMap(null);
    this.setOptions({visible: false});
    polyline.setOptions({visible: false});
    fieldMarker.setOptions({visible: false});
  });
}

// Line Drawing
const drawLine = (map, maps, mapBounds, line) => {
  const { grid_points: points, name, type } = line;
  const { colour, dashScale, dashLength } = lineStyles[type];
  points.forEach((point) => {
    mapBounds.extend(point);
  });

  // draw dotted outline
  const lineSymbol = (c) => ({
    path: "M 0,0 0,1",
    strokeColor: c,
    strokeOpacity: 1,
    strokeWeight: 2,
    scale: dashScale,
  });
  var polyline = new maps.Polyline({
    path: points,
    strokeColor: defaultColour,
    strokeOpacity: 1.0,
    strokeWeight: 2,
    icons: [
      {
        icon: lineSymbol(colour),
        offset: "0",
        repeat: dashLength,
      },
    ],
  });
  polyline.setMap(map);

  maps.event.addListener(polyline, "mouseover", function() {
    this.setOptions({
      strokeColor: colour,
      icons: [
        {
          icon: lineSymbol(defaultColour),
          offset: "0",
          repeat: dashLength,
        },
      ],
    });
  });
  maps.event.addListener(polyline, "mouseout", function() {
    this.setOptions({
      strokeColor: defaultColour,
      icons: [
        {
          icon: lineSymbol(colour),
          offset: "0",
          repeat: dashLength,
        },
      ],
    });
  });
  maps.event.addListener(polyline, "click", function() {
    console.log("clicked line");
  });
}

// Point Drawing
const drawPoint = (map, maps, mapBounds, point) => {
  const { grid_point, name, type } = point;
  mapBounds.extend(grid_point);

  var marker = new maps.Marker({
    position: grid_point,
    icon: icons[type],
  });
  marker.setMap(map);

  maps.event.addListener(marker, "mouseover", function() {
    this.setOptions({ icon: hoverIcons[type] });
  });
  maps.event.addListener(marker, "mouseout", function() {
    this.setOptions({ icon: icons[type] });
  });
}

export {
  drawArea,
  drawLine,
  drawPoint,
}
