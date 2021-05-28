import { useRef } from 'react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  cropLocationEntitiesSelector,
  cropLocationsSelector,
} from '../../containers/locationSlice';
import { isArea, isLine, isNoFillArea, polygonPath } from '../../containers/Map/constants';
import { areaStyles, lineStyles } from '../../containers/Map/mapStyles';
import styles, { defaultColour } from '../../containers/Map/styles.module.scss';

const useDrawSelectableLocations = () => {
  const cropLocations = useSelector(cropLocationsSelector);
  console.log(cropLocations);

  const assetFunctionMap = (assetType) => {
    return !!isArea(assetType) ? drawArea : drawLine;
  };

  const [selectedLocation, _setSelectedLocation] = useState(null);
  const selectedLocationRef = useRef(selectedLocation);
  const setSelectedLocation = (data) => {
    selectedLocationRef.current = data;
    _setSelectedLocation(data);
  };

  const drawLocations = (map, maps, mapBounds) => {
    cropLocations.forEach((location) => {
      assetFunctionMap(location.type)(map, maps, mapBounds, location);
    });
  };

  const resetStyles = (maps, location) => {
    if (location.asset === 'area') {
      const { area, polygon, polyline, marker } = location;
      const { colour, selectedColour } = areaStyles[area.type];
      polygon.setOptions({
        fillColor: colour,
        fillOpacity: 0.5,
      });
      marker.setOptions({
        label: {
          text: area.name,
          color: 'white',
          fontSize: '16px',
          className: styles.mapLabel,
        },
      });
      maps.event.addListener(polygon, 'mouseover', function () {
        this.setOptions({ fillOpacity: 0.8 });
      });
      maps.event.addListener(polygon, 'mouseout', function () {
        this.setOptions({ fillOpacity: 0.5 });
      });
      maps.event.addListener(polygon, 'click', function () {
        if (selectedLocationRef.current) {
          resetStyles(maps, selectedLocationRef.current);
        }

        setSelectedLocation({
          area,
          polygon,
          polyline,
          marker,
          asset: 'area',
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
        maps.event.clearInstanceListeners(polygon);
      });
    }
  };

  // Draw an area
  const drawArea = (map, maps, mapBounds, area) => {
    const { grid_points: points, name, type } = area;
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
    maps.event.addListener(polygon, 'click', function () {
      if (selectedLocationRef.current) {
        resetStyles(maps, selectedLocationRef.current);
      }

      setSelectedLocation({
        area,
        polygon,
        polyline,
        marker,
        asset: 'area',
      });

      this.setOptions({
        fillColor: selectedColour,
        fillOpacity: 1.0,
      });
      marker.setOptions({
        label: {
          text: name,
          color: '#282B36',
          fontSize: '16px',
          className: styles.mapLabel,
        },
      });
      maps.event.clearInstanceListeners(polygon);

      // create record of all items added to map
      // maybe a map
      // use current selected item to identify map item that needs to change
    });

    // marker.setOptions({ visible: filterSettings?.label && isVisible });
    // polygon.setOptions({ visible: isVisible });
    // polyline.setOptions({ visible: isVisible });
    // return {
    //   polygon,
    //   polyline,
    //   marker,
    //   location_id: area.location_id,
    //   location_name: area.name,
    //   asset: 'area',
    //   type: area.type,
    // };
  };

  // Draw a line
  const drawLine = (map, maps, mapBounds, line) => {
    const { line_points: points, name, type, width } = line;
    let linePolygon;
    const realWidth = Number(width);
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
    // if (isAreaLine(type)) {
    const polyPath = polygonPath(polyline.getPath().getArray(), realWidth, maps);
    linePolygon = new maps.Polygon({
      paths: polyPath,
      ...lineStyles[type].polyStyles,
    });
    linePolygon.setMap(map);
    // }

    // hover styles
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
    maps.event.addListener(linePolygon, 'click', function (mapsMouseEvent) {
      // const latlng = map.getCenter().toJSON();
      // dispatch(setPosition(latlng));
      // dispatch(setZoomLevel(map.getZoom()));
      // handleSelection(mapsMouseEvent.latLng, assetGeometries, maps, true);
      console.log(`${name} got clicked`);
      setSelectedLocation({
        location: line,
        polygon: linePolygon,
        asset: 'line',
      });
    });

    // let asset;
    // if (isAreaLine(type)) {
    //   linePolygon.setOptions({ visible: isVisible });
    //   asset = { polygon: linePolygon, polyline };
    // } else {
    //   asset = { polyline };
    // }
    // polyline.setOptions({ visible: isVisible });

    // maps.event.addListener(
    //   isAreaLine(type) ? linePolygon : polyline,
    //   'click',
    //   function (mapsMouseEvent) {
    //     handleSelection(mapsMouseEvent.latLng, assetGeometries, maps, true);
    //   },
    // );

    // return {
    //   ...asset,
    //   location_id: line.location_id,
    //   location_name: line.name,
    //   asset: 'line',
    //   type: line.type,
    // };
  };

  return { drawLocations, selectedLocation };
};

export default useDrawSelectableLocations;
