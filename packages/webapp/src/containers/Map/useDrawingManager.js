import React, { useEffect, useState } from 'react';
import { areaStyles, icons } from './mapStyles';
import { isArea, isLine, isPoint } from './util';

export default function useDrawingManager() {
  const [drawingManager, setDrawingManager] = useState(null);
  const [supportedDrawingModes, setDrawingModes] = useState(null);
  const [drawLocationType, setDrawLocationType] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingToCheck, setDrawingToCheck] = useState(null);
  const [overlayInfo, setOverlayInfo] = useState(null);

  const [onBackPressed, setOnBackPressed] = useState(false);

  useEffect(() => {
    if (onBackPressed) {
      drawingToCheck?.overlay.setMap(null);
      setOnBackPressed(false);
    }
  }, [drawingToCheck, onBackPressed]);

  const initDrawingState = (drawingManagerInit, drawingModes) => {
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

  // const getOverlayInfo = () => {
  //   const { overlay } = drawingToCheck;
  //   if (isArea(drawLocationType)) return {
  //     grid_points: overlay.getPath(),
  //     total_area: overlay.getPath(),
  //   }
  //   // if (isLine(drawLocationType)) return {
  //   //   length: overlay.getDistance(), //not a real method
  //   //   width: overlay.getWidth(), //not a real method
  //   //   line_points: overlay.getPath(),
  //   // }
  //   if (isPoint(drawLocationType)) return {
  //     point: overlay.getPosition(),
  //   }
  // }

  const drawingState = {
    type: drawLocationType,
    isActive: isDrawing,
    supportedDrawingModes,
    drawingManager,
    drawingToCheck,
    overlayInfo,
  }
  const drawingFunctions = {
    initDrawingState,
    startDrawing,
    finishDrawing,
    resetDrawing,
    closeDrawer,
    setOverlayInfo,
  }

  return [drawingState, drawingFunctions];
}

const getDrawingOptions = (type) => {
  if (isArea(type)) return {
    polygonOptions: {
      strokeWeight: 2,
      fillOpacity: 0.3,
      editable: true,
      draggable: true,
      fillColor: areaStyles[type].colour,
      strokeColor: areaStyles[type].colour,
      geodesic: true,
      suppressUndo: true, // !!!
    },
  };

  if (isLine(type)) {
    console.log('line draw options not implemented');
    return {};
  }

  if (isPoint(type)) return {
    markerOptions: {
      icon: icons[type],
      // draggable: true,
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
