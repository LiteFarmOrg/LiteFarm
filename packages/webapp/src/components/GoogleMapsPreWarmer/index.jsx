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

import GoogleMap from 'google-map-react';

/**
 * Hidden map component that pre-warms Google Maps by triggering lazy-loaded modules.
 * This component creates an actual Map instance which forces Google Maps to load
 * internal dependencies (overlay.js, onion.js, log.js, etc.) that are needed
 * for the map to function offline.
 *
 * Must be rendered while online to populate the browser cache.
 */
const GoogleMapsPreWarmer = ({ isLoaded }) => {
  if (!isLoaded) {
    return null;
  }

  // Render a 1px × 1px map off-screen to trigger Google's internal module loading
  return (
    <div
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        top: '-9999px',
        left: '-9999px',
        visibility: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <GoogleMap
        defaultCenter={{ lat: 0, lng: 0 }}
        defaultZoom={1}
        yesIWantToUseGoogleMapApiInternals
        onGoogleApiLoaded={({ map, maps }) => {
          console.log('GoogleMapsPreWarmer: Map initialized, lazy modules should now be cached');

          // Create a drawing manager to trigger drawing library modules
          if (maps.drawing) {
            new maps.drawing.DrawingManager({ map });
          }

          // Create a polygon to trigger geometry/overlay modules
          if (maps.Polygon) {
            new maps.Polygon({
              paths: [
                { lat: 0, lng: 0 },
                { lat: 0, lng: 0.001 },
                { lat: 0.001, lng: 0 },
              ],
              map,
            });
          }
        }}
        options={() => ({
          disableDefaultUI: true,
          gestureHandling: 'none',
          keyboardShortcuts: false,
          clickableIcons: false,
        })}
      />
    </div>
  );
};

export default GoogleMapsPreWarmer;
