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

// Add Farm page without Google. Used when VITE_MAP_PROVIDER=maplibre.
// Address search and country lookup use util/geocoding (Photon or Nominatim); the preview is MapLibre.
// The form behaviour mirrors ./index.jsx, which keeps the Google version.

import { useForm } from 'react-hook-form';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VscLocation } from 'react-icons/vsc';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  userFarmReducerSelector,
  userFarmsByUserSelector,
  userFarmSelector,
} from '../userFarmSlice';
import useFarmListRecovery from './useFarmListRecovery';
import PureAddFarm from '../../components/AddFarm';
import { patchFarm, postFarm } from './saga';
import MapLibrePreview from './MapLibrePreview';
import { pick } from '../../util/pick';
import { useGeocodeSuggestions } from '../../hooks/useGeocodeSuggestions';
import { parseLatLng, reverseCountry, SEARCH_AS_YOU_TYPE } from '../../util/geocoding/geocoder';

const FARMNAME = 'farm_name';
const ADDRESS = 'address';
const GRID_POINTS = 'grid_points';
const COUNTRY = 'country';
const LISTBOX_ID = 'addFarm-address-suggestions';

const listStyle = {
  position: 'absolute',
  top: '-20px',
  left: 0,
  right: 0,
  zIndex: 10,
  margin: 0,
  padding: 0,
  listStyle: 'none',
  maxHeight: '240px',
  overflowY: 'auto',
  backgroundColor: 'var(--white, #fff)',
  border: '1px solid var(--grey400)',
  borderRadius: '4px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
};
const itemStyle = { padding: '10px 12px', cursor: 'pointer', fontSize: '14px' };
const noteStyle = { padding: '10px 12px', fontSize: '12px', color: 'var(--grey600)' };

