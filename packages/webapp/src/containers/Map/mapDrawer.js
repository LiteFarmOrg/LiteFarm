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
import { TREE_ICON } from './constants';

const areaColour = {
  'barn': barnColour,
  'ceremonial': ceremonialSiteColour,
  'farmBound': farmBoundColour,
  'field': fieldColour,
  'greenhouse': greenhouseColour,
  'groundwater': groundwaterColour,
  'natural': naturalAreaColour,
  'residence': residenceColour,
}

const drawArea = (map, maps, mapBounds, areaType, area) => {
  console.log(area);
  const { grid_points: points, field_name } = area;
  points.forEach((point) => {
    mapBounds.extend(point);
  });

  const polygon = new maps.Polygon({
    paths: points,
    strokeColor: defaultColour,
    // strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: areaColour[areaType],
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
    path: "M 0,-1 0,1",
    strokeColor: areaColour[areaType],
    strokeOpacity: 1,
    strokeWeight: 2,
    scale: 1,
  };
  const polyline = new maps.Polyline({
    path: borderPoints,
    strokeOpacity: 0,
    icons: [
      {
        icon: lineSymbol,
        offset: "0",
        repeat: "8px",
      },
    ],
  });
  polyline.setMap(map);

  // add area name label
  let fieldIcon = {
    path: TREE_ICON,
    fillColor: areaColour[areaType],
    fillOpacity: 0,
    strokeWeight: 0,
    scale: 0.5,
  };
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
    icon: fieldIcon,
    label: { text: field_name, color: 'white' },
  });
  fieldMarker.setMap(map);
}

export {
  drawArea,
}
