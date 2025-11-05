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

import { useRef, useCallback } from 'react';
import { getLanguageFromLocalStorage } from '../util/getLanguageFromLocalStorage';

type PlaceSelectedData = {
  place: google.maps.places.PlaceResult;
  formattedAddress?: string;
  addressComponents?: google.maps.GeocoderAddressComponent[];
  geometry?: google.maps.places.PlaceGeometry;
};

interface UseGooglePlacesAutocompleteParams {
  inputId: string;
  onPlaceSelected: (data: PlaceSelectedData) => void;
  types?: string[];
}

export const useGooglePlacesAutocomplete = ({
  inputId,
  onPlaceSelected,
  types = ['address'],
}: UseGooglePlacesAutocompleteParams) => {
  const placesAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const handlePlaceChanged = useCallback(() => {
    const place = placesAutocompleteRef.current?.getPlace();
    if (place?.geometry?.location && place?.address_components) {
      onPlaceSelected({
        place,
        formattedAddress: place.formatted_address,
        addressComponents: place.address_components,
        geometry: place.geometry,
      });
    }
  }, [onPlaceSelected]);

  // Call this function after Google Maps script loads
  const initAutocomplete = useCallback(() => {
    const options = {
      types,
      language: getLanguageFromLocalStorage(),
    };

    // Initialize Google Autocomplete
    placesAutocompleteRef.current = new window.google.maps.places.Autocomplete(
      document.getElementById(inputId) as HTMLInputElement,
      options,
    );

    // Avoid paying for data that you don't need by restricting the set of
    // place fields that are returned to just the address components and formatted
    // address.
    placesAutocompleteRef.current.setFields(['geometry', 'formatted_address', 'address_component']);

    // Fire Event when a suggested name is selected
    placesAutocompleteRef.current.addListener('place_changed', handlePlaceChanged);
  }, [inputId, types, handlePlaceChanged]);

  return {
    initAutocomplete,
    autocompleteRef: placesAutocompleteRef,
  };
};