const AddFarm = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const farm = useSelector(userFarmSelector);
  const farms = useSelector(userFarmsByUserSelector);
  const isFirstFarm = !farms.length;
  useFarmListRecovery();
  const mainUserFarmSelector = useSelector(userFarmReducerSelector);
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    setError,
    watch,
    trigger,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onBlur',
    defaultValues: pick(farm, [FARMNAME, ADDRESS, GRID_POINTS, COUNTRY]),
  });

  const gridPoints = watch(GRID_POINTS);
  const disabled = !isValid;
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const geolocationRequestIdRef = useRef(0);
  const [listOpen, setListOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const { suggestions, isLoading, hasError, hasSearched, search, searchNow, clear } =
    useGeocodeSuggestions();

  const farmNameRegister = register(FARMNAME, {
    required: { value: true, message: t('ADD_FARM.FARM_IS_REQUIRED') },
  });
  const addressRegister = register(ADDRESS, {
    required: { value: true, message: t('ADD_FARM.ADDRESS_IS_REQUIRED') },
  });
  register(GRID_POINTS, {
    required: { value: true, message: t('ADD_FARM.ENTER_A_VALID_ADDRESS') },
  });
  register(COUNTRY, {
    required: { value: true, message: t('ADD_FARM.INVALID_FARM_LOCATION') },
  });
  const errorMessage = {
    geolocationDisabled: t('ADD_FARM.DISABLE_GEO_LOCATION'),
  };

  const addressErrors =
    errors[ADDRESS]?.message ||
    errors[GRID_POINTS]?.message ||
    errors[COUNTRY]?.message ||
    errorMessage[errors[ADDRESS]?.type];

  const showFarmNameCharacterLimitExceededError = () => {
    setError(FARMNAME, {
      type: 'manual',
      message: t('ADD_FARM.FARM_NAME_ERROR'),
    });
  };

  const onSubmit = (data) => {
    const farmInfo = {
      ...data,
      gridPoints,
      farm_id: farm ? farm.farm_id : undefined,
      showFarmNameCharacterLimitExceededError,
    };
    farm.farm_id ? dispatch(patchFarm(farmInfo)) : dispatch(postFarm(farmInfo));
  };

  const onGoBack = () => {
    navigate('/farm_selection');
  };

  // Country lookup for a coordinate. Delayed so typing "49.25, -123.2" does not query per keystroke,
  // and a newer lookup cancels an older one.
  const reverseTimerRef = useRef();
  const reverseControllerRef = useRef();
  const cancelReverseLookup = useCallback(() => {
    clearTimeout(reverseTimerRef.current);
    reverseTimerRef.current = undefined;
    reverseControllerRef.current?.abort();
    reverseControllerRef.current = undefined;
  }, []);
  useEffect(() => cancelReverseLookup, [cancelReverseLookup]);

  const setCountryFromLatLng = (latlng, callback, delay = 500) => {
    cancelReverseLookup();
    const { lat, lng } = latlng;
    reverseTimerRef.current = setTimeout(async () => {
      reverseTimerRef.current = undefined;
      const controller = new AbortController();
      reverseControllerRef.current = controller;
      let country;
      try {
        country = await reverseCountry(lat, lng, { signal: controller.signal });
      } catch (error) {
        if (controller.signal.aborted) return;
      }
      if (controller.signal.aborted) return;
      setValue(GRID_POINTS, { lat, lng }, { shouldValidate: true });
      setValue(COUNTRY, country, { shouldValidate: true });
      callback?.();
    }, delay);
  };

  const handleAddressChange = (e) => {
    geolocationRequestIdRef.current += 1;
    cancelReverseLookup();
    setIsGettingLocation(false);
    const value = e.target.value;
    const latlng = parseLatLng(value);
    if (latlng) {
      clear();
      setListOpen(false);
      setCountryFromLatLng(latlng);
      return;
    }
    // Typing again invalidates a previously selected place until a suggestion is chosen.
    setValue(GRID_POINTS, undefined);
    setValue(COUNTRY, undefined);
    setActiveIndex(-1);
    setListOpen(true);
    if (SEARCH_AS_YOU_TYPE) {
      search(value);
    } else {
      clear();
    }
  };

  const handleAddressBlur = () => {
    setListOpen(false);
    setTimeout(() => {
      trigger([GRID_POINTS, COUNTRY]);
    }, 100);
  };

  const selectSuggestion = (suggestion) => {
    geolocationRequestIdRef.current += 1;
    cancelReverseLookup();
    setIsGettingLocation(false);
    clear();
    setListOpen(false);
    setActiveIndex(-1);
    setValue(ADDRESS, suggestion.label, { shouldValidate: true });
    if (suggestion.country) {
      setValue(GRID_POINTS, { lat: suggestion.lat, lng: suggestion.lng }, { shouldValidate: true });
      setValue(COUNTRY, suggestion.country, { shouldValidate: true });
    } else {
      setCountryFromLatLng({ lat: suggestion.lat, lng: suggestion.lng });
    }
  };

  const handleAddressKeyDown = (e) => {
    const count = suggestions.length;
    if (e.key === 'ArrowDown' && count) {
      e.preventDefault();
      setListOpen(true);
      setActiveIndex((index) => (index + 1) % count);
    } else if (e.key === 'ArrowUp' && count) {
      e.preventDefault();
      setListOpen(true);
      setActiveIndex((index) => (index <= 0 ? count - 1 : index - 1));
    } else if (e.key === 'Enter') {
      if (listOpen && count) {
        e.preventDefault();
        selectSuggestion(suggestions[activeIndex >= 0 ? activeIndex : 0]);
      } else if (!SEARCH_AS_YOU_TYPE && !parseLatLng(e.target.value)) {
        // Nominatim: search only when the user asks for it.
        e.preventDefault();
        setListOpen(true);
        searchNow(e.target.value);
      }
    } else if (e.key === 'Escape') {
      setListOpen(false);
    }
  };

  const handleGetGeoError = () => {
    setIsGettingLocation(false);
    setError(ADDRESS, {
      type: 'geolocationDisabled',
    });
  };

  const getGeoOptions = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 10000,
  };

  const handleGetGeoSuccess = (position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    clear();
    setListOpen(false);
    setValue(ADDRESS, `${lat}, ${lng}`, { shouldValidate: true });
    setCountryFromLatLng({ lat, lng }, () => setIsGettingLocation(false), 0);
  };

  const getGeoLocation = () => {
    const requestId = ++geolocationRequestIdRef.current;
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (requestId !== geolocationRequestIdRef.current) return;
        handleGetGeoSuccess(position);
      },
      () => {
        if (requestId !== geolocationRequestIdRef.current) return;
        handleGetGeoError();
      },
      getGeoOptions,
    );
  };

  const showList = listOpen && (suggestions.length || isLoading || hasError || hasSearched);

  const suggestionList = showList ? (
    <div style={{ position: 'relative', height: 0 }}>
      <ul id={LISTBOX_ID} role="listbox" data-cy="addFarm-suggestions" style={listStyle}>
        {suggestions.map((suggestion, index) => (
          <li
            key={`${suggestion.lat},${suggestion.lng},${suggestion.label}`}
            role="option"
            aria-selected={index === activeIndex}
            data-cy="addFarm-suggestion"
            style={{
              ...itemStyle,
              backgroundColor: index === activeIndex ? 'var(--grey200)' : undefined,
            }}
            // mousedown runs before the input blurs, so the pick is not lost to the blur handler.
            onMouseDown={(e) => {
              e.preventDefault();
              selectSuggestion(suggestion);
            }}
            onMouseEnter={() => setActiveIndex(index)}
          >
            {suggestion.label}
          </li>
        ))}
        {isLoading && !suggestions.length && (
          <li role="presentation" style={noteStyle}>
            {t('common:LOADING')}
          </li>
        )}
        {hasError && (
          <li role="presentation" style={noteStyle}>
            {t('ADD_FARM.ADDRESS_SEARCH_UNAVAILABLE')}
          </li>
        )}
        {hasSearched && !hasError && !isLoading && !suggestions.length && (
          <li role="presentation" style={noteStyle}>
            {t('ADD_FARM.NO_ADDRESS_RESULTS')}
          </li>
        )}
        {!!suggestions.length && (
          <li role="presentation" style={noteStyle}>
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
              onMouseDown={(e) => e.stopPropagation()}
            >
              © OpenStreetMap contributors
            </a>
          </li>
        )}
      </ul>
    </div>
  ) : null;

  return (
    <PureAddFarm
      onGoBack={isFirstFarm ? null : onGoBack}
      onSubmit={handleSubmit(onSubmit)}
      title={t('ADD_FARM.TELL_US_ABOUT_YOUR_FARM')}
      disabled={disabled}
      loading={mainUserFarmSelector.loading}
      inputs={[
        {
          label: t('ADD_FARM.FARM_NAME'),
          hookFormRegister: farmNameRegister,
          name: FARMNAME,
          errors: errors[FARMNAME]?.message,
        },
        {
          label: t('ADD_FARM.FARM_LOCATION'),
          placeholder: t('ADD_FARM.ENTER_LOCATION_PLACEHOLDER'),
          info: t('ADD_FARM.FARM_LOCATION_INPUT_INFO'),
          icon: isGettingLocation ? (
            <span>{t('ADD_FARM.LOCATING')}</span>
          ) : (
            <VscLocation data-cy="addFarm-mapPin" size={27} onClick={getGeoLocation} />
          ),
          hookFormRegister: addressRegister,
          id: 'autocomplete',
          name: ADDRESS,
          errors: addressErrors,
          onBlur: handleAddressBlur,
          onChange: handleAddressChange,
          onKeyDown: handleAddressKeyDown,
          autoComplete: 'off',
          role: 'combobox',
          'aria-autocomplete': 'list',
          'aria-expanded': !!showList,
          'aria-controls': LISTBOX_ID,
        },
      ]}
      belowLocationInput={suggestionList}
      map={
        <MapLibrePreview
          gridPoints={gridPoints || {}}
          isGettingLocation={isGettingLocation}
          errors={addressErrors}
        />
      }
    />
  );
};

export default AddFarm;
