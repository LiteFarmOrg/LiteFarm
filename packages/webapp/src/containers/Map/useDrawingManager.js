import React, { useEffect, useState } from 'react';
import { areaStyles, lineStyles, icons } from './mapStyles';
import { polygonPath, isArea, isLine, isPoint, locationEnum } from './constants';
import { useSelector, useDispatch } from 'react-redux';
import { showedSpotlightSelector } from '../showedSpotlightSlice';
import { defaultColour } from './styles.module.scss';
import { fieldEnum } from '../constants';
import { hookFormPersistSelector } from '../hooks/useHookFormPersist/hookFormPersistSlice';

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

  const [showAdjustAreaSpotlightModal, setShowAdjustAreaSpotlightModal] = useState(false);
  const [showAdjustLineSpotlightModal, setShowAdjustLineSpotlightModal] = useState(false);

  const showedSpotlight = useSelector(showedSpotlightSelector);
  const overlayData = useSelector(hookFormPersistSelector);

  useEffect(() => {
    if (onBackPressed) {
      drawingToCheck?.overlay.setMap(null);
      setOnBackPressed(false);
    }
  }, [drawingToCheck, onBackPressed]);

  useEffect(() => {
    if (
      drawingToCheck?.type === 'polyline' &&
      [locationEnum.watercourse, locationEnum.buffer_zone].includes(drawLocationType)
    ) {
      const { overlay } = drawingToCheck;
      const path = overlay.getPath().getArray();
      const polyPath = polygonPath(path, Number(lineWidth), maps);
      widthPolygon !== null && widthPolygon.setMap(null);
      const linePolygon = new maps.Polygon({
        paths: polyPath,
        ...lineStyles[drawLocationType].polyStyles,
      });
      linePolygon.setMap(map);
      setWidthPolygon(linePolygon);
    } else if (widthPolygon !== null) {
      widthPolygon.setMap(null);
    }
  }, [drawingToCheck, lineWidth]);

  useEffect(() => {
    if (!onSteppedBack) return;
    let bounds;
    const { type } = overlayData;
    setDrawLocationType(type);
    setIsDrawing(false);
    if (isArea(type)) {
      const redrawnPolygon = new maps.Polygon({
        paths: overlayData.grid_points,
        ...getDrawingOptions(type).polygonOptions,
      });
      redrawnPolygon.setMap(map);
      setDrawingToCheck({
        type: maps.drawing.OverlayType.POLYGON,
        overlay: redrawnPolygon,
      });
      bounds = getBounds(maps, overlayData.grid_points)
    } else if (isLine(type)) {
      setLineWidth(overlayData.width);
      const redrawnLine = new maps.Polyline({
        path: overlayData.line_points,
        ...getDrawingOptions(type).polylineOptions,
      });
      const overlay = {
        type: maps.drawing.OverlayType.POLYLINE,
        overlay: redrawnLine,
      };
      redrawnLine.setMap(map);
      addLineListeners(overlay, maps);
      bounds = getBounds(maps, overlayData.line_points)
      setDrawingToCheck(overlay);
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
      bounds = getBounds(maps, [overlayData.point])
    }
    map.fitBounds(bounds);
    setOnSteppedBack(false);
  }, [onSteppedBack, map, maps, overlayData]);

  useEffect(() => {
    if (drawingToCheck) {
      if (isArea(drawLocationType) && !showedSpotlight.adjust_area)
        setShowAdjustAreaSpotlightModal(true);
      if (isLine(drawLocationType) && !showedSpotlight.adjust_line)
        setShowAdjustLineSpotlightModal(true);
    } else {
      setShowAdjustAreaSpotlightModal(false);
      setShowAdjustLineSpotlightModal(false);
    }
  }, [drawingToCheck]);

  const initDrawingState = (map, maps, drawingManagerInit, drawingModes) => {
    setMap(map);
    setMaps(maps);
    setDrawingManager(drawingManagerInit);
    setDrawingModes(drawingModes);
  };

  const startDrawing = (type) => {
    setDrawLocationType(type);
    setIsDrawing(true);
    drawingManager.setOptions(getDrawingOptions(type));
    drawingManager.setDrawingMode(getDrawingMode(type, supportedDrawingModes));
  };

  const finishDrawing = (drawing, innerMap) => {
    setIsDrawing(false);
    setDrawingToCheck(drawing);
    if (drawing.type === 'polyline') {
      addLineListeners(drawing, innerMap);
    }
  };
  const addLineListeners = (drawing, innerMap) => {
    const { overlay } = drawing;
    innerMap.event.addListener(overlay.getPath(), 'set_at', (redrawnLine) => {
      setDrawingToCheck({ ...drawing });
    });
    innerMap.event.addListener(overlay.getPath(), 'insert_at', (redrawnLine) => {
      setDrawingToCheck({ ...drawing });
    });
  };

  const resetDrawing = (wasBackPressed = false) => {
    setOnBackPressed(wasBackPressed);
    drawingToCheck?.overlay.setMap(null);
    setDrawingToCheck(null);
  };

  const closeDrawer = () => {
    setIsDrawing(false);
    setDrawLocationType(null);
    drawingManager.setDrawingMode();
  };

  const getVertices = (vertex) => ({
    lat: vertex.lat(),
    lng: vertex.lng(),
  });

  const toggleDrawingAdjustment = () => {
    drawingToCheck.overlay.setOptions({
      editable: !drawingToCheck.overlay.getEditable(),
      draggable: !drawingToCheck.overlay.getDraggable(),
    });
  };

  const getOverlayInfo = () => {
    const { overlay } = drawingToCheck;
    const { computeArea, computeLength, computeDistanceBetween } = maps.geometry.spherical;
    if (isArea(drawLocationType)) {
      const path = overlay.getPath().getArray();
      const perimeter = Math.round(
        computeLength(path) + computeDistanceBetween(path[0], path[path.length - 1]),
      );
      const area = Math.round(computeArea(path));
      const grid_points = path.map(getVertices);
      const result = { type: drawLocationType, grid_points };
      result[fieldEnum.total_area] = area;
      result[fieldEnum.perimeter] = perimeter;
      return result;
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
  };

  const reconstructOverlay = () => {
    setOnSteppedBack(true);
  };

  // todo undo drawing

  const drawingState = {
    type: drawLocationType,
    isActive: isDrawing,
    supportedDrawingModes,
    drawingManager,
    drawingToCheck,
    showAdjustAreaSpotlightModal,
    showAdjustLineSpotlightModal,
  };

  const drawingFunctions = {
    initDrawingState,
    startDrawing,
    finishDrawing,
    resetDrawing,
    closeDrawer,
    getOverlayInfo,
    reconstructOverlay,
    toggleDrawingAdjustment,
    setLineWidth,
    setShowAdjustAreaSpotlightModal,
    setShowAdjustLineSpotlightModal,
  };

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
        fillColor: colour,
        strokeColor: colour,
        geodesic: true,
        suppressUndo: true,
      },
    };
  }

  if (isLine(type)) {
    const { colour, dashScale, dashLength } = lineStyles[type];
    return {
      polylineOptions: {
        strokeWeight: 2,
        editable: true,
        fillColor: colour,
        strokeColor: defaultColour,
        geodesic: true,
        suppressUndo: true,
        icons: [
          {
            icon: {
              path: 'M 0,0 0,1',
              strokeColor: colour,
              strokeOpacity: 1,
              strokeWeight: 2,
              scale: dashScale,
            },
            offset: '0',
            repeat: dashLength,
          },
        ],
      },
    };
  }

  if (isPoint(type))
    return {
      markerOptions: {
        icon: icons[type],
        draggable: true,
        crossOnDrag: false,
      },
    };

  console.log('invalid location type');
  return null;
};

const getDrawingMode = (type, supportedDrawingModes) => {
  if (isArea(type)) return supportedDrawingModes.POLYGON;
  if (isLine(type)) return supportedDrawingModes.POLYLINE;
  if (isPoint(type)) return supportedDrawingModes.MARKER;

  console.log('invalid location type');
  return null;
};

const getBounds = function(maps, path) {
  let bounds = new maps.LatLngBounds();
  path.forEach(function(item, index) {
    bounds.extend(new maps.LatLng(item.lat, item.lng));
  });
  return bounds;
};