import { useForm } from 'react-hook-form';
import React, { useState, useEffect } from 'react';
import Script from 'react-load-script';
import { VscLocation } from 'react-icons/vsc';
import { useDispatch, useSelector } from 'react-redux';
import { userFarmSelector } from '../userFarmSlice';

import PureAddFarm from '../../components/AddFarm';
import { patchFarm, postFarm } from './saga';
import { useTranslation } from 'react-i18next';

const coordRegex = /^(-?\d+(\.\d+)?)[,\s]\s*(-?\d+(\.\d+)?)$/;

const AddFarm = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const farm = useSelector(userFarmSelector);
  const { register, handleSubmit, getValues, setValue, errors, setError, clearErrors } = useForm();
  const FARMNAME = 'farmName';
  const ADDRESS = 'address';
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [address, setAddress] = useState(farm?.farm_name ? farm.farm_name : '');
  const [gridPoints, setGridPoints] = useState(farm?.grid_points ? farm.grid_points : {});
  const [country, setCountry] = useState(farm?.country ? farm.country : '');
  const ref0 = register({
    required: { value: true, message: t('ADD_FARM.FARM_IS_REQUIRED') },
  });
  const ref1 = register({
    required: { value: true, message: t('ADD_FARM.ADDRESS_IS_REQUIRED') },
    validate: {
      placeSelected: (data) => address && gridPoints && data[address],
      countryFound: (data) => country && data[address],
    },
  });
  const errorMessage = {
    required: t('ADD_FARM.ADDRESS_IS_REQUIRED'),
    placeSelected: t('ADD_FARM.ENTER_A_VALID_ADDRESS'),
    countryFound: t('ADD_FARM.INVALID_FARM_LOCATION'),
    noAddress: t('ADD_FARM.NO_ADDRESS'),
  };

  useEffect(() => {
    setValue(FARMNAME, farm?.farm_name ? farm.farm_name : '');
    setValue(ADDRESS, farm?.address ? farm.address : '');
  }, []);

  useEffect(() => {
    if (Object.keys(gridPoints)) {
      clearErrors(ADDRESS);
    }
  }, [gridPoints]);

  const onSubmit = (data) => {
    const farmInfo = {
      ...data,
      gridPoints,
      country,
      farm_id: farm ? farm.farm_id : undefined,
    };
    farm.farm_id ? dispatch(patchFarm(farmInfo)) : dispatch(postFarm(farmInfo));
  };

  let autocomplete;

  const handleScriptLoad = () => {
    const options = {
      types: ['address'],
      language: 'en-US',
    }; // To disable any eslint 'google not defined' errors

    // Initialize Google Autocomplete
    /*global google*/ autocomplete = new google.maps.places.Autocomplete(
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

  const setCountryFromLatLng = (latlng, callback) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === 'OK') {
        let place = results[0];
        const country = place.address_components.find((component) =>
          component.types.includes('country'),
        ).long_name;
        setCountry(country);
      } else {
        console.error(
          'Error getting geocoding results, or no country was found at given coordinates',
        );
        setError(ADDRESS, { type: 'countryFound' });
        setCountry('');
      }
      callback();
    });
  };

  const clearState = () => {
    setAddress('');
    setGridPoints({});
    setCountry('');
  };

  const handlePlaceChanged = () => {
    const gridPoints = {};
    const place = autocomplete.getPlace();
    // const coordRegex = /^(-?\d+(\.\d+)?)[,\s]\s*(-?\d+(\.\d+)?)$/;
    const isCoord = coordRegex.test(getValues(ADDRESS));

    if (!place.geometry && !isCoord) {
      setValue(ADDRESS, '');
      clearState();
      return;
    }
    if (isCoord) {
      return;
    }

    // const pieces = place.formatted_address.split(', ');
    // // get last part of address, which is the country
    // setCountry(pieces[pieces.length - 1]);
    const country = place.address_components.find((component) =>
      component.types.includes('country'),
    ).long_name;
    setCountry(country);

    setAddress(place.formatted_address);
    setValue(ADDRESS, place.formatted_address);
    gridPoints['lat'] = place.geometry.location.lat();
    gridPoints['lng'] = place.geometry.location.lng();
    setGridPoints(gridPoints);
  };

  const handleBlur = () => {
    const gridPoints = {};
    // const coordRegex = /^(-?\d+(\.\d+)?)[,\s]\s*(-?\d+(\.\d+)?)$/;
    const inputtedAddress = getValues(ADDRESS);
    const isCoord = coordRegex.test(inputtedAddress);
    if (isCoord) {
      // convert input to array of numbers
      let coords = inputtedAddress.split(/[,\s]\s*/).map((str) => parseFloat(str));
      // perform check on lat lng values
      let lat = coords[0];
      let lng = coords[1];
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        setError(ADDRESS, {
          type: 'placeSelected',
        });
        clearState();
        return;
      }

      // const geocoder = new google.maps.Geocoder();
      setCountryFromLatLng({ lat, lng }, () => {
        setAddress(inputtedAddress);
        gridPoints['lat'] = lat;
        gridPoints['lng'] = lng;
        setGridPoints(gridPoints);
      });
    } else {
      if (inputtedAddress !== address) clearState();
    }
  };

  const getGeoLocation = () => {
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(function (position) {
      let gridPoints = {};
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const formattedAddress = `${lat}, ${lng}`;
      setCountryFromLatLng({ lat, lng }, () => {
        gridPoints['lat'] = lat;
        gridPoints['lng'] = lng;
        setGridPoints(gridPoints);
        setAddress(formattedAddress);
        setValue(ADDRESS, formattedAddress);
        setIsGettingLocation(false);
      });
    });
  };

  return (
    <>
      <Script
        url={`https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places,drawing,geometry&language=en-US`}
        onLoad={handleScriptLoad}
      />
      <PureAddFarm
        onSubmit={handleSubmit(onSubmit)}
        title={t('ADD_FARM.TELL_US_ABOUT_YOUR_FARM')}
        inputs={[
          {
            label: t('ADD_FARM.FARM_NAME'),
            inputRef: ref0,
            name: FARMNAME,
            errors: errors[FARMNAME] && errors[FARMNAME].message,
          },
          {
            label: t('ADD_FARM.FARM_LOCATION'),
            info: t('ADD_FARM.FARM_LOCATION_INPUT_INFO'),
            icon: isGettingLocation ? (
              <span>Locating...</span>
            ) : (
              <VscLocation size={27} onClick={getGeoLocation} />
            ),
            inputRef: ref1,
            id: 'autocomplete',
            name: ADDRESS,
            clearErrors,
            errors: errors[ADDRESS] && errorMessage[errors[ADDRESS]?.type],
            onBlur: handleBlur,
          },
        ]}
        gridPoints={gridPoints}
        isGettingLocation={isGettingLocation}
      />
    </>
  );
};

export default AddFarm;
