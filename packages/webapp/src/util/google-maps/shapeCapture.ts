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

export type CaptureMode = 'polygon' | 'polyline' | 'marker' | null;

export type CaptureCompleteEvent =
  | { type: 'polygon'; overlay: google.maps.Polygon }
  | { type: 'polyline'; overlay: google.maps.Polyline }
  | { type: 'marker'; overlay: google.maps.Marker };

export type CaptureCompleteHandler = (event: CaptureCompleteEvent) => void;

export interface CaptureOptions {
  polygonOptions?: google.maps.PolygonOptions;
  polylineOptions?: google.maps.PolylineOptions;
  markerOptions?: google.maps.MarkerOptions;
}

export interface ShapeCapture {
  setMode: (mode: CaptureMode, options?: CaptureOptions) => void;
  onComplete: (handler: CaptureCompleteHandler) => void;
  destroy: () => void;
}

// Pixel radius around the first polygon vertex that counts as "click to close".
const AUTO_CLOSE_HIT_RADIUS_PX = 12;

// Window during which a polyline click is deferred so it can be cancelled by a
// subsequent dblclick. Matches browser double-click grace time.
const POLYLINE_CLICK_DEFER_MS = 220;

/**
 * Replaces `google.maps.drawing.DrawingManager`, which is deprecated and will be
 * removed from the Google Maps JavaScript API in May 2026. The behavior is
 * intentionally narrow: click to add vertices (polygon/polyline), drag a
 * cursor-following rubber band, click the first vertex to close a polygon, or
 * double-click to finish a polyline. Markers commit on the first click. Once the
 * overlay is complete it is handed to the caller via `onComplete` — all downstream
 * editing, area/length math, and persistence stays exactly as it was.
 */
