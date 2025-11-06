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

/* Hook for Google Places autocomplete integration, based on AddFarm */

import { useRef, useCallback, useState } from 'react';
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
  initiallyValid?: boolean;
}

export const useGooglePlacesAutocomplete = ({
  inputId,
  onPlaceSelected,
  types = ['address'],
  initiallyValid = false,
}: UseGooglePlacesAutocompleteParams) => {
  const placesAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [hasValidPlace, setHasValidPlace] = useState(initiallyValid);

  const handlePlaceChanged = useCallback(() => {
    const place = placesAutocompleteRef.current?.getPlace();
    if (place?.geometry?.location && place?.address_components) {
      setHasValidPlace(true);
      onPlaceSelected({
        place,
        formattedAddress: place.formatted_address,
        addressComponents: place.address_components,
        geometry: place.geometry,
      });
    } else {
      setHasValidPlace(false);
    }
  }, [onPlaceSelected]);

  const clearValidPlace = useCallback(() => {
    setHasValidPlace(false);
  }, []);

  const initAutocomplete = useCallback(() => {
    const options = {
      types,
      language: getLanguageFromLocalStorage(),
    };

    placesAutocompleteRef.current = new window.google.maps.places.Autocomplete(
      document.getElementById(inputId) as HTMLInputElement,
      options,
    );

    placesAutocompleteRef.current.setFields(['geometry', 'formatted_address', 'address_component']);

    placesAutocompleteRef.current.addListener('place_changed', handlePlaceChanged);
  }, [inputId, types, handlePlaceChanged]);

  return {
    initAutocomplete,
    autocompleteRef: placesAutocompleteRef,
    hasValidPlace,
    clearValidPlace,
  };
};
