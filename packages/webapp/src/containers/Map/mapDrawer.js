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

const drawArea = (map, maps, mapBounds, areaType, points) => {
  points.forEach((point) => {
    mapBounds.extend(point);
  });

  var polygon = new maps.Polygon({
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
  var polyline = new maps.Polyline({
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
}

export {
  drawArea,
}