export function createShapeCapture(map: google.maps.Map, maps: typeof google.maps): ShapeCapture {
  let mode: CaptureMode = null;
  let vertices: google.maps.LatLng[] = [];
  let preview: google.maps.Polygon | google.maps.Polyline | null = null;
  let options: CaptureOptions | null = null;
  let listeners: google.maps.MapsEventListener[] = [];
  const completeHandlers: CaptureCompleteHandler[] = [];

  // Polyline-only: the click-before-dblclick is buffered so dblclick can cancel
  // it without leaving a stray vertex at the end of the line.
  let pendingPolylineClickTimer: ReturnType<typeof setTimeout> | null = null;
  let pendingPolylineLatLng: google.maps.LatLng | null = null;

  const emit = (event: CaptureCompleteEvent) => {
    completeHandlers.forEach((handler) => handler(event));
  };

  const clearListeners = () => {
    listeners.forEach((listener) => listener.remove());
    listeners = [];
  };

  const clearPendingPolylineClick = () => {
    if (pendingPolylineClickTimer !== null) {
      clearTimeout(pendingPolylineClickTimer);
      pendingPolylineClickTimer = null;
      pendingPolylineLatLng = null;
    }
  };

  // Pixel-space distance between two LatLngs using the map's current zoom. The
  // world-point scale is 256 * 2^zoom; multiplying the projection delta by 2^zoom
  // yields screen pixels relative to the shared world origin, which is what we
  // want for hit-testing the auto-close gesture.
  const pixelDistance = (a: google.maps.LatLng, b: google.maps.LatLng): number => {
    const projection = map.getProjection();
    if (!projection) return Infinity;
    const pa = projection.fromLatLngToPoint(a);
    const pb = projection.fromLatLngToPoint(b);
    if (!pa || !pb) return Infinity;
    const scale = Math.pow(2, map.getZoom() ?? 0);
    return Math.hypot((pa.x - pb.x) * scale, (pa.y - pb.y) * scale);
  };

  const updatePreviewPath = (extra?: google.maps.LatLng) => {
    if (!preview) return;
    const path = extra ? [...vertices, extra] : vertices;
    preview.setPath(path);
  };

  const resetState = () => {
    clearListeners();
    clearPendingPolylineClick();
    preview = null;
    vertices = [];
    options = null;
    mode = null;
  };

  const cancelInProgress = () => {
    if (preview) {
      preview.setMap(null);
    }
    resetState();
  };

  const finishPolygonOrPolyline = () => {
    if (!preview) {
      resetState();
      return;
    }
    preview.setPath(vertices);
    preview.setOptions({ editable: true, draggable: true, clickable: true });
    const completed = preview;
    const completedMode = mode;
    // Release ownership of preview BEFORE resetting so resetState() won't touch
    // the completed overlay. The caller now owns it.
    preview = null;
    resetState();
    if (completedMode === 'polygon') {
      emit({ type: 'polygon', overlay: completed as google.maps.Polygon });
    } else if (completedMode === 'polyline') {
      emit({ type: 'polyline', overlay: completed as google.maps.Polyline });
    }
  };

  const startPolygonCapture = () => {
    if (!options?.polygonOptions) return;

    const mapClick = maps.event.addListener(map, 'click', (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) return;
      if (
        vertices.length >= 3 &&
        pixelDistance(vertices[0], event.latLng) <= AUTO_CLOSE_HIT_RADIUS_PX
      ) {
        finishPolygonOrPolyline();
        return;
      }
      vertices.push(event.latLng);
      if (!preview) {
        preview = new maps.Polygon({
          paths: [event.latLng],
          ...options!.polygonOptions,
          // During capture the overlay should not intercept pointer events or
          // show vertex handles — those are switched on in finish().
          editable: false,
          draggable: false,
          clickable: false,
          map,
        });
      } else {
        preview.setPath(vertices);
      }
    });

    const mapMove = maps.event.addListener(map, 'mousemove', (event: google.maps.MapMouseEvent) => {
      if (!event.latLng || !preview || vertices.length === 0) return;
      updatePreviewPath(event.latLng);
    });

    listeners.push(mapClick, mapMove);
  };

  const startPolylineCapture = () => {
    if (!options?.polylineOptions) return;

    const commitVertex = (latLng: google.maps.LatLng) => {
      vertices.push(latLng);
      if (!preview) {
        preview = new maps.Polyline({
          path: [latLng],
          ...options!.polylineOptions,
          editable: false,
          draggable: false,
          clickable: false,
          map,
        });
      } else {
        preview.setPath(vertices);
      }
    };

    const mapClick = maps.event.addListener(map, 'click', (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) return;
      // Defer so a subsequent dblclick can cancel this vertex.
      clearPendingPolylineClick();
      pendingPolylineLatLng = event.latLng;
      pendingPolylineClickTimer = setTimeout(() => {
        if (pendingPolylineLatLng) {
          commitVertex(pendingPolylineLatLng);
        }
        pendingPolylineClickTimer = null;
        pendingPolylineLatLng = null;
      }, POLYLINE_CLICK_DEFER_MS);
    });

    const mapMove = maps.event.addListener(map, 'mousemove', (event: google.maps.MapMouseEvent) => {
      if (!event.latLng || !preview || vertices.length === 0) return;
      updatePreviewPath(event.latLng);
    });

    const mapDblclick = maps.event.addListener(map, 'dblclick', () => {
      clearPendingPolylineClick();
      if (vertices.length < 2) {
        // Too few points for a line; treat as a cancel so we don't emit garbage.
        cancelInProgress();
        return;
      }
      finishPolygonOrPolyline();
    });

    listeners.push(mapClick, mapMove, mapDblclick);
  };

  const startMarkerCapture = () => {
    if (!options?.markerOptions) return;
    const mapClick = maps.event.addListener(map, 'click', (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) return;
      const marker = new maps.Marker({
        position: event.latLng,
        ...options!.markerOptions,
        map,
      });
      resetState();
      emit({ type: 'marker', overlay: marker });
    });
    listeners.push(mapClick);
  };

  const setMode = (nextMode: CaptureMode, nextOptions?: CaptureOptions) => {
    cancelInProgress();
    mode = nextMode;
    options = nextOptions ?? null;
    if (mode === 'polygon') startPolygonCapture();
    else if (mode === 'polyline') startPolylineCapture();
    else if (mode === 'marker') startMarkerCapture();
  };

  const onComplete = (handler: CaptureCompleteHandler) => {
    completeHandlers.push(handler);
  };

  const destroy = () => {
    cancelInProgress();
    completeHandlers.length = 0;
  };

  return { setMode, onComplete, destroy };
}
