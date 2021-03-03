import {
  primaryColour,
  defaultColour,
  barnColour,
  ceremonialSiteColour,
  farmBoundColour,
  fieldColour,
  greenhouseColour,
  groundwaterColour,
  naturalAreaColour,
  residenceColour,
} from './styles.module.scss';

const areaStyles = {
  'barn': {
    colour: barnColour,
    dashScale: 2,
    dashLength: '14px',
  },
  'ceremonial': {
    colour: ceremonialSiteColour,
    dashScale: 1.5,
    dashLength: '8px',
  },
  'farmBound': {
    colour: farmBoundColour,
    dashScale: 1,
    dashLength: '1px',
  },
  'field': {
    colour: fieldColour,
    dashScale: 1,
    dashLength: '6px',
  },
  'greenhouse': {
    colour: greenhouseColour,
    dashScale: 1,
    dashLength: '8px',
  },
  'groundwater': {
    colour: groundwaterColour,
    dashScale: 0.7,
    dashLength: '6px',
  },
  'natural': {
    colour: naturalAreaColour,
    dashScale: 0.7,
    dashLength: '12px',
  },
  'residence': {
    colour: residenceColour,
    dashScale: 0,
    dashLength: '12px',
  },
}

const drawArea = (map, maps, mapBounds, areaType, area) => {
  const { grid_points: points, field_name } = area;
  const { colour, dashScale, dashLength } = areaStyles[areaType];
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
  maps.event.addListener(polygon, "click", function() {
    console.log("open sesame");
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
  maps.Polygon.prototype.getPolygonBounds = function () {
    var bounds = new maps.LatLngBounds();
    this.getPath().forEach(function (element, index) {
      bounds.extend(element);
    });
    return bounds;
  };
  const fieldMarker = new maps.Marker({
    position: polygon.getPolygonBounds().getCenter(),
    map: map,
    icon: lineSymbol,
    label: { text: field_name, color: 'white' },
  });
  fieldMarker.setMap(map);
}

export {
  drawArea,
}
