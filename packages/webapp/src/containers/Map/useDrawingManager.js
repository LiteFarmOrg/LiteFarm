import React, { useEffect, useState } from 'react';
import { areaStyles, lineStyles, icons } from './mapStyles';
import { isArea, isLine, isPoint } from './constants';
import { defaultColour } from './styles.module.scss';

export default function useDrawingManager() {
  const [maps, setMaps] = useState(null);
  const [drawingManager, setDrawingManager] = useState(null);
  const [supportedDrawingModes, setDrawingModes] = useState(null);
  const [drawLocationType, setDrawLocationType] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingToCheck, setDrawingToCheck] = useState(null);

  const [onBackPressed, setOnBackPressed] = useState(false);

  useEffect(() => {
    if (onBackPressed) {
      drawingToCheck?.overlay.setMap(null);
      setOnBackPressed(false);
    }
  }, [drawingToCheck, onBackPressed]);

  const initDrawingState = (maps, drawingManagerInit, drawingModes) => {
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

  const finishDrawing = (drawing) => {
    setIsDrawing(false);
    setDrawingToCheck(drawing);
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
      const perimeter = Math.round(computeLength(path) + computeDistanceBetween(path[0], path[path.length-1]));
      const area = Math.round(computeArea(path));
      const grid_points = path.map((vertex) => {
        return { lat: vertex.lat(), lng: vertex.lng() };
      });
      return { type: drawLocationType, grid_points, area, perimeter };
    };
    // if (isLine(drawLocationType)) {
    //   const line_points = polyline.getPath();
    //   const length = Math.round(computeLength(grid_points));
    //   const width = ???;
    //   return { line_points, length, width };
    // }
    if (isPoint(drawLocationType)) {
      const position = overlay.getPosition();
      const point = { lat: position.lat(), lng: position.lng() };
      return { type: drawLocationType, point };
    };
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
  };

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
  };

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
