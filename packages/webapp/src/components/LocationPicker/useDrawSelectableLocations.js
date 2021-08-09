import { useRef } from 'react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  cropLocationsSelector,
} from '../../containers/locationSlice';
import { isArea, polygonPath } from '../../containers/Map/constants';
import { areaStyles, lineStyles } from '../../containers/Map/mapStyles';
import styles, { defaultColour } from '../../containers/Map/styles.module.scss';

const useDrawSelectableLocations = (setLocationId) => {
  const cropLocations = useSelector(cropLocationsSelector);

  const assetFunctionMap = (assetType) => {
    return !!isArea(assetType) ? drawArea : drawLine;
  };

  const [selectedLocation, _setSelectedLocation] = useState(null);
  const selectedLocationRef = useRef(selectedLocation);
  const setSelectedLocation = (data) => {
    selectedLocationRef.current = data;
    _setSelectedLocation(data);
    setLocationId(data?.locationId);
  };

  const reset_opacity = 0.5;

  const drawLocations = (map, maps, mapBounds, selectedLocationId) => {
    cropLocations.forEach((location) => {
      assetFunctionMap(location.type)(map, maps, mapBounds, location, selectedLocationId);
    });
    cropLocations.length > 0 && map.fitBounds(mapBounds);
  };

  const resetStyles = (color, polygon) => {
    polygon.setOptions({
      fillColor: color,
      fillOpacity: reset_opacity,
    });
  };


  // Draw an area
  const drawArea = (map, maps, mapBounds, area, selectedLocationId) => {
    const { grid_points: points, name, type, location_id } = area;
    const { colour, selectedColour, dashScale, dashLength } = areaStyles[type];
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
        color: (selectedLocationId !== undefined && selectedLocationId === location_id)? 'black' : 'white',
        fontSize: '16px',
        className: styles.mapLabel,
      },
    });
   

    if (selectedLocationId !== undefined && selectedLocationId === location_id) {
      polygon.setOptions({
        fillColor: selectedColour,
        fillOpacity: 1.0,
      });

      setSelectedLocation({
        area,
        polygon,
        polyline,
        marker,
        asset: 'area',
        locationId: area.location_id,
      }); 
    }

    setAreaListenersAndOptions(maps, area, polygon, polyline, marker);

    polygon.setMap(map);
    polyline.setMap(map);
    marker.setMap(map);
  };

  // Draw a line
  const drawLine = (map, maps, mapBounds, line, selectedLocationId) => {
    const { line_points: points, type, width, location_id } = line;
    const realWidth = Number(width);
    const { colour, dashScale, dashLength, selectedColour } = lineStyles[type];
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
    
    
    const polyPath = polygonPath(polyline.getPath().getArray(), realWidth, maps);
    const linePolygon = new maps.Polygon({
      paths: polyPath,
      ...lineStyles[type].polyStyles,
    });
  
    if (selectedLocationId !== undefined && selectedLocationId === location_id) {
      linePolygon.setOptions({
        fillColor: selectedColour,
        fillOpacity: 1.0,
      });
      
      setSelectedLocation({
        line,
        polygon: linePolygon,
        asset: 'line',
        locationId: line.location_id,
      }); 
    }

    setLineListenersAndOptions(maps, line, linePolygon);

    polyline.setMap(map);
    linePolygon.setMap(map);
  };

  const setAreaListenersAndOptions = (maps, area, polygon, polyline, marker) => {
    const { selectedColour } = areaStyles[area.type];
    maps.event.addListener(polygon, 'mouseover', function () {
      if (this.fillOpacity !== 1.0) {
        this.setOptions({ fillOpacity: 0.8 });
      }
    });
    maps.event.addListener(polygon, 'mouseout', function () {
      if (this.fillOpacity !== 1.0) {
        this.setOptions({ fillOpacity: 0.5 });
      }
    });
    maps.event.addListener(polygon, 'click', function () {
      if (selectedLocationRef.current) {
        if (selectedLocationRef.current.asset === 'line') {
          resetStyles(lineStyles[selectedLocationRef.current.line.type].colour, selectedLocationRef.current.polygon);
        } else {
          resetStyles(areaStyles[selectedLocationRef.current.area.type].colour, selectedLocationRef.current.polygon);
          selectedLocationRef.current.marker.setOptions({
            label: {
              text: selectedLocationRef.current.area.name,
              color: 'white',
              fontSize: '16px',
              className: styles.mapLabel,
            }
          });
        }
      }

      if (selectedLocationRef.current && selectedLocationRef.current.locationId === area.location_id) {
        setSelectedLocation(null);
        return;
      }

      setSelectedLocation({
        area,
        polygon,
        polyline,
        marker,
        asset: 'area',
        locationId : area.location_id,
      });

      this.setOptions({
        fillColor: selectedColour,
        fillOpacity: 1.0,
      });
      marker.setOptions({
        label: {
          text: area.name,
          color: '#282B36',
          fontSize: '16px',
          className: styles.mapLabel,
        },
      });
    });
  };

  const setLineListenersAndOptions = (maps, line, polygon) => {
    const { selectedColour } = lineStyles[line.type];
    maps.event.addListener(polygon, 'mouseover', function () {
      if (this.fillOpacity !== 1.0) {
        this.setOptions({ fillOpacity: 0.8 });
      }  
    });
    maps.event.addListener(polygon, 'mouseout', function () {
      if (this.fillOpacity !== 1.0) {
        this.setOptions({ fillOpacity: 0.5 });
      }
    });
    maps.event.addListener(polygon, 'click', function () {
      if (selectedLocationRef.current) {
        if (selectedLocationRef.current.asset === 'line') {
          resetStyles(lineStyles[selectedLocationRef.current.line.type].colour, selectedLocationRef.current.polygon);
        } else {
          resetStyles(areaStyles[selectedLocationRef.current.area.type].colour, selectedLocationRef.current.polygon);
          selectedLocationRef.current.marker.setOptions({
            label: {
              text: selectedLocationRef.current.area.name,
              color: 'white',
              fontSize: '16px',
              className: styles.mapLabel,
            }
          });
        }
      }

      if (selectedLocationRef.current && selectedLocationRef.current.locationId === line.location_id) {
        setSelectedLocation(null);
        return;
      }

      setSelectedLocation({
        line,
        polygon,
        asset: 'line',
        locationId: line.location_id,
      });

      this.setOptions({
        fillColor: selectedColour,
        fillOpacity: 1.0,
      });
    });
  };

  return { drawLocations };
};

export default useDrawSelectableLocations;
