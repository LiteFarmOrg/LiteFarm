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
import { useGooglePlacesAutocomplete } from '../../../hooks/useGooglePlacesAutocomplete';
import { isLatLng, reverseGeocode } from '../../../util/google-maps/reverseGeocode';
import Input, { getInputErrors } from '../../Form/Input';
import { hookFormMaxCharsValidation } from '../../Form/hookformValidationUtils';
import {
  DIRECTORY_INFO_FIELDS,
  MarketDirectoryInfoFormFields,
} from '../../../containers/Profile/FarmSettings/MarketDirectory/InfoForm/types';
import { FormMode } from '../../../containers/Profile/FarmSettings/MarketDirectory/InfoForm/index';

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

  // Geocode lat/lng address if needed
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

  // Handle place selection from autocomplete
  const handlePlaceSelected = ({ formattedAddress }: { formattedAddress?: string }) => {
    setValue(DIRECTORY_INFO_FIELDS.ADDRESS, formattedAddress ?? '', {
      shouldValidate: true,
    });
  };

  // Initialize autocomplete hook
  const { initAutocomplete, hasValidPlace, clearValidPlace } = useGooglePlacesAutocomplete({
    inputId: 'market-directory-address',
    onPlaceSelected: handlePlaceSelected,
    types: ['address'],
    initiallyValid: !!getValues(DIRECTORY_INFO_FIELDS.ADDRESS),
  });

  // Handle manual address input change
  const handleAddressChange = () => {
    clearValidPlace();
  };

  const handleAddressBlur = () => {
    // Follow AddFarm pattern and validate after delay
    setTimeout(() => {
      trigger(DIRECTORY_INFO_FIELDS.ADDRESS);
    }, 100);
  };

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    handleGeocode();
    if (formMode !== FormMode.READONLY) {
      initAutocomplete();
    }
  }, [isLoaded, formMode]);

  return (
    <Input
      label={t('MARKET_DIRECTORY.INFO_FORM.FARM_STORE_LOCATION')}
      hookFormRegister={register(DIRECTORY_INFO_FIELDS.ADDRESS, {
        required: true,
        maxLength: hookFormMaxCharsValidation(255),
        setValueAs: (value) => value.trim(),
        validate: () => hasValidPlace || t('MARKET_DIRECTORY.INFO_FORM.INVALID_ADDRESS'),
      })}
      errors={getInputErrors(errors, DIRECTORY_INFO_FIELDS.ADDRESS)}
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
