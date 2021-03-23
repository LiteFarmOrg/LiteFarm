import React, { useEffect, useState } from 'react';
import { areaStyles, lineStyles, icons } from './mapStyles';
import { isArea, isLine, isPoint } from './constants';
import { useSelector } from 'react-redux';
import { locationInfoSelector } from '../mapSlice';
import { defaultColour } from './styles.module.scss';

export default function useDrawingManager() {
  const [map, setMap] = useState(null);
  const [maps, setMaps] = useState(null);
  const [drawingManager, setDrawingManager] = useState(null);
  const [supportedDrawingModes, setDrawingModes] = useState(null);
  const [drawLocationType, setDrawLocationType] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingToCheck, setDrawingToCheck] = useState(null);

  const [onBackPressed, setOnBackPressed] = useState(false);
  const [onSteppedBack, setOnSteppedBack] = useState(false);

  const overlayData = useSelector(locationInfoSelector);

  useEffect(() => {
    if (onBackPressed) {
      drawingToCheck?.overlay.setMap(null);
      setOnBackPressed(false);
    }
  }, [drawingToCheck, onBackPressed]);

  useEffect(() => {
    if (!onSteppedBack) return;
    const { type } = overlayData;
    setDrawLocationType(type);
    setIsDrawing(false);
    if (isArea(type)) {
      const redrawnPolygon = new maps.Polygon({
        paths: overlayData.grid_points,
        strokeWeight: 2,
        fillOpacity: 0.3,
        editable: true,
        draggable: true,
        fillColor: areaStyles[type].colour,
        strokeColor: areaStyles[type].colour,
        geodesic: true,
        suppressUndo: true,
      });
      redrawnPolygon.setMap(map);
      setDrawingToCheck({
        type: maps.drawing.OverlayType.POLYGON,
        overlay: redrawnPolygon,
      });
    } else if (isLine(type)) {
      console.log('line reconstruction not implemented');
    } else if (isPoint(type)) {
      let redrawnMarker = new maps.Marker({
        position: overlayData.point,
        icon: icons[type],
        draggable: true,
      });
      redrawnMarker.setMap(map);
      setDrawingToCheck({
        type: maps.drawing.OverlayType.MARKER,
        overlay: redrawnMarker,
      });
    }
    setOnSteppedBack(false);
  }, [onSteppedBack, map, maps, overlayData]);

  const initDrawingState = (map, maps, drawingManagerInit, drawingModes) => {
    setMap(map);
    setMaps(maps);
    setDrawingManager(drawingManagerInit);
    setDrawingModes(drawingModes);
  }

  const startDrawing = (type) => {
    setDrawLocationType(type);
    setIsDrawing(true);
    drawingManager.setOptions(getDrawingOptions(type));
    drawingManager.setDrawingMode(getDrawingMode(type, supportedDrawingModes));
  }

  const finishDrawing = (drawing, innerMap, globalMap) => {
    setIsDrawing(false);
    setDrawingToCheck(drawing);
    if (drawing.type === 'polyline') {
      const FIXED_WIDTH = 30;
      const { overlay } = drawing;
      const path = overlay.getPath().getArray();
      let leftPoints = [];
      let rightPoints = [];
      let bearings = [];
      const linePoints = path.map((vertex) => {
        return { lat: vertex.lat(), lng: vertex.lng() };
      })
      const headings = path.map((point, i, arr) => {
        if(i === 0  || i === path.length - 1) {
          const initialPoint = i === 0 ? point : path[i - 1];
          const nextPoint = i === 0 ? path[i + 1] : point;
          const heading =innerMap?.geometry?.spherical?.computeHeading(initialPoint, nextPoint);
          const {left, right} = calculatePerpendiculars(heading);
          bearings.push(heading);
          leftPoints.push(innerMap?.geometry?.spherical?.computeOffset(point, FIXED_WIDTH/2, left));
          rightPoints.push(innerMap?.geometry?.spherical?.computeOffset(point, FIXED_WIDTH/2, right));
          return heading;
        } else {
          const heading = innerMap?.geometry?.spherical?.computeHeading(point, path[i + 1]);
          bearings.push(heading);
          // OC: 180 is added to get the angle from the perspective of the 2nd point.
          const angleFormed = heading - (adjustAngle(bearings[i - 1] + 180));
          const angleFormedInRadians = Math.abs(angleFormed) * Math.PI / 180;
          const distance =  FIXED_WIDTH / ( 2 * Math.sin(angleFormedInRadians / 2));
          const leftHeading =  adjustAngle(heading - (angleFormed / 2));
          const rightHeading =  adjustAngle(leftHeading + 180);
          console.log(heading, leftHeading, rightHeading);
          leftPoints.push(innerMap?.geometry?.spherical?.computeOffset(point, distance, leftHeading));
          rightPoints.push(innerMap?.geometry?.spherical?.computeOffset(point, distance, rightHeading));
          return heading;
        }
      }).filter((v) => v !== null);
      const polyPath = leftPoints.concat(rightPoints.reverse());
      const bermudaTriangle = new innerMap.Polygon({
        paths: polyPath,
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF0000",
        fillOpacity: 0.35,
      });
      bermudaTriangle.setMap(globalMap);

      console.log(leftPoints, rightPoints);
      console.log(headings);
      console.log(bearings);
    }
  }

  const calculatePerpendiculars = (bearing) => {
    const left = adjustAngle(bearing - 90);
    const right = adjustAngle(bearing + 90);

    return { left, right };
  }

  const adjustAngle = (currentAngle) => {
    if (Math.abs(currentAngle) > 180) {
      let angle = 360 - Math.abs(currentAngle);
      angle = currentAngle >= 0 ? angle * (-1) : angle;
      return angle;
    }
    return currentAngle;

  }

  const resetDrawing = (wasBackPressed = false) => {
    setOnBackPressed(wasBackPressed);
    drawingToCheck?.overlay.setMap(null);
    setDrawingToCheck(null);
  }

  const closeDrawer = () => {
    setIsDrawing(false);
    setDrawLocationType(null);
    drawingManager.setDrawingMode();
  }

  const getOverlayInfo = () => {
    const { overlay } = drawingToCheck;
    const { computeArea, computeLength, computeDistanceBetween } = maps.geometry.spherical;
    if (isArea(drawLocationType)) {
      const path = overlay.getPath().getArray();
      const perimeter = Math.round(computeLength(path) + computeDistanceBetween(path[0], path[path.length - 1]));
      const area = Math.round(computeArea(path));
      const grid_points = path.map((vertex) => {
        return { lat: vertex.lat(), lng: vertex.lng() };
      });
      return { type: drawLocationType, grid_points, area, perimeter };
    }
    // console.log('overlay', drawLocationType);
    // if (isLine(drawLocationType)) {
    //   const line_points = maps.polyline.getPath();
    //   const length = Math.round(computeLength(line_points));
    //   console.log(line_points)
    //   console.log(length);
    //   // const width = ???;
    //   return { line_points, length };
    // }
    if (isPoint(drawLocationType)) {
      const position = overlay.getPosition();
      const point = { lat: position.lat(), lng: position.lng() };
      return { type: drawLocationType, point };
    }
    ;
  }

  const reconstructOverlay = () => {
    setOnSteppedBack(true);
  }

  // todo undo drawing

  const drawingState = {
    type: drawLocationType,
    isActive: isDrawing,
    supportedDrawingModes,
    drawingManager,
    drawingToCheck,
  }
  const drawingFunctions = {
    initDrawingState,
    startDrawing,
    finishDrawing,
    resetDrawing,
    closeDrawer,
    getOverlayInfo,
    reconstructOverlay,
  }

  return [drawingState, drawingFunctions];
}

