import { useForm } from 'react-hook-form';
import React, { useEffect, useRef, useState } from 'react';
import Script from 'react-load-script';
import GoogleMap from 'google-map-react';
import { VscLocation } from 'react-icons/vsc';
import { useDispatch, useSelector } from 'react-redux';
import {
  userFarmReducerSelector,
  userFarmsByUserSelector,
  userFarmSelector,
} from '../userFarmSlice';

import PureAddFarm from '../../components/AddFarm';
import { patchFarm, postFarm } from './saga';
import MapPin from '../../assets/images/signUp/map_pin.svg';
import MapErrorPin from '../../assets/images/signUp/map_error_pin.svg';
import LoadingAnimation from '../../assets/images/signUp/animated_loading_farm.svg';
import { useTranslation } from 'react-i18next';
import { getLanguageFromLocalStorage } from '../../util/getLanguageFromLocalStorage';
import history from '../../history';
import { useThrottle } from '../hooks/useThrottle';
import { pick } from '../../util/pick';

const AddFarm = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const farm = useSelector(userFarmSelector);
  const farms = useSelector(userFarmsByUserSelector);
  const isFirstFarm = !farms.length;
  const mainUserFarmSelector = useSelector(userFarmReducerSelector);
  const FARMNAME = 'farm_name';
  const ADDRESS = 'address';
  const GRID_POINTS = 'grid_points';
  const COUNTRY = 'country';
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
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const farmNameRegister = register(FARMNAME, {
    required: { value: true, message: t('ADD_FARM.FARM_IS_REQUIRED') },
  });
  const addressRegister = register(ADDRESS, {
    required: { value: true, message: t('ADD_FARM.ADDRESS_IS_REQUIRED') },
  });
  const gridPointsRegister = register(GRID_POINTS, {
    required: { value: true, message: t('ADD_FARM.ENTER_A_VALID_ADDRESS') },
  });
  const countryRegister = register(COUNTRY, {
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
      showFarmNameCharacterLimitExceededError: showFarmNameCharacterLimitExceededError,
    };
    farm.farm_id ? dispatch(patchFarm(farmInfo)) : dispatch(postFarm(farmInfo));
  };

  const onGoBack = () => {
    history.push('/farm_selection');
  };

  const placesAutocompleteRef = useRef();
  const handleScriptLoad = () => {
    const options = {
      types: ['address'],
      language: getLanguageFromLocalStorage(),
    };

    // Initialize Google Autocomplete
    placesAutocompleteRef.current = new google.maps.places.Autocomplete(
      document.getElementById('autocomplete'),
      options,
    );

    // Avoid paying for data that you don't need by restricting the set of
    // place fields that are returned to just the address components and formatted
    // address.
    placesAutocompleteRef.current.setFields(['geometry', 'formatted_address', 'address_component']);

    // Fire Event when a suggested name is selected
    placesAutocompleteRef.current.addListener('place_changed', handlePlaceChanged);
    setScriptLoaded(true);
  };

  const geocoderRef = useRef();
  const geocoderTimeout = useThrottle();
  const setCountryFromLatLng = (latlng, callback) => {
    const { lat, lng } = latlng;
    if (!geocoderRef.current) {
      geocoderRef.current = new google.maps.Geocoder();
    }
    geocoderTimeout(
      () =>
        geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
          let country;
          status === 'OK' &&
            results.find((place) =>
              place?.address_components?.find((component) => {
                if (component?.types?.includes?.('country')) {
                  country = component.short_name;
                  return true;
                }
                return false;
              }),
            );
          setValue(GRID_POINTS, { lat, lng }, { shouldValidate: true });
          setValue(COUNTRY, country, { shouldValidate: true });
          callback?.();
        }),
      isGettingLocation ? 0 : 500,
    );
  };

  useEffect(() => {
    if (scriptLoaded && gridPoints && !getValues(COUNTRY)) {
      setCountryFromLatLng(gridPoints);
    }
  }, [scriptLoaded]);

  const parseLatLng = (latLngString) => {
    const coordRegex = /^(-?\d+(?:\.\d+)?)[,\s]\s*(-?\d+(\.\d+)?)$/;
    const matches = coordRegex.exec(latLngString);
    if (!matches) return null;

    const result = { lat: parseFloat(matches[1]), lng: parseFloat(matches[2]) };
    return Number.isNaN(result.lat) ||
      Number.isNaN(result.lng) ||
      result.lat < -90 ||
      result.lat > 90 ||
      result.lng < -180 ||
      result.lng > 180
      ? null
      : result;
  };

  const handleAddressChange = (e) => {
    const latlng = parseLatLng(e.target.value);
    if (latlng) {
      setCountryFromLatLng(latlng);
    } else {
      /**
       * GOOGLE MAP listener handlePlaceChanged is delayed, so gridPoints and country will be cleared before handlePlaceChanged is called.
       * Since forced validation is delayed by 100ms, clearing GRID_POINTS and COUNTRY would not trigger error before handlePlaceChanged is called.
       */
      setValue(GRID_POINTS, undefined);
      setValue(COUNTRY, undefined);
    }
  };

  const handleAddressBlur = () => {
    setTimeout(() => {
      trigger([GRID_POINTS, COUNTRY]);
    }, 100);
  };

  const handlePlaceChanged = () => {
    const place = placesAutocompleteRef.current.getPlace();
    if (place?.geometry?.location) {
      const countryLookup = place.address_components.find((component) =>
        component.types.includes('country'),
      )?.short_name;

      setValue(
        GRID_POINTS,
        {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        },
        { shouldValidate: true },
      );
      setValue(COUNTRY, countryLookup, { shouldValidate: true });
      setValue(ADDRESS, place.formatted_address, { shouldValidate: true });
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
    setValue(ADDRESS, `${lat}, ${lng}`, { shouldValidate: true });
    setCountryFromLatLng({ lat, lng }, () => {
      setIsGettingLocation(false);
    });
  };

  const getGeoLocation = () => {
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(handleGetGeoSuccess, handleGetGeoError, getGeoOptions);
  };
  return (
    <>
      <Script
        url={`https://maps.googleapis.com/maps/api/js?key=${
          import.meta.env.VITE_GOOGLE_MAPS_API_KEY
        }&libraries=places,drawing,geometry&language=en-US`}
        onLoad={handleScriptLoad}
      />
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
          },
        ]}
        map={
          <Map
            scriptLoaded={scriptLoaded}
            gridPoints={gridPoints || {}}
            isGettingLocation={isGettingLocation}
            errors={addressErrors}
          />
        }
      />
    </>
  );
};

function Map({ scriptLoaded, gridPoints, errors, isGettingLocation }) {
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
      {(scriptLoaded && !isGettingLocation && gridPoints && gridPoints.lat && (
        <GoogleMap
          style={{ flexGrow: 1 }}
          center={gridPoints}
          defaultZoom={17}
          yesIWantToUseGoogleMapApiInternals
          options={(maps) => ({
            mapTypeId: maps.MapTypeId.SATELLITE,
            disableDoubleClickZoom: true,
            zoomControl: true,
            streetViewControl: false,
            scaleControl: true,
            fullscreenControl: false,
          })}
        >
          <MapPinWrapper {...gridPoints} />
        </GoogleMap>
      )) || (
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

function MapPinWrapper() {
  return <MapPin style={{ display: 'absolute', transform: 'translate(-50%, -100%)' }} />;
}

export default AddFarm;

/* global google */
