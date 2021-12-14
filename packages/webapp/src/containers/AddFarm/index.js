import { useForm } from 'react-hook-form';
import React, { useEffect, useState } from 'react';
import Script from 'react-load-script';
import GoogleMap from 'google-map-react';
import { VscLocation } from 'react-icons/vsc';
import { useDispatch, useSelector } from 'react-redux';
import {
  userFarmReducerSelector,
  userFarmSelector,
  userFarmsByUserSelector,
} from '../userFarmSlice';

import PureAddFarm from '../../components/AddFarm';
import { patchFarm, postFarm } from './saga';
import { ReactComponent as MapPin } from '../../assets/images/signUp/map_pin.svg';
import { ReactComponent as MapErrorPin } from '../../assets/images/signUp/map_error_pin.svg';
import { ReactComponent as LoadingAnimation } from '../../assets/images/signUp/animated_loading_farm.svg';
import { useTranslation } from 'react-i18next';
import { getLanguageFromLocalStorage } from '../../util/getLanguageFromLocalStorage';
import history from '../../history';

const AddFarm = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const farm = useSelector(userFarmSelector);
  const farms = useSelector(userFarmsByUserSelector);
  const isFirstFarm = !farms.length;
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
  } = useForm({ mode: 'onTouched' });
  const FARMNAME = 'farmName';
  const ADDRESS = 'address';
  const GRID_POINTS = 'gridPoints';
  const COUNTRY = 'country';
  const gridPoints = watch(GRID_POINTS, '{}');
  const disabled = !isValid;
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const farmNameRegister = register(FARMNAME, {
    required: { value: true, message: t('ADD_FARM.FARM_IS_REQUIRED') },
  });
  const addressRegister = register(ADDRESS, {
    validate: {
      placeSelected: () => !!getValues(GRID_POINTS),
      countryFound: () => !!getValues(COUNTRY)
    },
  });
  const gridPointsRegister = register(GRID_POINTS, {});
  const countryRegister = register(COUNTRY, {});
  const errorMessage = {
    required: t('ADD_FARM.ADDRESS_IS_REQUIRED'),
    placeSelected: t('ADD_FARM.ENTER_A_VALID_ADDRESS'),
    countryFound: t('ADD_FARM.INVALID_FARM_LOCATION'),
    noAddress: t('ADD_FARM.NO_ADDRESS'),
    geolocationDisabled: t('ADD_FARM.DISABLE_GEO_LOCATION'),
  };

  const addressErrors = errors[ADDRESS] && errorMessage[errors[ADDRESS]?.type];

  useEffect(() => {
    setValue(FARMNAME, farm?.farm_name ? farm.farm_name : '');
    setValue(ADDRESS, farm?.address ? farm.address : '');
    setValue(GRID_POINTS, farm?.grid_points ? JSON.stringify(farm.grid_points) : '{}');
    setValue(COUNTRY, farm?.country ? farm.country : '');
    if (farm?.country) {
      trigger(); // Enables submit button after goBack to this page
    }
  }, [farm.address, farm.country, farm.farm_name, farm.grid_points, setValue, trigger]);

  const onSubmit = (data) => {
    const farmInfo = {
      ...data,
      gridPoints: JSON.parse(gridPoints),
      farm_id: farm ? farm.farm_id : undefined,
    };
    farm.farm_id ? dispatch(patchFarm(farmInfo)) : dispatch(postFarm(farmInfo));
  };

  const onGoBack = () => {
    history.push('/farm_selection');
  };

  let autocomplete;
  const handleScriptLoad = () => {
    const options = {
      types: ['address'],
      language: getLanguageFromLocalStorage(),
    };

    // Initialize Google Autocomplete
    autocomplete = new google.maps.places.Autocomplete(
      document.getElementById('autocomplete'),
      options,
    );

    // Avoid paying for data that you don't need by restricting the set of
    // place fields that are returned to just the address components and formatted
    // address.
    autocomplete.setFields(['geometry', 'formatted_address', 'address_component']);

    // Fire Event when a suggested name is selected
    autocomplete.addListener('place_changed', handlePlaceChanged);
  };

  const setCountryNotFoundError = () => {
    setError(ADDRESS, { type: 'countryFound' });
  };

  const setCountryFromLatLng = (latlng, callback) => {
    const { lat, lng } = latlng;
    setValue(GRID_POINTS, JSON.stringify({ lat, lng }));

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status !== 'OK') {
        setCountryNotFoundError();
        callback?.();
        return;
      }

      let country;
      for (const place of results) {
        const countryComponent = place.address_components.find((component) =>
          component.types.includes('country'),
        );
        if (countryComponent) {
          country = countryComponent.long_name;
          break;
        }
      }

      if (country) {
        setValue(COUNTRY, country);
        trigger(ADDRESS);
      } else {
        setCountryNotFoundError();
      }

      callback?.();
    });
  };

  const parseLatLng = (latLngString) => {
    const coordRegex = /^(-?\d+(?:\.\d+)?)[,\s]\s*(-?\d+(\.\d+)?)$/;
    const matches = coordRegex.exec(latLngString);
    if (!matches) return null;

    const result = { lat: parseFloat(matches[1]), lng: parseFloat(matches[2]) };
    return Number.isNaN(result.lat) || Number.isNaN(result.lng) || result.lat < -90 || result.lat > 90 || result.lng < -180 || result.lng > 180
      ? null
      : result;
  };

  const handleAddressChange = (e) => {
    setValue(GRID_POINTS, '{}');
    setValue(COUNTRY, '');
    setValue(ADDRESS, e.target.value);
    const latlng = parseLatLng(e.target.value);
    if (latlng) {
      setCountryFromLatLng(latlng);
    } else {
      trigger(ADDRESS);
    }
  };

  const handlePlaceChanged = () => {
    const place = autocomplete.getPlace();

    if (place?.geometry?.location) {
      const countryLookup = place.address_components.find((component) =>
        component.types.includes('country'),
      ).long_name;

      setValue(ADDRESS, place.formatted_address);
      setValue(GRID_POINTS, JSON.stringify({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      }));
      setValue(COUNTRY, countryLookup);
      trigger(ADDRESS);
    } else {
      setCountryNotFoundError();
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
    setValue(ADDRESS, `${lat}, ${lng}`);
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
        url={`https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places,drawing,geometry&language=en-US`}
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
            errors: errors[FARMNAME] && errors[FARMNAME].message,
          },
          {
            label: t('ADD_FARM.FARM_LOCATION'),
            placeholder: t('ADD_FARM.ENTER_LOCATION_PLACEHOLDER'),
            info: t('ADD_FARM.FARM_LOCATION_INPUT_INFO'),
            icon: isGettingLocation ? (
              <span>{t('ADD_FARM.LOCATING')}</span>
            ) : (
              <VscLocation size={27} onClick={getGeoLocation} />
            ),
            hookFormRegister: addressRegister,
            id: 'autocomplete',
            name: ADDRESS,
            errors: addressErrors,
            onChange: handleAddressChange,
          },
          {
            label: 'gridPoints',
            hookFormRegister: gridPointsRegister,
            name: GRID_POINTS,
          }, {
            label: 'country',
            hookFormRegister: countryRegister,
            name: COUNTRY,
          },
        ]}
        map={
          <Map
            gridPoints={gridPoints ? JSON.parse(gridPoints) : {}}
            isGettingLocation={isGettingLocation}
            errors={addressErrors}
          />
        }
      />
    </>
  );
};

function Map({ gridPoints, errors, isGettingLocation }) {
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
      {(!isGettingLocation && gridPoints && gridPoints.lat && (
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