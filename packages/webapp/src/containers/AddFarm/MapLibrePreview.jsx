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

// MapLibre version of the small satellite preview on the Add Farm page.

import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import MapPin from '../../assets/images/signUp/map_pin.svg?react';
import MapPinUrl from '../../assets/images/signUp/map_pin.svg';
import MapErrorPin from '../../assets/images/signUp/map_error_pin.svg?react';
import LoadingAnimation from '../../assets/images/signUp/animated_loading_farm.svg?react';
import { buildImageryStyle, IMAGERY_MAX_ZOOM } from '../../util/mapProvider';

const PREVIEW_ZOOM = 17;

export default function MapLibrePreview({ gridPoints, errors, isGettingLocation }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const lat = gridPoints?.lat;
  const lng = gridPoints?.lng;
  const hasPoint = Number.isFinite(lat) && Number.isFinite(lng) && !isGettingLocation;

  // Create the map when the first coordinate arrives and remove it when the coordinate goes away.
  useEffect(() => {
    if (!hasPoint || !containerRef.current) return undefined;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: buildImageryStyle(),
      center: [lng, lat],
      zoom: PREVIEW_ZOOM,
      maxZoom: IMAGERY_MAX_ZOOM,
      attributionControl: { compact: true },
    });
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();
    map.doubleClickZoom.disable();
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.addControl(new maplibregl.ScaleControl(), 'bottom-left');

    const pin = document.createElement('img');
    pin.src = MapPinUrl;
    pin.alt = '';
    pin.style.pointerEvents = 'none';
    markerRef.current = new maplibregl.Marker({ element: pin, anchor: 'bottom' })
      .setLngLat([lng, lat])
      .addTo(map);
    mapRef.current = map;

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [hasPoint]);

  // Move an existing map when the user picks a different location.
  useEffect(() => {
    if (!hasPoint || !mapRef.current) return;
    markerRef.current?.setLngLat([lng, lat]);
    mapRef.current.jumpTo({ center: [lng, lat], zoom: PREVIEW_ZOOM });
  }, [lat, lng]);

  return (
    <div
      style={{
        width: '100vw',
        maxWidth: '1024px',
        minHeight: '152px',
        flexGrow: 1,
        position: 'relative',
        transform: 'translateX(-24px)',
        marginTop: '28px',
        backgroundColor: 'var(--grey200)',
        display: 'flex',
      }}
    >
      {hasPoint ? (
        <div
          data-cy="addFarm-maplibre-preview"
          ref={containerRef}
          style={{ flexGrow: 1, minHeight: '152px' }}
        />
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '152px',
            flexGrow: 1,
          }}
        >
          {(!!errors && <MapErrorPin />) || (isGettingLocation ? <LoadingAnimation /> : <MapPin />)}
        </div>
      )}
    </div>
  );
}
