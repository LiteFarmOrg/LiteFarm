/*
 *  Copyright 2026 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

// Drawing and editing of new locations on the MapLibre map (VITE_MAP_PROVIDER=maplibre).
// Same drawingState / drawingFunctions interface as ../Map/useDrawingManager, so the shared
// DrawingManager bar, spotlight modals and redux form persistence work unchanged. Shapes are
// captured and edited with Terra Draw; no google.maps objects are involved.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  TerraDraw,
  TerraDrawLineStringMode,
  TerraDrawMarkerMode,
  TerraDrawPolygonMode,
  TerraDrawRenderMode,
  TerraDrawSelectMode,
} from 'terra-draw';
import { TerraDrawMapLibreGLAdapter } from 'terra-draw-maplibre-gl-adapter';
import { icons, lineStyles } from '../Map/mapStyles';
import { isArea, isLine, isPoint, locationEnum, polygonPath } from '../Map/constants';
import { getTerraDrawModeConfig } from '../Map/terraDrawStyles';
import { showedSpotlightSelector } from '../showedSpotlightSlice';
import { fieldEnum } from '../constants';
import { hookFormPersistSelector } from '../hooks/useHookFormPersist/hookFormPersistSlice';
import { pathLength, ringArea, ringPerimeter, widthRing } from '../../util/mapLibre/geodesy';

const WIDTH_SOURCE = 'draw-width';
const WIDTH_FILL = 'draw-width-fill';
const WIDTH_OUTLINE = 'draw-width-outline';
const WIDTH_LINE_TYPES = [locationEnum.watercourse, locationEnum.buffer_zone];
const EMPTY = { type: 'FeatureCollection', features: [] };

const toLatLng = ([lng, lat]) => ({ lat, lng });
const toPosition = ({ lat, lng }) => [lng, lat];

// Terra Draw mode names. Points use the marker mode so they render with the location icon.
const TERRA_MODE = { polygon: 'polygon', linestring: 'linestring', point: 'marker' };

const editableFlags = {
  feature: {
    draggable: true,
    coordinates: { midpoints: true, draggable: true, deletable: true },
  },
};

/** Reads the shape Terra Draw holds for an id into the plain structure this hook works with. */
const readShape = (draw, id) => {
  const feature = draw?.getSnapshotFeature(id);
  if (!feature) return null;
  const { type, coordinates } = feature.geometry;
  if (type === 'Polygon') {
    return { type: 'polygon', id, ring: coordinates[0].slice(0, -1).map(toLatLng) };
  }
  if (type === 'LineString') return { type: 'polyline', id, path: coordinates.map(toLatLng) };
  if (type === 'Point') return { type: 'marker', id, point: toLatLng(coordinates) };
  return null;
};

