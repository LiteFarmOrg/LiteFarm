import React, { useEffect, useLayoutEffect, useState } from 'react';
import { areaStyles, icons, lineStyles } from './mapStyles';
import { isArea, isLine, isPoint, locationEnum, polygonPath } from './constants';
import { useSelector } from 'react-redux';
import { showedSpotlightSelector } from '../showedSpotlightSlice';
import { defaultColour } from './styles.module.scss';
import { fieldEnum } from '../constants';
import { hookFormPersistSelector } from '../hooks/useHookFormPersist/hookFormPersistSlice';
import { attachChangeListeners, mountEditableOverlay } from './editableOverlay';

/**
 *
 * Do not modify, copy or reuse
 */
export default function useDrawingManager() {
  const [map, setMap] = useState(null);
  const [maps, setMaps] = useState(null);
  const [drawingManager, setDrawingManager] = useState(null);
  const [widthPolygon, setWidthPolygon] = useState(null);
  const [lineWidth, setLineWidth] = useState(null);
  const [drawLocationType, setDrawLocationType] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingToCheck, setDrawingToCheck] = useState(null);

  const [onBackPressed, setOnBackPressed] = useState(false);
  const [onSteppedBack, setOnSteppedBack] = useState(false);

  const [showZeroAreaWarning, setZeroAreaWarning] = useState(false);
  const [showZeroLengthWarning, setShowZeroLengthWarning] = useState(false);
  const [showAdjustAreaSpotlightModal, setShowAdjustAreaSpotlightModal] = useState(false);
  const [showAdjustLineSpotlightModal, setShowAdjustLineSpotlightModal] = useState(false);

  const [pointChanged, setPointChanged] = useState(false);

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
      [locationEnum.watercourse, locationEnum.buffer_zone].includes(drawLocationType) &&
      !!lineWidth &&
      drawingToCheck.overlay.getPath().getArray().length > 1
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
      setWidthPolygon(null);
    }
  }, [drawingToCheck, lineWidth]);

  useEffect(() => {
    if (!onSteppedBack) return;
    const { type } = overlayData;
    setDrawLocationType(type);
    setIsDrawing(false);
    if (isLine(type)) {
      setLineWidth(overlayData.width);
    }
    const drawingOpts = getDrawingOptions(type) ?? {};
    const mounted = mountEditableOverlay(map, maps, overlayData, {
      polygonOptions: drawingOpts.polygonOptions,
      polylineOptions: drawingOpts.polylineOptions,
      markerOptions: { icon: icons[type], draggable: true },
      onVertexChange: () => {
        setPointChanged(true);
        // Polylines drive the width-buffer polygon off drawingToCheck's identity,
        // so edits need to trigger a re-ref even though the fields don't change.
        if (isLine(type)) {
          setDrawingToCheck((prev) => (prev ? { ...prev } : prev));
        }
      },
    });
    if (!mounted) {
      setOnSteppedBack(false);
      return;
    }
    setDrawingToCheck({ type: mounted.type, overlay: mounted.overlay });
    map.fitBounds(mounted.bounds);

    return () => {
      mounted.dispose();
      setOnSteppedBack(false);
    };
  }, [onSteppedBack, map, maps, overlayData]);

  useLayoutEffect(() => {
    if (drawingToCheck) {
      if (isArea(drawLocationType) && !showedSpotlight.adjust_area && !showZeroAreaWarning)
        setShowAdjustAreaSpotlightModal(true);
      if (isLine(drawLocationType) && !showedSpotlight.adjust_line && !showZeroLengthWarning)
        setShowAdjustLineSpotlightModal(true);
    } else {
      setShowAdjustAreaSpotlightModal(false);
      setShowAdjustLineSpotlightModal(false);
    }
  }, [drawingToCheck, showZeroAreaWarning, showZeroLengthWarning]);

  const initDrawingState = (map, maps, capture) => {
    setMap(map);
    setMaps(maps);
    setDrawingManager(capture);
  };

  const startDrawing = (type) => {
    setDrawLocationType(type);
    setIsDrawing(true);
    drawingManager.setMode(localTypeToMode(type), getDrawingOptions(type));
  };

  const finishDrawing = (drawing, innerMap) => {
    setIsDrawing(false);
    setDrawingToCheck(drawing);
    attachChangeListeners(innerMap, drawing.overlay, drawing.type, () => {
      setPointChanged(true);
      if (drawing.type === 'polyline') {
        setDrawingToCheck((prev) => (prev ? { ...prev } : prev));
      }
    });
  };

  const resetDrawing = (wasBackPressed = false) => {
    if (wasBackPressed) setOnSteppedBack(false);
    setOnBackPressed(wasBackPressed);
    drawingToCheck?.overlay.setMap(null);
    setDrawingToCheck(null);
  };

  const closeDrawer = () => {
    setIsDrawing(false);
    setDrawLocationType(null);
    drawingManager.setMode(null);
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
      let area;
      if (widthPolygon) {
        area = Math.round(computeArea(widthPolygon.getPath()));
      } else {
        area = null;
      }
      return { type: drawLocationType, line_points, length, total_area: area };
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
    drawingManager,
    drawingToCheck,
    showAdjustAreaSpotlightModal,
    showAdjustLineSpotlightModal,
    showZeroLengthWarning,
    showZeroAreaWarning,
    pointChanged: pointChanged,
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
    setZeroAreaWarning,
    setShowZeroLengthWarning,
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

const localTypeToMode = (type) => {
  if (isArea(type)) return 'polygon';
  if (isLine(type)) return 'polyline';
  if (isPoint(type)) return 'marker';

  console.log('invalid location type');
  return null;
};
