import React, { useEffect, useState } from 'react';
import { areaStyles, lineStyles, icons } from './mapStyles';
import { isArea, isLine, isPoint, locationEnum } from './constants';
import { useSelector } from 'react-redux';
import { locationInfoSelector } from '../mapSlice';
import { defaultColour } from './styles.module.scss';

export default function useDrawingManager() {
  const [map, setMap] = useState(null);
  const [maps, setMaps] = useState(null);
  const [drawingManager, setDrawingManager] = useState(null);
  const [supportedDrawingModes, setDrawingModes] = useState(null);
  const [widthPolygon, setWidthPolygon] = useState(null);
  const [lineWidth, setLineWidth] = useState(8);
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
    if (drawingToCheck?.type === 'polyline'
      && [locationEnum.watercourse, locationEnum.buffer_zone].includes(drawLocationType)) {
      const { overlay } = drawingToCheck;
      const path = overlay.getPath().getArray();
      console.log(path);
      const {leftPoints, rightPoints} = path.reduce(linePathPolygonConstructor, {
        leftPoints: [], rightPoints:[], bearings: [], width: lineWidth
      });
      const polyPath = leftPoints.concat(rightPoints.reverse());
      widthPolygon !== null && widthPolygon.setMap(null);
      const linePolygon = new maps.Polygon({
        paths: polyPath,
        ...lineStyles[drawLocationType].polyStyles
      });
      linePolygon.setMap(map);
      setWidthPolygon(linePolygon);
    } else if(widthPolygon !== null){
      widthPolygon.setMap(null);
    }
  }, [drawingToCheck, lineWidth]);

  useEffect(() => {
    if (!onSteppedBack) return;
    const { type } = overlayData;
    setDrawLocationType(type);
    setIsDrawing(false);
    if (isArea(type)) {
      const redrawnPolygon = new maps.Polygon({
        paths: overlayData.grid_points,
        ...getDrawingOptions(type).polygonOptions
      });
      redrawnPolygon.setMap(map);
      setDrawingToCheck({
        type: maps.drawing.OverlayType.POLYGON,
        overlay: redrawnPolygon,
      });
    } else if (isLine(type)) {
      setLineWidth(overlayData.width);
      const redrawnLine = new maps.Polyline({
        path: overlayData.line_points,
        ...getDrawingOptions(type).polylineOptions
      })
      redrawnLine.setMap(map);
      console.log(overlayData);
      setDrawingToCheck({
        type: maps.drawing.OverlayType.POLYLINE,
        overlay: redrawnLine
      })
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

  const finishDrawing = (drawing, innerMap) => {
    setIsDrawing(false);
    setDrawingToCheck(drawing);
    if (drawing.type === 'polyline') {
      addLineListeners(drawing, innerMap);
    }
  }
  const addLineListeners = (drawing, innerMap) => {
    const { overlay } = drawing;
    innerMap.event.addListener(overlay.getPath(), 'set_at', (redrawnLine) => {
      setDrawingToCheck({ ...drawing });
    })
    innerMap.event.addListener(overlay.getPath(), 'insert_at', (redrawnLine) => {
      setDrawingToCheck({ ...drawing });
    })
  }

  const linePathPolygonConstructor = (innerState, point, i, path) => {
    const { bearings, leftPoints, rightPoints, width } = innerState;
    const {geometry:{ spherical: { computeHeading, computeOffset}}} = maps;
    if (i === 0 || i === path.length - 1) {
      const initialPoint = i === 0 ? point : path[i - 1];
      const nextPoint = i === 0 ? path[i + 1] : point;
      const heading = computeHeading(initialPoint, nextPoint);
      const { left, right } = calculatePerpendiculars(heading);
      bearings.push(heading);
      leftPoints.push(computeOffset(point, width / 2, left));
      rightPoints.push(computeOffset(point, width / 2, right));
    } else {
      const heading = computeHeading(point, path[i + 1]);
      bearings.push(heading);
      // OC: 180 is added to get the angle from the perspective of the 2nd point.
      const angleFormed = heading - (adjustAngle(bearings[i - 1] + 180));
      const angleFormedInRadians = Math.abs(angleFormed) * Math.PI / 180;
      const distance = width / (2 * Math.sin(angleFormedInRadians / 2));
      const heading1 = adjustAngle(heading - (angleFormed / 2));
      const heading2 = adjustAngle(heading1 + 180);
      const p1 = computeOffset(point, distance, heading1);
      const p2 = computeOffset(point, distance, heading2);
      const p1LeftHeading = computeHeading(leftPoints[leftPoints.length - 1], p1);
      const p2LeftHeading = computeHeading(leftPoints[leftPoints.length - 1], p2);
      // OC: This line of code says: Is the slope of line p1 (m1) closest to the main line than the slope of line p2 (m2)?
      // Or Δmp1 < Δmp2
      const isP1Left = Math.abs(Math.abs(p1LeftHeading) - Math.abs(bearings[i - 1])) < Math.abs(Math.abs(p2LeftHeading) - Math.abs(bearings[i - 1]));
      leftPoints.push(isP1Left ? p1 : p2);
      rightPoints.push(isP1Left ? p2 : p1);
    }
    return  { bearings, leftPoints, rightPoints, width };
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

  const getVertices = (vertex) => ({
     lat: vertex.lat(), lng: vertex.lng()
  })

  const toggleDrawingAdjustment = () => {
    drawingToCheck.overlay.setOptions({
      editable: !drawingToCheck.overlay.getEditable(),
      draggable: !drawingToCheck.overlay.getDraggable(),
    });
  }

  const getOverlayInfo = () => {
    const { overlay } = drawingToCheck;
    const { computeArea, computeLength, computeDistanceBetween } = maps.geometry.spherical;
    if (isArea(drawLocationType)) {
      const path = overlay.getPath().getArray();
      const perimeter = Math.round(computeLength(path) + computeDistanceBetween(path[0], path[path.length - 1]));
      const area = Math.round(computeArea(path));
      const grid_points = path.map(getVertices);
      return { type: drawLocationType, grid_points, area, perimeter };
    }
    if (isLine(drawLocationType)) {
      const path = overlay.getPath();
      const line_points = path.getArray().map(getVertices);
      const length = Math.round(computeLength(path));
      return { type: drawLocationType, line_points, length };
    }
    if (isPoint(drawLocationType)) {
      const position = overlay.getPosition();
      const point = { lat: position.lat(), lng: position.lng() };
      return { type: drawLocationType, point };
    }
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
    toggleDrawingAdjustment,
    setLineWidth
  }

  return [drawingState, drawingFunctions];
}

const getDrawingOptions = (type) => {
  if (isArea(type)) {
    const { colour, filledColour } = areaStyles[type];
    return {
      polygonOptions: {
        strokeWeight: 2,
        fillOpacity: filledColour ? 0.3 : 0,
        editable: true,
        draggable: true,
        fillColor: colour,
        strokeColor: colour,
        geodesic: true,
        suppressUndo: true,
      },
    }
  }

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