export default function useMapLibreDrawing({ map }) {
  const drawRef = useRef(null);
  const [drawReady, setDrawReady] = useState(false);
  const [drawLocationType, setDrawLocationType] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingToCheck, setDrawingToCheck] = useState(null);
  const [lineWidth, setLineWidth] = useState(null);
  const [onSteppedBack, setOnSteppedBack] = useState(false);
  const [pointChanged, setPointChanged] = useState(false);

  const [showZeroAreaWarning, setZeroAreaWarning] = useState(false);
  const [showZeroLengthWarning, setShowZeroLengthWarning] = useState(false);
  const [showAdjustAreaSpotlightModal, setShowAdjustAreaSpotlightModal] = useState(false);
  const [showAdjustLineSpotlightModal, setShowAdjustLineSpotlightModal] = useState(false);

  const showedSpotlight = useSelector(showedSpotlightSelector);
  const overlayData = useSelector(hookFormPersistSelector);

  // Refs let the Terra Draw listeners (registered once) see the current type without re-registering.
  const typeRef = useRef(null);
  typeRef.current = drawLocationType;

  // Terra Draw instance and the layer that previews the width of watercourses and buffer zones.
  useEffect(() => {
    if (!map) return undefined;
    const draw = new TerraDraw({
      adapter: new TerraDrawMapLibreGLAdapter({ map, coordinatePrecision: 9 }),
      modes: [
        new TerraDrawPolygonMode({ showCoordinatePoints: true }),
        new TerraDrawLineStringMode({ showCoordinatePoints: true }),
        new TerraDrawMarkerMode({ styles: { markerHeight: 40, markerWidth: 32 } }),
        new TerraDrawSelectMode({
          // Delete and Escape must not remove or deselect the shape the form depends on.
          keyEvents: null,
          allowManualDeselection: false,
          flags: {
            polygon: editableFlags,
            linestring: editableFlags,
            marker: { feature: { draggable: true } },
          },
        }),
        new TerraDrawRenderMode({
          modeName: 'static',
          styles: {
            polygonFillOpacity: 0,
            polygonOutlineWidth: 0,
            lineStringWidth: 0,
            pointWidth: 0,
            pointOutlineWidth: 0,
          },
        }),
      ],
    });
    draw.start();
    draw.setMode('static');

    draw.on('finish', (id, context) => {
      const shape = readShape(draw, id);
      if (!shape) return;
      if (context?.mode === 'select') {
        // Vertex dragged, midpoint inserted, vertex deleted or the whole shape moved.
        setPointChanged(true);
        setDrawingToCheck(shape);
        return;
      }
      setIsDrawing(false);
      setDrawingToCheck(shape);
      draw.setMode('select');
      draw.selectFeature(id);
    });

    if (!map.getSource(WIDTH_SOURCE)) {
      map.addSource(WIDTH_SOURCE, { type: 'geojson', data: EMPTY });
      map.addLayer({ id: WIDTH_FILL, type: 'fill', source: WIDTH_SOURCE, paint: {} });
      map.addLayer({ id: WIDTH_OUTLINE, type: 'line', source: WIDTH_SOURCE, paint: {} });
    }

    drawRef.current = draw;
    setDrawReady(true);
    return () => {
      setDrawReady(false);
      drawRef.current = null;
      try {
        draw.stop();
      } catch (error) {
        // The map may already be removed.
      }
      [WIDTH_FILL, WIDTH_OUTLINE].forEach((id) => map.getLayer?.(id) && map.removeLayer(id));
      map.getSource?.(WIDTH_SOURCE) && map.removeSource(WIDTH_SOURCE);
    };
  }, [map]);

  const clearShape = useCallback(() => {
    const draw = drawRef.current;
    if (!draw) return;
    draw.setMode('static');
    draw.clear();
  }, []);

  // Width polygon for watercourses and buffer zones, built with the same helper as the Google map.
  const widthPolygon =
    drawingToCheck?.type === 'polyline' &&
    WIDTH_LINE_TYPES.includes(drawLocationType) &&
    !!lineWidth &&
    drawingToCheck.path.length > 1
      ? widthRing(drawingToCheck.path, Number(lineWidth), polygonPath)
      : null;

  useEffect(() => {
    if (!map || !drawReady) return;
    const source = map.getSource(WIDTH_SOURCE);
    if (!source) return;
    if (!widthPolygon) {
      source.setData(EMPTY);
      return;
    }
    const { polyStyles } = lineStyles[drawLocationType];
    map.setPaintProperty(WIDTH_FILL, 'fill-color', polyStyles.fillColor);
    map.setPaintProperty(WIDTH_FILL, 'fill-opacity', polyStyles.fillOpacity);
    map.setPaintProperty(WIDTH_OUTLINE, 'line-color', polyStyles.strokeColor);
    map.setPaintProperty(WIDTH_OUTLINE, 'line-width', polyStyles.strokeWeight);
    const ring = [...widthPolygon, widthPolygon[0]].map(toPosition);
    source.setData({
      type: 'Feature',
      properties: {},
      geometry: { type: 'Polygon', coordinates: [ring] },
    });
  }, [map, drawReady, drawLocationType, drawingToCheck, lineWidth]);

  // Zero-size warnings, as on the Google map.
  useEffect(() => {
    if (drawingToCheck?.type === 'polygon') {
      const zero = Math.round(ringArea(drawingToCheck.ring)) === 0;
      setZeroAreaWarning(zero);
      if (zero) setShowAdjustAreaSpotlightModal(false);
    } else if (drawingToCheck?.type === 'polyline') {
      const zero = Math.round(pathLength(drawingToCheck.path)) === 0;
      setShowZeroLengthWarning(zero);
      if (zero) setShowAdjustLineSpotlightModal(false);
    }
  }, [drawingToCheck]);

  useLayoutEffect(() => {
    if (drawingToCheck) {
      if (isArea(drawLocationType) && !showedSpotlight.adjust_area && !showZeroAreaWarning) {
        setShowAdjustAreaSpotlightModal(true);
      }
      if (isLine(drawLocationType) && !showedSpotlight.adjust_line && !showZeroLengthWarning) {
        setShowAdjustLineSpotlightModal(true);
      }
    } else {
      setShowAdjustAreaSpotlightModal(false);
      setShowAdjustLineSpotlightModal(false);
    }
  }, [drawingToCheck, showZeroAreaWarning, showZeroLengthWarning]);

  const configureMode = (draw, type) => {
    const config = getTerraDrawModeConfig(type);
    if (config.mode === 'polygon') {
      draw.updateModeOptions('polygon', { styles: config.styles });
    } else if (config.mode === 'linestring') {
      draw.updateModeOptions('linestring', { styles: config.styles });
    } else {
      draw.updateModeOptions('marker', {
        styles: { markerUrl: icons[type], markerHeight: 40, markerWidth: 32 },
      });
      draw.updateModeOptions('select', {
        styles: {
          selectedMarkerUrl: icons[type],
          selectedMarkerHeight: 40,
          selectedMarkerWidth: 32,
        },
      });
    }
    if (config.mode === 'polygon') {
      draw.updateModeOptions('select', {
        styles: {
          selectedPolygonColor: config.styles.fillColor,
          selectedPolygonFillOpacity: config.styles.fillOpacity,
          selectedPolygonOutlineColor: config.styles.outlineColor,
          selectedPolygonOutlineWidth: config.styles.outlineWidth,
        },
      });
    } else if (config.mode === 'linestring') {
      draw.updateModeOptions('select', {
        styles: {
          selectedLineStringColor: config.styles.lineStringColor,
          selectedLineStringWidth: config.styles.lineStringWidth,
        },
      });
    }
    return config;
  };

  const startDrawing = (type) => {
    const draw = drawRef.current;
    if (!draw) return;
    setDrawLocationType(type);
    setIsDrawing(true);
    setDrawingToCheck(null);
    setPointChanged(false);
    draw.clear();
    const config = configureMode(draw, type);
    draw.setMode(TERRA_MODE[config.mode]);
  };

  const resetDrawing = (wasBackPressed = false) => {
    if (wasBackPressed) setOnSteppedBack(false);
    clearShape();
    setDrawingToCheck(null);
    setPointChanged(false);
  };

  const closeDrawer = () => {
    setIsDrawing(false);
    setDrawLocationType(null);
    setLineWidth(null);
    clearShape();
  };

  const getOverlayInfo = () => {
    const shape = drawingToCheck;
    if (isArea(drawLocationType) && shape?.type === 'polygon') {
      const result = { type: drawLocationType, grid_points: shape.ring };
      result[fieldEnum.total_area] = Math.round(ringArea(shape.ring));
      result[fieldEnum.perimeter] = Math.round(ringPerimeter(shape.ring));
      return result;
    }
    if (isLine(drawLocationType) && shape?.type === 'polyline') {
      return {
        type: drawLocationType,
        line_points: shape.path,
        length: Math.round(pathLength(shape.path)),
        total_area: widthPolygon ? Math.round(ringArea(widthPolygon)) : null,
      };
    }
    if (isPoint(drawLocationType) && shape?.type === 'marker') {
      return { type: drawLocationType, point: shape.point };
    }
    return undefined;
  };

  const reconstructOverlay = () => setOnSteppedBack(true);

  // Coming back from the create-location form: put the persisted shape back on the map, editable.
  useEffect(() => {
    const draw = drawRef.current;
    if (!onSteppedBack || !drawReady || !draw) return;
    const { type } = overlayData;
    setOnSteppedBack(false);
    if (!type) return;
    setDrawLocationType(type);
    setIsDrawing(false);
    configureMode(draw, type);

    let feature;
    if (isArea(type) && overlayData.grid_points?.length) {
      const ring = overlayData.grid_points.map(toPosition);
      feature = {
        geometry: { type: 'Polygon', coordinates: [[...ring, ring[0]]] },
        mode: 'polygon',
      };
    } else if (isLine(type) && overlayData.line_points?.length) {
      setLineWidth(overlayData.width);
      feature = {
        geometry: { type: 'LineString', coordinates: overlayData.line_points.map(toPosition) },
        mode: 'linestring',
      };
    } else if (isPoint(type) && overlayData.point) {
      feature = {
        geometry: { type: 'Point', coordinates: toPosition(overlayData.point) },
        mode: 'marker',
      };
    }
    if (!feature) return;

    const id = draw.getFeatureId();
    const [result] = draw.addFeatures([
      {
        id,
        type: 'Feature',
        geometry: feature.geometry,
        properties: { mode: feature.mode, ...(feature.mode === 'marker' && { marker: true }) },
      },
    ]);
    if (!result?.valid) return;
    draw.setMode('select');
    draw.selectFeature(id);
    setDrawingToCheck(readShape(draw, id));

    const positions =
      feature.geometry.type === 'Point'
        ? [feature.geometry.coordinates]
        : feature.geometry.type === 'LineString'
          ? feature.geometry.coordinates
          : feature.geometry.coordinates[0];
    const lngs = positions.map((p) => p[0]);
    const lats = positions.map((p) => p[1]);
    map.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding: 60, maxZoom: 19, duration: 0 },
    );
  }, [onSteppedBack, drawReady, overlayData]);

  const drawingState = {
    type: drawLocationType,
    isActive: isDrawing,
    drawingToCheck,
    showAdjustAreaSpotlightModal,
    showAdjustLineSpotlightModal,
    showZeroLengthWarning,
    showZeroAreaWarning,
    pointChanged,
  };

  const drawingFunctions = {
    startDrawing,
    resetDrawing,
    closeDrawer,
    getOverlayInfo,
    reconstructOverlay,
    setLineWidth,
    setShowAdjustAreaSpotlightModal,
    setShowAdjustLineSpotlightModal,
    setZeroAreaWarning,
    setShowZeroLengthWarning,
  };

  return [drawingState, drawingFunctions];
}
