import React, { useState } from 'react';
import { icons } from './mapStyles';

export default function useDrawingManager() {
  const [drawingManager, setDrawingManager] = useState(null);
  const [supportedDrawingModes, setDrawingModes] = useState(null);
  const [drawLocationType, setDrawLocationType] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingToCheck, setDrawingToCheck] = useState(null);

  // TODO: refactor if possible
  const getDrawingMode = (type) => {
    switch (type) {
      case 'barn':
      case 'ceremonial':
      case 'farmBound':
      case 'fields':
      case 'greenhouse':
      case 'groundwater':
      case 'naturalArea':
      case 'residence':
        return supportedDrawingModes.POLYGON;
      case 'creek':
      case 'fence':
        return supportedDrawingModes.POLYLINE;
      case 'gate':
      case 'waterValve':
        return supportedDrawingModes.MARKER;
      default:
        console.log("invalid location type");
        return null;
    }
  }

  const initDrawingState = (drawingManagerInit, drawingModes) => {
    setDrawingManager(drawingManagerInit);
    setDrawingModes(drawingModes);
  }

  const startDrawing = (type) => {
    setDrawLocationType(type);
    setIsDrawing(true);
    // drawingManager.setOptions({
    //   markerOptions: {
    //     icon: icons['gate'],
    //   },
    // });
    drawingManager.setOptions(drawOptions[type]);
    drawingManager.setDrawingMode(getDrawingMode(type));
  }

  const finishDrawing = (drawing) => {
    setIsDrawing(false);
    setDrawingToCheck(drawing);
  }

  const resetDrawing = () => {
    drawingToCheck?.overlay.setMap(null);
    setDrawingToCheck(null);
  }

  const closeDrawer = () => {
    setIsDrawing(false);
    setDrawLocationType(null);
    drawingManager.setDrawingMode();
  }

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
  }

  return [drawingState, drawingFunctions];
}

// const startDrawing = (type, setDrawingState) => {
//   // setDrawLocationType('gate');
//   // setIsDrawing(true);
//   setDrawingState(prevState => ({
//     ...prevState,
//     type,
//     isActive: true,
//   }));
//   drawingManager.setOptions({
//     markerOptions: {
//       icon: icons['gate'],
//     },
//   });
//   drawingManager.setDrawingMode(supportedDrawingModes.MARKER);
// }

const drawOptions = {
  'field': {

  },
  'gate': {
    markerOptions: {
      icon: icons['gate'],
    },
  }
}
