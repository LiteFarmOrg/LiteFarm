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

import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useGoogleMapsLoader } from '../../../hooks/useGoogleMapsLoader';
import {
  SelectedAddressInfo,
  useGooglePlacesAutocomplete,
} from '../../../hooks/useGooglePlacesAutocomplete';
import { isLatLng, reverseGeocode } from '../../../util/google-maps/reverseGeocode';
import Input, { getInputErrors } from '../../Form/Input';
import { hookFormMaxCharsValidation } from '../../Form/hookformValidationUtils';
import {
  DIRECTORY_INFO_FIELDS,
  MarketDirectoryInfoFormFields,
} from '../../../containers/Profile/FarmSettings/MarketDirectory/InfoForm/types';
import { FormMode } from '../../../containers/Profile/FarmSettings/MarketDirectory/InfoForm/index';

// Store address validity in a form field, mirroring grid_points in AddFarm
const VALID_PLACE = DIRECTORY_INFO_FIELDS.VALID_PLACE;

interface AddressInputProps {
  formMode: FormMode;
}

const AddressInput = ({ formMode }: AddressInputProps) => {
  const { t } = useTranslation();
  const readonly = formMode === FormMode.READONLY;

  const {
    register,
    setValue,
    trigger,
    getValues,
    formState: { errors },
  } = useFormContext<MarketDirectoryInfoFormFields>();

  const { isLoaded } = useGoogleMapsLoader(['places']);

  // Geocode initial lat/lng address if needed
  const handleGeocode = () => {
    const address = getValues(DIRECTORY_INFO_FIELDS.ADDRESS);

    if (address && isLatLng(address)) {
      reverseGeocode(address).then((formattedAddress) => {
        setValue(DIRECTORY_INFO_FIELDS.ADDRESS, formattedAddress, {
          shouldValidate: true,
        });
      });
    }
  };

  // Register valid_place with the error we want to show on Address
  useEffect(() => {
    register(VALID_PLACE, {
      validate: (value) => value || t('MARKET_DIRECTORY.INFO_FORM.INVALID_ADDRESS'),
    });
    setValue(VALID_PLACE, true);
  }, []);

  // Handle place selection from autocomplete
  const updateAddressFromAutocomplete = ({ formattedAddress }: SelectedAddressInfo) => {
    setValue(DIRECTORY_INFO_FIELDS.ADDRESS, formattedAddress ?? '', {
      shouldValidate: true,
    });
    setValue(VALID_PLACE, !!formattedAddress, { shouldValidate: true });
  };

  const { initAutocomplete, cleanup } = useGooglePlacesAutocomplete({
    inputId: 'market-directory-address',
    onPlaceSelected: updateAddressFromAutocomplete,
    types: ['address'],
  });

  // Handle manual address input change
  const handleAddressChange = () => {
    setValue(VALID_PLACE, false);
  };

  const handleAddressBlur = () => {
    // Follow AddFarm pattern and validate after delay
    setTimeout(() => {
      trigger(DIRECTORY_INFO_FIELDS.VALID_PLACE);
    }, 100);
  };

  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    handleGeocode();
    if (formMode !== FormMode.READONLY) {
      initAutocomplete();
      return cleanup;
    }
  }, [isLoaded, formMode]);

  return (
    <Input
      label={t('MARKET_DIRECTORY.INFO_FORM.FARM_STORE_LOCATION')}
      hookFormRegister={register(DIRECTORY_INFO_FIELDS.ADDRESS, {
        required: true,
        maxLength: hookFormMaxCharsValidation(255),
        setValueAs: (value) => value.trim(),
      })}
      errors={
        getInputErrors(errors, DIRECTORY_INFO_FIELDS.ADDRESS) || getInputErrors(errors, VALID_PLACE)
      }
      disabled={readonly}
      id="market-directory-address"
      autoComplete="off"
      placeholder={t('ADD_FARM.ENTER_LOCATION_PLACEHOLDER')}
      onChange={handleAddressChange}
      onBlur={handleAddressBlur}
    />
  );
};

export default AddressInput;