const getDrawingOptions = (type) => {
  if (isArea(type)) {
    const { colour } = areaStyles[type];
    return {
      polygonOptions: {
        strokeWeight: 2,
        fillOpacity: 0.3,
        editable: true,
        draggable: true,
        fillColor: colour,
        strokeColor: colour,
        geodesic: true,
        suppressUndo: true,
      },
    }
  }
  ;

  if (isLine(type)) {
    const { colour, dashScale, dashLength } = lineStyles[type];
    return {
      polylineOptions: {
        strokeWeight: 2,
        editable: true,
        draggable: true,
        fillColor: colour,
        strokeColor: defaultColour,
        geodesic: true,
        suppressUndo: true,
        icons: [
          {
            icon: {
              path: "M 0,0 0,1",
              strokeColor: colour,
              strokeOpacity: 1,
              strokeWeight: 2,
              scale: dashScale,
            },
            offset: "0",
            repeat: dashLength,
          },
        ],
      },
    }
  }
  ;

  if (isPoint(type)) return {
    markerOptions: {
      icon: icons[type],
      draggable: true,
      crossOnDrag: false,
    },
  };

  console.log("invalid location type");
  return null;
}

const getDrawingMode = (type, supportedDrawingModes) => {
  if (isArea(type)) return supportedDrawingModes.POLYGON;
  if (isLine(type)) return supportedDrawingModes.POLYLINE;
  if (isPoint(type)) return supportedDrawingModes.MARKER;

  console.log("invalid location type");
  return null;
}
