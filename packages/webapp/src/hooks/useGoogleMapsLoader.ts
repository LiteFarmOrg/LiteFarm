/*
 *  Copyright 2025 LiteFarm.org
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

/* Load the Google Maps API without already loaded errors when using on multiple views */
import { useEffect, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

let optionsInitialized = false;
if (!optionsInitialized) {
  setOptions({
    key: GOOGLE_MAPS_API_KEY,
    language: 'en-US',
  });
  optionsInitialized = true;
}

export const useGoogleMapsLoader = (libraries = ['places', 'drawing', 'geometry']) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadLibraries = async () => {
      // Load all libraries in parallel
      await Promise.all(libraries.map((lib) => importLibrary(lib)));
      setIsLoaded(true);
    };

    loadLibraries();
  }, [libraries.join(',')]);

  return { isLoaded };
};
